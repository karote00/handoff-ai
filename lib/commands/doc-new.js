const inquirer = require('inquirer');
const fs = require('fs').promises;
const path = require('path');

const DOC_TYPES = {
  'Epic': {
    template: 'epic.md',
    questions: [
      { type: 'input', name: 'TITLE', message: 'What is the title of the Epic?' },
      { type: 'input', name: 'DESCRIPTION', message: 'Provide a brief description:' },
    ],
  },
  'BDD': {
    template: 'bdd.md',
    questions: [
      { type: 'input', name: 'TITLE', message: 'What is the title of the Feature?' },
      { type: 'input', name: 'SCENARIO', message: 'Describe the scenario:' },
    ],
  },
  'Golden Path': {
    template: 'golden-path.md',
    questions: [
      { type: 'input', name: 'TITLE', message: 'What is the title of the Golden Path?' },
      { type: 'input', name: 'OBJECTIVE', message: 'What is the objective?' },
      { type: 'input', name: 'OUTCOME', message: 'What is the expected outcome?' },
    ],
  },
};

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

async function createDoc() {
  const { docType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'docType',
      message: 'What type of documentation do you want to create?',
      choices: Object.keys(DOC_TYPES),
    },
  ]);

  const config = DOC_TYPES[docType];
  const answers = await inquirer.prompt(config.questions);

  try {
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'project-docs', config.template);
    let templateContent = await fs.readFile(templatePath, 'utf8');

    for (const [key, value] of Object.entries(answers)) {
      templateContent = templateContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const title = answers.TITLE || 'new-document';
    const fileName = `${toKebabCase(title)}.md`;
    const outputPath = path.join(process.cwd(), '.project', fileName);

    await fs.writeFile(outputPath, templateContent);
    console.log(`Successfully created new document at: ${outputPath}`);

  } catch (error) {
    console.error('Error creating document:', error);
    process.exit(1);
  }
}

module.exports = createDoc;
