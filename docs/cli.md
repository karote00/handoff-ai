# CLI Reference

Complete reference for all Handoff AI command-line interface commands.

## Installation

```bash
# Quick start (recommended)
npx handoff-ai start

# Global installation
npm install -g handoff-ai

# Verify installation
handoff-ai --version
```

## Global Options

All commands support these global options:

```bash
-V, --version    # Show version number
-h, --help       # Display help information
```

## Commands Overview

| Command | Description | Status |
|---------|-------------|---------|
| `start` | Quick start guide for new users | ✅ |
| `init` | Initialize Handoff in your project | ✅ |
| `config` | Configure Handoff settings | ✅ |
| `status` | Show Handoff status and configuration | ✅ |
| `templates` | List available templates | ✅ |
| `inject-docs` | Inject documentation into code | ✅ |
| `mode` | View or set collaboration mode | ✅ |
| `review` | Context-aware code review preparation | ✅ |
| `doc:new` | Interactively create a new project document | ✅ |
| `doc:validate` | Validate project documentation | ✅ |
| `doc:sync` | Generate documentation from source code | ✅ |

---

## `handoff-ai start`

Quick start guide for new users. Shows welcome message and basic usage instructions.

### Usage
```bash
handoff-ai start
```

### Example Output
```
🚀 Welcome to Handoff AI!

Get started with these steps:
1. Initialize: handoff-ai init
2. Configure: handoff-ai config  
3. Start collaborating with AI using your .project folder

For help: handoff-ai --help
```

---

## `handoff-ai init`

Initialize Handoff AI in your project by creating the `.project` folder structure and configuration files.

### Usage
```bash
handoff-ai init [options]
```

### Options
```bash
-t, --template <type>    # Template type: basic, full, team (default: basic)
```

### Examples
```bash
# Initialize with basic template
handoff-ai init

# Initialize with full template (all EPICs)
handoff-ai init --template full

# Initialize for team collaboration
handoff-ai init --template team
```

### What It Creates
```
.project/
├── handoff-config.md      # AI collaboration preferences
├── assumptions.md         # AI decision log
├── ai-quick-start.md      # Context for AI assistants
├── review-guide.md        # Code review guidelines
├── review-rules.md        # Custom review criteria
└── epics/                 # Structured workflows
    ├── collaborative-documentation.md
    ├── codebase-improvement.md
    ├── feature-implementation.md
    └── codebase-exploration.md
```

---

## `handoff-ai config`

Configure Handoff AI settings interactively. Updates your collaboration preferences and AI interaction style.

### Usage
```bash
handoff-ai config
```

### Interactive Configuration
The command will prompt you for:

1. **Collaboration Mode:**
   - `collaborate` - Rich interaction, validates assumptions
   - `automatic` - Minimal interaction, works independently  
   - `guided` - Structured decision-making with options
   - `review-only` - Batch feedback on completed tasks

2. **Engagement Level:** (Legacy setting)
   - `high-engagement` - Collaborative, detailed input
   - `medium-engagement` - Guided with key approvals
   - `auto-pilot` - Autonomous with assumption logging

3. **Expertise Level:**
   - `expert` - Deep technical knowledge
   - `intermediate` - Some experience
   - `beginner` - Learning and need guidance

4. **AI Trust Level:**
   - `high` - AI can handle most tasks independently
   - `medium` - AI needs guidance on complex decisions
   - `low` - AI needs frequent validation and oversight

### Example Session
```bash
$ handoff-ai config
? What is your preferred collaboration mode? Collaborate
? What is your preferred engagement level? Medium Engagement
? What is your technical expertise level? Intermediate  
? What is your AI capability trust level? Medium

✅ Configuration updated successfully!

Your settings:
• Collaboration Mode: collaborate
• Engagement Level: medium-engagement
• Expertise Level: intermediate
• AI Trust Level: medium
```

---

## `handoff-ai status`

Display current Handoff AI status, configuration, and available files.

### Usage
```bash
handoff-ai status
```

### Example Output
```bash
📊 Handoff AI Status

✅ Handoff AI initialized

Current Configuration:
• Collaboration Mode: collaborate
• Engagement Level: medium-engagement
• Expertise Level: intermediate
• AI Trust Level: medium

Available Files:
✅ Configuration: .project/handoff-config.md
✅ AI Assumptions Log: .project/assumptions.md
✅ AI Quick Start Guide: .project/ai-quick-start.md
✅ Release Process Template: RELEASE_PROCESS.md

Available EPICs:
✅ collaborative documentation: .project/epics/collaborative-documentation.md
✅ codebase improvement: .project/epics/codebase-improvement.md
✅ feature implementation: .project/epics/feature-implementation.md
✅ codebase exploration: .project/epics/codebase-exploration.md
```

