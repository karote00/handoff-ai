const esprima = require('esprima');
const fs = require('fs').promises;
const path = require('path');

const SOURCE_DIR = path.join(process.cwd(), 'lib');
const TARGET_DIR = path.join(process.cwd(), '.project', 'features');

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

async function syncDocs() {
  console.log('Running documentation synchronization...');
  const features = {};

  try {
    await fs.mkdir(TARGET_DIR, { recursive: true });
    const files = await findJavaScriptFiles(SOURCE_DIR);

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const ast = esprima.parseModule(content, { comment: true, range: true });

      if (ast.comments) {
        for (const comment of ast.comments) {
          if (comment.type === 'Block' && comment.value.startsWith('*')) {
            const featureMatch = comment.value.match(/@feature\s+(.*)/);
            if (featureMatch) {
              const featureName = featureMatch[1].trim();
              if (!features[featureName]) {
                features[featureName] = [];
              }
              features[featureName].push(`/**${comment.value}*/`);
            }
          }
        }
      }
    }

    if (Object.keys(features).length === 0) {
        console.log('No @feature tags found in source files. Nothing to sync.');
        return;
    }

    console.log(`Found ${Object.keys(features).length} features. Writing files...`);

    for (const [featureName, comments] of Object.entries(features)) {
      const fileName = `${toKebabCase(featureName)}.md`;
      const outputPath = path.join(TARGET_DIR, fileName);
      const fileContent = `# Feature: ${featureName}\n\n${comments.join('\n\n---\n\n')}`;
      await fs.writeFile(outputPath, fileContent);
      console.log(`  - Wrote documentation for "${featureName}" to ${outputPath}`);
    }

    console.log('\nSynchronization complete!');
  } catch (error) {
    console.error('\nError during documentation synchronization:', error);
    process.exit(1);
  }
}

async function findJavaScriptFiles(dir) {
    let files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            if (item.name === 'node_modules') continue;
            files = files.concat(await findJavaScriptFiles(fullPath));
        } else if (item.isFile() && item.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    return files;
}

module.exports = syncDocs;
