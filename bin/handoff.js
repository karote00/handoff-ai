#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');

// Import command handlers
const { startCommand } = require('../lib/commands/start');
const { initCommand } = require('../lib/commands/init');
const { configCommand } = require('../lib/commands/config');
const { statusCommand } = require('../lib/commands/status');
const { templatesCommand } = require('../lib/commands/templates');
const { injectDocsCommand } = require('../lib/commands/inject-docs');
const { modeCommand } = require('../lib/commands/mode');
const { reviewCommand } = require('../lib/commands/review');
const createDoc = require('../lib/commands/doc-new');

// Read version from package.json
const packageJson = require('../package.json');

const program = new Command();

program
    .name('handoff-ai')
    .description('AI collaboration framework for persistent project knowledge')
    .version(packageJson.version);

// Show start command prominently when no command is given
if (process.argv.length === 2) {
    console.log(chalk.blue('🚀 Welcome to Handoff AI!\n'));
    console.log('Get started with: ' + chalk.cyan('handoff-ai start'));
    console.log('Or see all commands: ' + chalk.cyan('handoff-ai --help'));
    process.exit(0);
}

// Define all commands
program
    .command('start')
    .description('Quick start guide for new users')
    .action(startCommand);

program
    .command('init')
    .description('Initialize Handoff in your project')
    .option('-t, --template <type>', 'Template type (basic, full, team)', 'basic')
    .action(initCommand);

program
    .command('config')
    .description('Configure Handoff settings')
    .action(configCommand);

program
    .command('status')
    .description('Show Handoff status and configuration')
    .action(statusCommand);

program
    .command('templates')
    .description('List available templates')
    .action(templatesCommand);

program
    .command('inject-docs')
    .description('Inject Handoff documentation back into code as inline documentation')
    .option('-d, --dry-run', 'Show what would be changed without making changes')
    .option('-f, --files <pattern>', 'File pattern to process (e.g., "src/**/*.js")')
    .option('-l, --language <lang>', 'Force specific language detection (js, py, java, etc.)')
    .action(injectDocsCommand);

program
    .command('mode')
    .description('View or set collaboration mode')
    .option('-s, --set <mode>', 'Set collaboration mode (collaborate|automatic|guided|review-only)')
    .option('-l, --list', 'List available collaboration modes')
    .action(modeCommand);

program
    .command('review')
    .description('Check documentation completeness and prepare for context-aware code review')
    .option('-d, --dry-run', 'Show available context without performing review')
    .option('-v, --verbose', 'Show detailed context information')
    .action(reviewCommand);

program
    .command('doc:new')
    .description('Interactively create a new project document (Epic, BDD, etc.)')
    .action(require('../lib/commands/doc-new'));

program.parse();