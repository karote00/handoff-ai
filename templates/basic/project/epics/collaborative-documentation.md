# Collaborative Documentation EPIC: Handoff-Powered Documentation

This EPIC outlines a systematic process for generating comprehensive project documentation that serves as persistent knowledge for both humans and AI. It adapts to different levels of human engagement while ensuring consistent, valuable output.

## Goal

To produce a complete Handoff knowledge base including Architecture overviews, API references, Design Principles, Golden Paths, and BDD specifications that enable smooth knowledge transfer across team members and AI sessions.

## 🔍 Implementation-Area Pattern Communication Protocol

### **When AI Encounters Pattern Conflicts in Implementation Area**

**Only flag inconsistencies in code directly related to current implementation:**

**Scope of Analysis:**
- ✅ Files you need to modify for this feature
- ✅ Functions you need to integrate with
- ✅ Modules you need to extend or call
- ✅ Similar functionality you need to match
- ❌ Unrelated parts of the codebase
- ❌ Files you won't touch
- ❌ Legacy code that doesn't affect current work

**Communication Process:**
1. **Stop and inform user** about conflicts in the implementation area
2. **Show specific examples** from files you'll be working with
3. **Offer clear options** for the current implementation
4. **Get user approval** before continuing
5. **Document the decision** in assumptions.md for future reference

### **Communication Template**
```
⚠️ PATTERN INCONSISTENCY IN IMPLEMENTATION AREA

I found conflicting [pattern type] in the code I need to work with:

**Files I need to modify/integrate with:**
- File A (I need to modify): [specific example of pattern 1]
- File B (I need to integrate with): [specific example of pattern 2]  
- File C (similar functionality): [specific example of pattern 3]

**For this new implementation, I can:**
A) Follow Pattern 1 approach (matches File A I'm modifying)
B) Follow Pattern 2 approach (matches File B I'm integrating with)
C) Follow Pattern 3 approach (matches similar functionality)
D) Create adapter to work with existing patterns

**Which approach would you prefer?**
```

### **Common Pattern Conflicts to Watch For**
- **Async patterns**: callbacks vs promises vs async/await
- **Error handling**: exceptions vs error objects vs result types
- **Component patterns**: class vs functional components
- **State management**: local state vs global state vs context
- **API patterns**: REST vs GraphQL vs RPC
- **Testing patterns**: unit vs integration test approaches
- **Import patterns**: ES6 vs CommonJS vs dynamic imports

## Engagement Level Selection

**Choose your preferred engagement level:**

### 🤝 High Engagement (Collaborative)
- You'll provide detailed architectural insights and review each phase
- Best for: Senior developers, architects, or when building critical documentation

### 🎯 Medium Engagement (Guided)  
- You'll provide high-level goals, AI handles details with your approval
- Best for: Busy developers who want quality output with minimal time investment

### 🚀 Auto-Pilot (Autonomous)
- You describe what you want, AI figures out everything else
- Best for: Junior developers, rapid prototyping, or when you trust AI judgment

*AI will adapt the process below based on your chosen engagement level.*

## Phase 1: Initial Project Analysis (AI-driven)

**AI Agent Action**: Perform comprehensive analysis of the entire project codebase to build foundational understanding of structure, technologies, and patterns.

**Output**: Generate "Initial Project Understanding Report" documenting:
- Identified technologies and frameworks
- Module structures and dependencies
- Observed code patterns and conventions
- Preliminary assessment of documentation gaps

## Phase 2: Collaborative Refinement & Gap Identification

### 🤝 High Engagement Mode
**AI Agent Action**: Present the "Initial Project Understanding Report" to the human collaborator.

**Human Collaborator Action**: Review the report, confirm accurate inferences, correct misunderstandings, and provide the crucial "why" and "intent" behind design decisions.

**AI Agent Action**: Engage in detailed dialogue, asking targeted questions about:
- **Core Responsibilities**: Purpose and boundaries of each module/package
- **Design Principles**: Architectural rules, conventions, and strategic decisions
- **Golden Paths**: Critical end-to-end user journeys
- **API Details**: Precise behavior, parameters, and return values
- **Technical Debt/Known Issues**: Undocumented complexities

### 🎯 Medium Engagement Mode
**AI Agent Action**: Present key findings and ask focused, multiple-choice questions.

**Human Collaborator Action**: Answer high-level questions about project goals and priorities.

