const fs = require("fs-extra");
const chalk = require("chalk");
const path = require("path");
const inquirer = require("inquirer");

async function reviewCommand(options = {}) {
  console.log(chalk.blue("🔍 Handoff AI Code Review\n"));

  // Check if initialized
  if (!(await fs.pathExists("docs/ai/project"))) {
    console.log(chalk.red("❌ Handoff AI not initialized"));
    console.log("Run " + chalk.cyan("handoff-ai init") + " to get started.");
    return;
  }

  // Check documentation completeness
  console.log(chalk.blue("📋 Checking documentation completeness...\n"));

  const requiredDocs = [
    {
      path: "docs/ai/project/review-guide.md",
      name: "Review Guide",
      critical: true,
    },
    {
      path: "docs/ai/project/review-rules.md",
      name: "Review Rules",
      critical: true,
    },
    {
      path: "docs/ai/project/assumptions.md",
      name: "Assumptions",
      critical: true,
    },
    {
      path: "docs/ai/project/handoff-config.md",
      name: "Configuration",
      critical: true,
    },
  ];

  const optionalDocs = [
    { path: "docs/ai/project/design-principles.md", name: "Design Principles" },
    { path: "docs/ai/project/constraints.md", name: "Constraints" },
    { path: "docs/ai/project/golden-paths.md", name: "Golden Paths" },
    { path: "docs/ai/project/architecture.md", name: "Architecture" },
    { path: "docs/ai/project/bdd-features.md", name: "BDD Features" },
  ];

  let missingCritical = [];
  let missingOptional = [];
  let availableDocs = [];

  // Check required documentation
  for (const doc of requiredDocs) {
    if (await fs.pathExists(doc.path)) {
      console.log(`✅ ${doc.name}: ${chalk.gray(doc.path)}`);
      availableDocs.push(doc);
    } else {
      console.log(`❌ ${doc.name}: ${chalk.gray(doc.path + " (missing)")}`);
      missingCritical.push(doc);
    }
  }

  // Check optional documentation
  for (const doc of optionalDocs) {
    if (await fs.pathExists(doc.path)) {
      console.log(`✅ ${doc.name}: ${chalk.gray(doc.path)}`);
      availableDocs.push(doc);
    } else {
      console.log(`⚠️  ${doc.name}: ${chalk.gray(doc.path + " (optional)")}`);
      missingOptional.push(doc);
    }
  }

  // Check EPICs directory
  if (await fs.pathExists("docs/ai/project/epics")) {
    try {
      const epics = await fs.readdir("docs/ai/project/epics");
      const epicFiles = epics.filter((file) => file.endsWith(".md"));
      if (epicFiles.length > 0) {
        console.log(
          `✅ EPICs: ${chalk.gray(epicFiles.length + " files found")}`,
        );
        availableDocs.push({
          path: "docs/ai/project/epics",
          name: "EPICs",
          isDirectory: true,
        });
      }
    } catch (error) {
      console.log(
        `⚠️  EPICs: ${chalk.gray("directory exists but unreadable")}`,
      );
    }
  }

  console.log("");

  // Handle missing documentation with user choice
  let reviewMode = "contextual"; // contextual, partial, or general

  if (missingCritical.length > 0) {
    console.log(chalk.red("❌ Critical documentation missing:"));
    missingCritical.forEach((doc) => {
      console.log(`   • ${doc.name}`);
    });

    if (!options.dryRun) {
      console.log("");
      const answer = await inquirer.prompt([
        {
          type: "list",
          name: "reviewChoice",
          message: "How would you like to proceed with code review?",
          choices: [
            {
              name: "Generate missing docs first (recommended)",
              value: "generate",
            },
            { name: "Review with available docs only", value: "partial" },
            {
              name: "Review in general mode (like GitHub Copilot)",
              value: "general",
            },
            { name: "Cancel review", value: "cancel" },
          ],
        },
      ]);

      if (answer.reviewChoice === "cancel") {
        console.log(chalk.blue("👋 Review cancelled."));
        return;
      } else if (answer.reviewChoice === "generate") {
        console.log(
          "\n" +
            chalk.yellow(
              "💡 Generate missing documentation before running code review.",
            ),
        );
        console.log(
          "Use your AI agent to create these files based on your project.",
        );
        return;
      } else if (answer.reviewChoice === "general") {
        reviewMode = "general";
      } else {
        reviewMode = "partial";
      }
    } else {
      console.log(
        "\n" +
          chalk.yellow(
            "💡 Generate missing documentation before running code review.",
          ),
      );
      console.log(
        "Use your AI agent to create these files based on your project.",
      );
    }
  }

  if (missingOptional.length > 0 && reviewMode === "contextual") {
    console.log(chalk.yellow("⚠️  Optional documentation missing:"));
    missingOptional.forEach((doc) => {
      console.log(`   • ${doc.name}`);
    });

    if (!options.dryRun && missingCritical.length === 0) {
      console.log("");
      const answer = await inquirer.prompt([
        {
          type: "confirm",
          name: "proceedWithPartial",
          message: "Proceed with partial context review?",
          default: true,
        },
      ]);

      if (!answer.proceedWithPartial) {
        console.log(
          chalk.blue(
            "👋 Review cancelled. Generate optional docs for more comprehensive review.",
          ),
        );
        return;
      }
      reviewMode = "partial";
    } else if (missingCritical.length === 0) {
      console.log(
        "\n" +
          chalk.blue(
            "💡 Consider generating optional docs for more comprehensive review.",
          ),
      );
    }
  }

  console.log(chalk.green("✅ Documentation check complete!\n"));

  // Load review context
  console.log(chalk.blue("📖 Loading review context...\n"));

  const reviewContext = await loadReviewContext(availableDocs);

  if (options.dryRun) {
    console.log(chalk.cyan("🔍 Dry run - showing available context:\n"));
    displayReviewContext(reviewContext);
    return;
  }

  // Perform review based on selected mode
  if (reviewMode === "general") {
    console.log(chalk.blue("🔍 Ready for general code review!\n"));
    console.log(chalk.yellow("Review Mode: General (like GitHub Copilot)"));
    console.log("• Focus on common code quality issues");
    console.log("• Check for syntax errors and basic patterns");
    console.log("• Apply general best practices");
    console.log("• No project-specific context will be used");

    console.log("\n" + chalk.blue("💡 General review guidance:"));
    console.log("• Review code for common anti-patterns");
    console.log("• Check for security vulnerabilities");
    console.log("• Validate coding standards and formatting");
    console.log("• Suggest performance improvements where obvious");
  } else if (reviewMode === "partial") {
    console.log(chalk.blue("🔍 Ready for partial context review!\n"));
    console.log(chalk.yellow("Review Mode: Partial Context"));
    console.log(chalk.green("Available context:"));
    console.log(`• ${availableDocs.length} documentation files loaded`);
    console.log(
      `• Review guide: ${reviewContext.hasGuide ? "Available" : "Missing"}`,
    );
    console.log(
      `• Custom rules: ${reviewContext.hasRules ? "Available" : "Missing"}`,
    );
    console.log(
      `• Project assumptions: ${reviewContext.hasAssumptions ? "Available" : "Missing"}`,
    );

    console.log("\n" + chalk.blue("💡 Partial context guidance:"));
    console.log("• Use available documentation for context");
    console.log("• Apply general best practices for missing context");
    console.log("• Flag areas that might need additional documentation");
    console.log("• Focus on what can be validated with current knowledge");
  } else {
    console.log(chalk.blue("🔍 Ready for full context-aware code review!\n"));
    console.log(chalk.green("Review Mode: Full Context"));
    console.log(chalk.green("Available context:"));
    console.log(`• ${availableDocs.length} documentation files loaded`);
    console.log(
      `• Review guide: ${reviewContext.hasGuide ? "Available" : "Missing"}`,
    );
    console.log(
      `• Custom rules: ${reviewContext.hasRules ? "Available" : "Missing"}`,
    );
    console.log(
      `• Project assumptions: ${reviewContext.hasAssumptions ? "Available" : "Missing"}`,
    );

    console.log("\n" + chalk.blue("💡 Full context guidance:"));
    console.log("• Review against documented design principles");
    console.log("• Validate compliance with project constraints");
    console.log("• Check alignment with golden path patterns");
    console.log("• Ensure behavioral consistency with BDD features");
  }

  console.log("\n" + chalk.blue("🚀 Integration ready:"));
  console.log("• Documentation context is loaded and ready");
  console.log("• Use this context in your AI agent for code review");
  console.log(`• Review will be conducted in ${reviewMode} mode`);

  if (options.verbose) {
    console.log("\n" + chalk.gray("📋 Review context summary:"));
    displayReviewContext(reviewContext);
  }
}