---

## `handoff-ai templates`

List available project templates and their descriptions.

### Usage
```bash
handoff-ai templates
```

### Example Output
```bash
📋 Available Templates

✅ basic
   Minimal setup for small projects
   Files: config, assumptions, quick-start, 4 EPICs

✅ full  
   Comprehensive setup with all EPICs and advanced features
   Files: All basic files + additional documentation templates

✅ team
   Multi-developer collaboration setup
   Files: All full files + team-specific workflows
```

---

## `handoff-ai inject-docs`

Inject Handoff AI documentation back into your code as inline documentation (JSDoc, docstrings, etc.).

### Usage
```bash
handoff-ai inject-docs [options]
```

### Options
```bash
-d, --dry-run              # Show what would be changed without making changes
-f, --files <pattern>      # File pattern to process (e.g., "src/**/*.js")
-l, --language <lang>      # Force specific language detection (js, py, java, etc.)
```

### Examples
```bash
# Preview changes without applying them
handoff-ai inject-docs --dry-run

# Apply documentation to all supported files
handoff-ai inject-docs

# Target specific files
handoff-ai inject-docs --files "src/**/*.js"
handoff-ai inject-docs --files "lib/*.py"

# Force language detection
handoff-ai inject-docs --language typescript
handoff-ai inject-docs --language python
```

### Supported Languages
- **JavaScript/TypeScript:** JSDoc format
- **Python:** Docstrings
- **Java:** Javadoc
- **C#:** XML documentation comments
- **Go:** Go doc comments
- **Rust:** Rust doc comments
- **PHP:** PHPDoc
- **Ruby:** YARD documentation
- **C/C++:** Doxygen comments

### Example Output
```bash
🔍 Analyzing codebase for documentation opportunities...

📁 Processing: src/
✅ src/auth.js - Added 3 function docs
✅ src/utils.js - Added 2 function docs  
⚠️  src/legacy.js - Skipped (complex patterns)

📊 Summary:
• 5 functions documented
• 2 files updated
• 1 file skipped

💡 Run without --dry-run to apply changes
```

---

## `handoff-ai mode`

View or set the collaboration mode quickly without going through the full configuration process.

### Usage
```bash
handoff-ai mode [options]
```

### Options
```bash
-s, --set <mode>    # Set collaboration mode directly
-l, --list          # List available collaboration modes
```

### Examples
```bash
# View current mode
handoff-ai mode

# List all available modes
handoff-ai mode --list

# Set mode directly
handoff-ai mode --set collaborate
handoff-ai mode --set automatic
handoff-ai mode --set guided
handoff-ai mode --set review-only
```

### Available Modes
- **collaborate:** Rich interaction, validates assumptions
- **automatic:** Minimal interaction, works independently
- **guided:** Structured decision-making with options  
- **review-only:** Batch feedback on completed tasks

---

## `handoff-ai review`

Check documentation completeness and prepare for context-aware code review.

### Usage
```bash
handoff-ai review [options]
```

### Options
```bash
-d, --dry-run     # Show available context without performing review
-v, --verbose     # Show detailed context information
```

### Examples
```bash
# Check review readiness
handoff-ai review

# Show detailed context information
handoff-ai review --verbose

# Preview available context
handoff-ai review --dry-run
```

### Review Process
1. **Documentation Check:** Validates required and optional documentation
2. **Interactive Prompts:** Asks how to proceed if documentation is incomplete
3. **Context Loading:** Prepares project knowledge for AI review
4. **Mode Selection:** Chooses appropriate review approach

### Review Modes
- **Full Context:** All documentation available - comprehensive project-aware review
- **Partial Context:** Some documentation missing - hybrid approach
- **General Mode:** Like GitHub Copilot - basic code quality checks

### Example Output
```bash
🔍 Handoff AI Code Review

📋 Checking documentation completeness...
✅ Review Guide: .project/review-guide.md
✅ Review Rules: .project/review-rules.md
✅ Assumptions: .project/assumptions.md
✅ Configuration: .project/handoff-config.md

🔍 Ready for full context-aware code review!

Available context:
• 4 documentation files loaded
• Review guide: Available
• Custom rules: Available  
• Project assumptions: Available

🚀 Integration ready:
• Documentation context is loaded and ready
• Use this context in your AI agent for code review
• Review will be conducted in full mode
```

