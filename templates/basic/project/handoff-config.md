# Handoff Configuration

This file defines how AI agents should interact with humans in this project. It serves as the default behavior that can be overridden per session.

## Collaboration Mode System

**Current Setting**: `collaborate`

### Available Collaboration Modes

**collaborate** (Rich interaction)
- AI asks clarifying questions before proceeding
- Validates assumptions with human input
- Documents all decisions and reasoning
- Best for: Complex projects, critical decisions, learning scenarios

**automatic** (Minimal interaction)
- AI makes decisions independently
- Documents what it did and why
- Only asks for help when truly stuck
- Best for: Simple tasks, greenfield projects, routine work

**guided** (Structured decision-making)
- AI presents options with pros/cons
- Human chooses, AI executes
- Educational explanations provided
- Best for: Learning, team environments, knowledge transfer

**review-only** (Batch feedback)
- AI completes entire tasks
- Presents final result for review
- Human approves/rejects/requests changes
- Best for: High-trust scenarios, experienced developers, time pressure

### Mode Configuration

```yaml
# Default collaboration mode for all tasks
default_collaboration_mode: collaborate

# Mode overrides for specific EPICs
epic_modes:
  feature-implementation: collaborate
  codebase-exploration: automatic
  codebase-improvement: guided
  collaborative-documentation: review-only
  release-management: guided

# Context-based preferences
collaboration_preferences:
  new_project: automatic
  existing_project: collaborate
  team_environment: guided
  solo_development: automatic

# AI capability trust level
ai_trust_level: medium # low | medium | high

# Dynamic mode switching
allow_mode_switching: true
smart_mode_suggestions: true
```

## Legacy Engagement Levels (Still Supported)

**Current Setting**: `medium-engagement`

Available options:
- `high-engagement`: Maps to `collaborate` mode
- `medium-engagement`: Maps to `guided` mode  
- `auto-pilot`: Maps to `automatic` mode

## Project-Specific Preferences

### Human Expertise Level
**Setting**: `intermediate`
- `expert`: Assume deep architectural knowledge, use technical language
- `intermediate`: Provide context for complex decisions, offer multiple options
- `beginner`: Explain concepts, provide guided choices, use clear language

### Review Requirements
**Setting**: `key-decisions-only`
- `every-step`: Human reviews each phase before proceeding
- `key-decisions-only`: Human reviews major architectural decisions
- `final-review`: Human reviews completed work before commit
- `post-implementation`: Human can review and adjust after completion

### Documentation Depth
**Setting**: `comprehensive`
- `minimal`: Basic documentation for immediate needs
- `standard`: Good coverage of main components and patterns
- `comprehensive`: Detailed documentation including edge cases and rationale

### AI Autonomy Boundaries
**What AI can do without asking**:
- ✅ Analyze existing code patterns
- ✅ Generate documentation following established templates
- ✅ Make assumptions based on industry standards
- ✅ Create implementation plans

**What requires human approval**:
- ⚠️ Major architectural decisions
- ⚠️ Breaking changes to existing patterns
- ⚠️ External dependency additions
- ⚠️ Final commits to main branch

## Session Overrides

Humans can override these defaults by saying:
- "Use high-engagement mode for this task"
- "Go full auto-pilot on this"
- "I'm in a hurry, just make reasonable choices"
- "I want to review every step"

## Learning Preferences

**Feedback Style**: `direct`
- `direct`: Clear yes/no feedback, specific corrections
- `collaborative`: Discussion-based, explore alternatives together
- `educational`: Explain reasoning, help human learn architectural concepts