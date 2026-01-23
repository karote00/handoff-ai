const fs = require("fs-extra");
const chalk = require("chalk");

async function statusCommand() {
  console.log(chalk.blue("Handoff AI Status:"));

  // Check if initialized
  if (!(await fs.pathExists("docs/ai/project"))) {
    console.log(chalk.red("❌ Handoff AI not initialized"));
    console.log("Run " + chalk.cyan("handoff-ai init") + " to get started.");
    return;
  }

  console.log(chalk.green("✅ Handoff AI initialized\n"));

  // Check configuration
  if (await fs.pathExists("docs/ai/project/handoff-config.md")) {
    try {
      const config = await fs.readFile(
        "docs/ai/project/handoff-config.md",
        "utf8",
      );

      // Extract current settings
      const modeMatch = config.match(/default_collaboration_mode:\s*(\w+)/);
      const engagementMatch = config.match(/engagement_level:\s*([\w-]+)/);
      const expertiseMatch = config.match(/human_expertise:\s*(\w+)/);
      const trustMatch = config.match(/ai_trust_level:\s*(\w+)/);

      console.log(chalk.green("Current Configuration:"));
      console.log(
        `• Collaboration Mode: ${chalk.cyan(modeMatch ? modeMatch[1] : "collaborate")}`,
      );
      console.log(
        `• Engagement Level: ${chalk.cyan(engagementMatch ? engagementMatch[1] : "medium-engagement")}`,
      );
      console.log(
        `• Expertise Level: ${chalk.cyan(expertiseMatch ? expertiseMatch[1] : "intermediate")}`,
      );
      console.log(
        `• AI Trust Level: ${chalk.cyan(trustMatch ? trustMatch[1] : "medium")}`,
      );
    } catch (error) {
      console.log(
        chalk.yellow("⚠️  Configuration file exists but couldn't be read"),
      );
    }
  } else {
    console.log(chalk.yellow("⚠️  No configuration file found"));
  }

  console.log("\n" + chalk.green("Available Files:"));

  // Check for key files
  const files = [
    { path: "docs/ai/project/handoff-config.md", name: "Configuration" },
    { path: "docs/ai/project/assumptions.md", name: "AI Assumptions Log" },
    { path: "docs/ai/project/ai-quick-start.md", name: "AI Quick Start Guide" },
    { path: "RELEASE_PROCESS.md", name: "Release Process Template" },
  ];

  for (const file of files) {
    if (await fs.pathExists(file.path)) {
      console.log(`✅ ${file.name}: ${chalk.gray(file.path)}`);
    } else {
      console.log(`❌ ${file.name}: ${chalk.gray(file.path + " (missing)")}`);
    }
  }

  // Check EPICs
  console.log("\n" + chalk.green("Available EPICs:"));
  if (await fs.pathExists("docs/ai/project/epics")) {
    try {
      const epics = await fs.readdir("docs/ai/project/epics");
      const epicFiles = epics.filter((file) => file.endsWith(".md"));

      if (epicFiles.length > 0) {
        for (const epic of epicFiles) {
          const epicName = epic.replace(".md", "").replace(/-/g, " ");
          console.log(
            `✅ ${epicName}: ${chalk.gray("docs/ai/project/epics/" + epic)}`,
          );
        }
      } else {
        console.log(chalk.yellow("⚠️  No EPIC files found"));
      }
    } catch (error) {
      console.log(chalk.yellow("⚠️  Could not read EPICs directory"));
    }
  } else {
    console.log(chalk.red("❌ EPICs directory missing"));
  }

  console.log(
    "\n" +
      chalk.blue(
        '💡 Use "handoff-ai config" to modify settings or "handoff-ai mode" to change collaboration mode.',
      ),
  );
}

module.exports = { statusCommand };