async function loadReviewContext(availableDocs) {
  const context = {
    hasGuide: false,
    hasRules: false,
    hasAssumptions: false,
    documents: {},
    summary: {},
  };

  for (const doc of availableDocs) {
    if (doc.isDirectory) continue;

    try {
      const content = await fs.readFile(doc.path, "utf8");
      context.documents[doc.name] = {
        path: doc.path,
        content: content,
        size: content.length,
      };

      // Set flags for key documents
      if (doc.path.includes("review-guide")) context.hasGuide = true;
      if (doc.path.includes("review-rules")) context.hasRules = true;
      if (doc.path.includes("assumptions")) context.hasAssumptions = true;
    } catch (error) {
      console.log(
        chalk.yellow(`⚠️  Could not read ${doc.name}: ${error.message}`),
      );
    }
  }

  return context;
}

function displayReviewContext(context) {
  console.log(chalk.gray("📄 Loaded documents:"));
  Object.entries(context.documents).forEach(([name, doc]) => {
    const sizeKB = (doc.size / 1024).toFixed(1);
    console.log(`   • ${name}: ${sizeKB}KB`);
  });

  console.log(chalk.gray("\n🎯 Review capabilities:"));
  console.log(`   • Contextual review: ${context.hasGuide ? "✅" : "❌"}`);
  console.log(`   • Custom rules: ${context.hasRules ? "✅" : "❌"}`);
  console.log(
    `   • Project knowledge: ${context.hasAssumptions ? "✅" : "❌"}`,
  );
}

module.exports = { reviewCommand };