---

---

## Documentation Commands

Commands for creating, validating, and synchronizing documentation within the `.project` directory.

---

### `handoff-ai doc:new`

Interactively create a new project document (e.g., Epic, BDD, Golden Path) from a predefined template.

#### Usage
```bash
handoff-ai doc:new
```

#### Interactive Session Example
```bash
$ handoff-ai doc:new
? What type of documentation do you want to create? Epic
? What is the title of the Epic? My New Feature
? Provide a brief description: A feature to do amazing things.

Successfully created new document at: /path/to/your/project/.project/my-new-feature.md
```

---

### `handoff-ai doc:validate`

Validate all Markdown documentation within the `.project` directory. This command performs two checks:
1.  **Linting:** Enforces style and structure rules.
2.  **Link Checking:** Verifies that all internal links point to existing files.

#### Usage
```bash
handoff-ai doc:validate
```

#### Example Output
```bash
Running documentation validation...

[1/2] Running Markdown linter...
✅ No linting issues found.

[2/2] Checking for broken links...
Broken links found:
  - In "/path/to/.project/some-doc.md": link to "./non-existent.md" is broken.

Validation failed.
```

---

### `handoff-ai doc:sync`

Automatically generate or update documentation by extracting information from your source code. This initial version scans for JSDoc comments containing a `@feature` tag.

#### Usage
```bash
handoff-ai doc:sync
```

#### How It Works
1.  Scans `.js` files in the `lib/` directory.
2.  Looks for JSDoc comments like `/** @feature My Feature */`.
3.  Groups all comments by their feature tag.
4.  Creates or updates a corresponding Markdown file in `.project/features/`.

#### Example
Given this code in `lib/auth.js`:
```javascript
/**
 * @feature Authentication
 * @description Handles user login.
 */
function login() { /* ... */ }
```

Running `handoff-ai doc:sync` will create/update `.project/features/authentication.md` with the content from the comment block.

```bash
$ handoff-ai doc:sync
Running documentation synchronization...
Found 1 features. Writing files...
  - Wrote documentation for "Authentication" to /path/to/.project/features/authentication.md

Synchronization complete!
```

---

## Error Handling

### Common Error Messages

**Not Initialized:**
```bash
❌ Handoff AI not initialized
Run 'handoff-ai init' to get started.
```

**Missing Configuration:**
```bash
❌ No Handoff AI configuration found. Run "handoff-ai init" first.
```

**File Access Issues:**
```bash
❌ Failed to update configuration: Permission denied
```

### Troubleshooting

**Command Not Found:**
```bash
# If globally installed
npm list -g handoff-ai

# If using npx
npx handoff-ai --version

# Reinstall if needed
npm install -g handoff-ai
```

**Permission Issues:**
```bash
# Check file permissions
ls -la .project/

# Fix permissions if needed
chmod 644 .project/*.md
```

**Template Issues:**
```bash
# Verify template exists
handoff-ai templates

# Reinitialize if needed
rm -rf .project
handoff-ai init --template basic
```

---

## Advanced Usage

### Scripting and Automation

**Batch Operations:**
```bash
#!/bin/bash
# setup-handoff.sh

# Initialize multiple projects
for dir in project1 project2 project3; do
    cd $dir
    handoff-ai init --template full
    handoff-ai mode --set automatic
    cd ..
done
```

**CI/CD Integration:**
```bash
# In your CI pipeline
handoff-ai status || exit 1
handoff-ai inject-docs --dry-run || exit 1
```

### Configuration Management

**Backup Configuration:**
```bash
# Backup current setup
cp -r .project .project.backup

# Restore from backup
rm -rf .project
cp -r .project.backup .project
```

**Share Configuration:**
```bash
# Export configuration
tar -czf handoff-config.tar.gz .project/

# Import configuration
tar -xzf handoff-config.tar.gz
```

---

## Getting Help

### Built-in Help
```bash
# General help
handoff-ai --help

# Command-specific help
handoff-ai init --help
handoff-ai config --help
handoff-ai inject-docs --help
```

### Community Resources
- **GitHub Issues:** Report bugs and request features
- **Documentation:** Complete guides and examples
- **Examples:** Real-world usage patterns

### Support Channels
- **GitHub Discussions:** Community Q&A
- **Issue Tracker:** Bug reports and feature requests
- **Documentation:** Comprehensive guides and tutorials