**AI Agent Action**: Make reasonable assumptions for detailed decisions, document them in `.project/assumptions.md` for later review.

### 🚀 Auto-Pilot Mode
**AI Agent Action**: Analyze existing codebase patterns to infer:
- Module responsibilities from code structure and naming
- Design principles from consistent patterns across the codebase
- API behavior from implementation and usage patterns
- Critical paths from main application flows

**Fallback Strategy**: When human input is unavailable:
1. Infer principles from existing code patterns
2. Apply industry best practices as defaults
3. Document all assumptions in `.project/assumptions.md`
4. Use conservative, safe architectural choices
5. Flag areas needing future human review

## Phase 3: Systematic Documentation Generation

### Documentation Types Generated
- **Architecture Documents**: For each major package/module (`architecture/<package-name>.md`)
- **API Reference Documents**: Detailed specifications (`apis/<package-name>.md`)
- **Design Principle Documents**: Architectural rules and conventions (`design-principles/`)
- **Golden Path Narratives**: Critical user journeys (`golden-paths/<feature-name>.md`)
- **BDD Gherkin Specifications**: Behavioral specifications (`features/<feature-name>.feature`)
- **Assumptions Log**: AI decisions and reasoning (`.project/assumptions.md`)

### 🤝 High Engagement Process
For each document, AI will:
1. Generate initial content
2. Present to human for detailed review
3. Incorporate feedback through iterative discussion
4. **ONLY COMMIT AFTER EXPLICIT HUMAN APPROVAL**

### 🎯 Medium Engagement Process
For each document, AI will:
1. Generate content based on Phase 2 assumptions
2. Present summary and key decisions to human
3. Human provides quick approve/reject/modify feedback
4. AI makes adjustments and commits with human sign-off

### 🚀 Auto-Pilot Process
AI will:
1. Generate all documentation based on codebase analysis
2. Create comprehensive `.project/assumptions.md` explaining all decisions
3. Commit documentation with clear assumption markers
4. Flag areas where human review would be most valuable

### Quality Assurance (All Modes)
- **Consistency Check**: Ensure all documents align with detected patterns
- **Completeness Check**: Verify all major components are documented
- **Accuracy Validation**: Cross-reference documentation with actual code
- **Future-Proofing**: Mark areas likely to need updates as code evolves

## Phase 4: Maintenance & Evolution

**Human Collaborator Action**: Initiate updates to documentation as the project evolves.

**AI Agent Action**: Assist in maintaining documentation by:
- Identifying discrepancies between code and existing documentation
- Generating new documentation for new features or refactorings
- Answering queries based on the documented knowledge base

## Phase 5: Documentation Sync & Handoff Preparation

### **Goal**
Update project documentation with new patterns, decisions, and functionality before PR/merge, ensuring knowledge is preserved for future AI sessions and team members.

### 🤝 High Engagement Mode
**AI Actions**:
- Present documentation update plan to human
- Collaborate on updating each type of documentation
- Get approval for each major documentation change

**Human Actions**:
- Review and approve documentation updates
- Provide context for business logic changes
- Validate that new patterns are accurately documented

### 🎯 Medium Engagement Mode
**AI Actions**:
- Automatically update obvious documentation (API changes, new components)
- Present summary of major changes for approval
- Update assumptions log with implementation decisions

**Human Actions**:
- Quick review and approval of documentation changes
- Provide feedback on any inaccuracies

### 🚀 Auto-Pilot Mode
**AI Actions**:
- Automatically update all relevant documentation
- Log all changes in assumptions for later review
- Flag any complex changes that might need human review

### **Documentation Update Checklist**
- [ ] **Golden paths** updated for new user flows
- [ ] **Architecture docs** reflect new components/patterns  
- [ ] **BDD features** cover new functionality
- [ ] **API docs** updated for new/modified endpoints
- [ ] **Assumptions log** updated with implementation decisions
- [ ] **Test documentation** reflects new test patterns
- [ ] **Configuration files** updated if new dependencies added
- [ ] **README** updated if setup process changed

### **Output**
Updated project documentation ready for PR review and team handoff, ensuring the next developer (or AI session) has complete context about the changes made.

## Conclusion

This collaborative framework ensures that project documentation is a living, accurate, and invaluable resource that grows with the project, fostering deep shared understanding between human developers and AI agents.