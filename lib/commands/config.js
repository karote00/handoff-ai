const fs = require("fs-extra");
const chalk = require("chalk");
const inquirer = require("inquirer");

async function configCommand() {
  if (!(await fs.pathExists("docs/ai/project/handoff-config.md"))) {
    console.log(
      chalk.red(
        '❌ No Handoff AI configuration found. Run "handoff-ai init" first.',
      ),
    );
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "collaborationMode",
      message: "What is your preferred collaboration mode?",
      choices: [
        {
          name: "Collaborate - Rich interaction, validates assumptions",
          value: "collaborate",
        },
        {
          name: "Automatic - Minimal interaction, works independently",
          value: "automatic",
        },
        {
          name: "Guided - Structured decision-making with options",
          value: "guided",
        },
        {
          name: "Review-only - Batch feedback on completed tasks",
          value: "review-only",
        },
      ],
    },
    {
      type: "list",
      name: "engagement",
      message: "What is your preferred engagement level? (Legacy setting)",
      choices: [
        {
          name: "High Engagement - Collaborative, detailed input",
          value: "high-engagement",
        },
        {
          name: "Medium Engagement - Guided with key approvals",
          value: "medium-engagement",
        },
        {
          name: "Auto-Pilot - Autonomous with assumption logging",
          value: "auto-pilot",
        },
      ],
    },
    {
      type: "list",
      name: "expertise",
      message: "What is your technical expertise level?",
      choices: [
        { name: "Expert - Deep technical knowledge", value: "expert" },
        { name: "Intermediate - Some experience", value: "intermediate" },
        { name: "Beginner - Learning and need guidance", value: "beginner" },
      ],
    },
    {
      type: "list",
      name: "aiTrust",
      message: "What is your AI capability trust level?",
      choices: [
        {
          name: "High - AI can handle most tasks independently",
          value: "high",
        },
        {
          name: "Medium - AI needs guidance on complex decisions",
          value: "medium",
        },
        {
          name: "Low - AI needs frequent validation and oversight",
          value: "low",
        },
      ],
    },
  ]);

  try {
    // Read current config
    let config = await fs.readFile(".project/handoff-config.md", "utf8");

    // Update collaboration mode
    config = config.replace(
      /default_collaboration_mode:\s*\w+/,
      `default_collaboration_mode: ${answers.collaborationMode}`,
    );

    // Update AI trust level
    config = config.replace(
      /ai_trust_level:\s*\w+/,
      `ai_trust_level: ${answers.aiTrust}`,
    );

    // Update legacy engagement level
    config = config.replace(
      /engagement_level:\s*[\w-]+/,
      `engagement_level: ${answers.engagement}`,
    );

    // Update expertise level
    config = config.replace(
      /human_expertise:\s*\w+/,
      `human_expertise: ${answers.expertise}`,
    );

    await fs.writeFile(".project/handoff-config.md", config, "utf8");

    console.log(chalk.green("\n✅ Configuration updated successfully!\n"));

    console.log("Your settings:");
    console.log(
      `• Collaboration Mode: ${chalk.cyan(answers.collaborationMode)}`,
    );
    console.log(`• Engagement Level: ${chalk.cyan(answers.engagement)}`);
    console.log(`• Expertise Level: ${chalk.cyan(answers.expertise)}`);
    console.log(`• AI Trust Level: ${chalk.cyan(answers.aiTrust)}`);

    console.log(
      "\n" +
        chalk.blue(
          '💡 You can change these settings anytime by running "handoff-ai config" again.',
        ),
    );
  } catch (error) {
    console.error(chalk.red("❌ Failed to update configuration:"));
    console.error(chalk.red(error.message));
  }
}

module.exports = { configCommand };
