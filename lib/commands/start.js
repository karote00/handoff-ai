const chalk = require("chalk");
const fs = require("fs-extra");

async function startCommand() {
  console.log(
    chalk.blue(
      "🚀 Welcome to Handoff AI - Foundation Layer for AI Collaboration\n",
    ),
  );

  // Check current project state
  const hasHandoffAI = await fs.pathExists("docs/ai/project");
  const hasClaudeMD = await fs.pathExists("CLAUDE.md");
  const hasCursorRules = await fs.pathExists(".cursorrules");
  const hasAiderConfig =
    (await fs.pathExists(".aider.conf.yml")) || (await fs.pathExists(".aider"));
  const hasContinueConfig = await fs.pathExists(".continue/config.json");

  console.log(chalk.green("📋 AI COLLABORATION SETUP INSTRUCTIONS"));
  console.log(
    chalk.gray(
      "═══════════════════════════════════════════════════════════════\n",
    ),
  );

  console.log(
    chalk.yellow(
      "🤖 FOR AI ASSISTANTS: Please follow these steps to help set up comprehensive project documentation:\n",
    ),
  );

  // Step 1: Context Discovery
  console.log(chalk.cyan("STEP 1: DISCOVER EXISTING CONTEXT"));
  console.log(
    "Please check if you have access to any project-specific configuration files:",
  );

  if (hasClaudeMD) {
    console.log("✅ CLAUDE.md detected - Read this for project overview");
  } else {
    console.log("• Look for CLAUDE.md (Claude-specific project context)");
  }

  if (hasCursorRules) {
    console.log("✅ .cursorrules detected - Read this for Cursor IDE context");
  } else {
    console.log("• Look for .cursorrules (Cursor IDE configuration)");
  }

  if (hasAiderConfig) {
    console.log(
      "✅ Aider config detected - Read this for AI pair programming context",
    );
  } else {
    console.log("• Look for .aider.conf.yml or .aider (Aider configuration)");
  }

  if (hasContinueConfig) {
    console.log(
      "✅ Continue config detected - Read this for VS Code AI context",
    );
  } else {
    console.log("• Look for .continue/config.json (Continue extension config)");
  }

  console.log(
    "• Check for any other AI-specific documentation or settings you can access",
  );
  console.log(
    "• Analyze the codebase structure to understand the project type and technologies\n",
  );

  // Step 2: Initialize Handoff AI
  console.log(chalk.cyan("STEP 2: INITIALIZE HANDOFF AI DOCUMENTATION"));
  if (hasHandoffAI) {
    console.log("✅ Handoff AI already initialized");
    console.log(
      "Execute: " +
        chalk.yellow("handoff-ai status") +
        " to check current configuration\n",
    );
  } else {
    console.log(
      "Execute: " +
        chalk.yellow("handoff-ai init") +
        " to create comprehensive project documentation structure",
    );
    console.log(
      "This will create a docs/ai/project/ folder with templates for detailed project knowledge\n",
    );
  }

  // Step 3: Collaborative Documentation
  console.log(chalk.cyan("STEP 3: COLLABORATE ON DETAILED DOCUMENTATION"));
  console.log(
    "Work with the human to create comprehensive project documentation:",
  );
  console.log("");
  console.log("📝 Key areas to document together:");
  console.log(
    "• " +
      chalk.green("Architectural Decisions") +
      " - Why certain technologies/patterns were chosen",
  );
  console.log(
    "• " +
      chalk.green("Constraints & Limitations") +
      " - Technical and business constraints",
  );
  console.log(
    "• " +
      chalk.green("Patterns & Conventions") +
      " - Code patterns, naming conventions, standards",
  );
  console.log(
    "• " +
      chalk.green("Workarounds & Edge Cases") +
      " - Real-world complexities and special handling",
  );
  console.log(
    "• " +
      chalk.green("Development Workflows") +
      " - How the team works, testing approaches, deployment",
  );
  console.log("");
  console.log("🤝 Collaboration approach:");
  console.log(
    "• Start with what you understand from existing context (Step 1)",
  );
  console.log("• Ask specific questions about areas needing more detail");
  console.log(
    '• Focus on capturing the "why" behind decisions, not just the "what"',
  );
  console.log("• Document real-world complexities that only the human knows");
  console.log("• Create comprehensive context that any AI can understand\n");

  // Step 4: Validation and Enhancement
  console.log(chalk.cyan("STEP 4: VALIDATE AND ENHANCE"));
  console.log("After documentation is created:");
  console.log(
    "• Execute: " +
      chalk.yellow("handoff-ai review") +
      " to check documentation completeness",
  );
  console.log(
    "• Execute: " +
      chalk.yellow("handoff-ai status") +
      " to verify configuration",
  );
  console.log(
    "• Test the enhanced context by asking for help with a small task",
  );
  console.log("• Iterate and improve based on what works well\n");

  // Human Instructions
  console.log(
    chalk.gray(
      "═══════════════════════════════════════════════════════════════",
    ),
  );
  console.log(chalk.green("👤 FOR HUMANS: How to use these instructions\n"));

  console.log(chalk.blue("In Terminal:"));
  console.log(
    "• Copy the AI instructions above and share with your AI assistant",
  );
  console.log("• Work through the steps together\n");

  console.log(chalk.blue("In IDE (Cursor, VS Code, etc.):"));
  console.log(
    '• Ask your AI: "Please run ' +
      chalk.yellow("handoff-ai start") +
      ' and follow the instructions"',
  );
  console.log(
    "• Your AI will see these instructions and guide the setup process\n",
  );

  console.log(chalk.blue("With AI CLI Tools:"));
  console.log(
    "• Ask your AI tool to execute " +
      chalk.yellow("handoff-ai start") +
      " and follow the output",
  );
  console.log(
    "• The AI will read these instructions and collaborate with you\n",
  );

  // Quick Reference
  console.log(
    chalk.gray(
      "═══════════════════════════════════════════════════════════════",
    ),
  );
  console.log(chalk.green("📚 QUICK REFERENCE\n"));

  console.log(chalk.blue("Essential Commands:"));
  console.log(
    "• " +
      chalk.cyan("handoff-ai init") +
      " - Initialize project documentation",
  );
  console.log(
    "• " +
      chalk.cyan("handoff-ai config") +
      " - Configure collaboration preferences",
  );
  console.log(
    "• " + chalk.cyan("handoff-ai status") + " - Check current setup",
  );
  console.log(
    "• " +
      chalk.cyan("handoff-ai review") +
      " - Validate documentation completeness",
  );
  console.log(
    "• " +
      chalk.cyan("handoff-ai inject-docs") +
      " - Sync documentation to code\n",
  );

  console.log(chalk.blue("Collaboration Modes:"));
  console.log(
    "• " +
      chalk.cyan("collaborate") +
      " - Rich interaction, validates assumptions",
  );
  console.log(
    "• " + chalk.cyan("guided") + " - Structured decision-making with options",
  );
  console.log(
    "• " +
      chalk.cyan("automatic") +
      " - Minimal interaction, works independently",
  );
  console.log(
    "• " + chalk.cyan("review-only") + " - Batch feedback on completed tasks\n",
  );

  console.log(
    chalk.yellow(
      "🎯 Goal: Create comprehensive project knowledge that makes ANY AI assistant dramatically more effective at understanding and working with your specific project.\n",
    ),
  );

  console.log(
    chalk.gray(
      "Foundation layer approach: We enhance your existing AI tools, we don't replace them.",
    ),
  );
}

module.exports = { startCommand };
