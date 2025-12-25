const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

const projectDir = path.join(process.cwd(), '.project');

async function validateDocs() {
  console.log('Running documentation validation...');

  let hasErrors = false;

  // 1. Markdown Linting
  try {
    console.log('\n[1/2] Running Markdown linter...');
    const { stdout, stderr } = await execPromise(`npx markdownlint "${projectDir}/**/*.md"`);
    if (stderr) {
      console.error('Linter errors found:');
      console.error(stderr);
      hasErrors = true;
    } else if (stdout) {
        console.log('Linter output:');
        console.log(stdout);
    }
    else {
      console.log('✅ No linting issues found.');
    }
  } catch (error) {
    console.error('Linter errors found:');
    console.error(error.stdout || error.stderr);
    hasErrors = true;
  }

  // 2. Broken Link Checking
  try {
    console.log('\n[2/2] Checking for broken links...');
    const files = await findMarkdownFiles(projectDir);
    const allFilePaths = new Set(files);
    const brokenLinks = [];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const links = content.match(/[\[][^\]]*?\]\((?!https?:\/\/)(.*?)\)/g) || [];

      for (const link of links) {
        const match = /[\[][^\]]*?\]\((?!https?:\/\/)(.*?)\)/.exec(link);
        if (match) {
          const linkPath = match[1].split('#')[0]; // Ignore anchor hashes
          if (linkPath) {
            const absoluteLinkPath = path.resolve(path.dirname(file), linkPath);
            if (!allFilePaths.has(absoluteLinkPath)) {
              brokenLinks.push(`  - In "${file}": link to "${linkPath}" is broken.`);
            }
          } 
        }
      }
    }

    if (brokenLinks.length > 0) {
      console.error('Broken links found:');
      brokenLinks.forEach(msg => console.error(msg));
      hasErrors = true;
    } else {
      console.log('✅ No broken links found.');
    }
  } catch (error) {
    console.error('\nError checking for broken links:', error);
    hasErrors = true;
  }


  if (hasErrors) {
    console.log('\nValidation failed.');
    process.exit(1);
  } else {
    console.log('\nValidation successful!');
  }
}

async function findMarkdownFiles(dir) {
    let files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files = files.concat(await findMarkdownFiles(fullPath));
        } else if (item.isFile() && item.name.endsWith('.md')) {
            files.push(fullPath);
        }
    }
    return files;
}


module.exports = validateDocs;
