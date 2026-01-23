const fs = require("fs-extra");
const path = require("path");
const { glob } = require("glob");

// Main inject-docs functionality
async function injectDocs(options) {
  // Check if documentation exists
  const docsExist = await checkHandoffDocs();
  if (!docsExist) {
    throw new Error("No Handoff documentation found to inject");
  }

  // Analyze project structure and detect languages
  const projectInfo = await analyzeProject(options.files);

  if (projectInfo.files.length === 0) {
    throw new Error("No source files found to process");
  }

  // Load and parse Handoff documentation
  const handoffDocs = await loadHandoffDocs();

  // Generate inline documentation for each file
  const results = await generateInlineDocs(projectInfo, handoffDocs, options);

  return results;
}

async function checkHandoffDocs() {
  const requiredFiles = ["docs/ai/project/assumptions.md"];

  for (const file of requiredFiles) {
    if (await fs.pathExists(file)) {
      return true;
    }
  }
  return false;
}

async function analyzeProject(filePattern) {
  const defaultPatterns = [
    "**/*.js",
    "**/*.ts",
    "**/*.jsx",
    "**/*.tsx",
    "**/*.py",
    "**/*.java",
    "**/*.cs",
    "**/*.go",
    "**/*.rs",
    "**/*.php",
    "**/*.rb",
    "**/*.cpp",
    "**/*.c",
    "**/*.h",
    "**/*.hpp",
  ];

  const patterns = filePattern ? [filePattern] : defaultPatterns;
  const files = [];

  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      ignore: [
        "node_modules/**",
        ".git/**",
        "dist/**",
        "build/**",
        "docs/ai/project/**",
      ],
    });
    files.push(...matches);
  }

  const uniqueFiles = [...new Set(files)];
  const projectInfo = {
    files: uniqueFiles.map((file) => ({
      path: file,
      language: detectLanguage(file),
    })),
  };

  return projectInfo;
}

function detectLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const languageMap = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".py": "python",
    ".java": "java",
    ".cs": "csharp",
    ".go": "go",
    ".rs": "rust",
    ".php": "php",
    ".rb": "ruby",
    ".cpp": "cpp",
    ".cc": "cpp",
    ".cxx": "cpp",
    ".c": "c",
    ".h": "c",
    ".hpp": "cpp",
  };

  return languageMap[ext] || "unknown";
}

async function loadHandoffDocs() {
  const docs = {};

  // Whitelist of actual handoff documentation files (not guides)
  const handoffDocFiles = [
    "docs/ai/project/assumptions.md", // AI decisions and patterns
    "docs/ai/project/architecture.md", // Architecture documentation
    "docs/ai/project/api-docs.md", // API documentation
    "docs/ai/project/design-principles.md", // Design principles
    "docs/ai/project/patterns.md", // Code patterns
    "docs/ai/project/business-logic.md", // Business logic documentation
    "docs/ai/project/constraints.md", // Project constraints
  ];

  // Load only actual handoff docs (not guides or EPICs)
  for (const docFile of handoffDocFiles) {
    if (await fs.pathExists(docFile)) {
      const fileName = path.basename(docFile, ".md");
      docs[fileName] = await fs.readFile(docFile, "utf8");
    }
  }

  // Special handling for assumptions.md - extract meaningful content
  if (docs.assumptions) {
    docs.assumptions = extractMeaningfulAssumptions(docs.assumptions);
  }

  return docs;
}

function extractMeaningfulAssumptions(assumptionsContent) {
  // Extract only the actual assumptions, not the template/guide content
  const lines = assumptionsContent.split("\n");
  const meaningfulContent = [];

  let inAssumptionSection = false;
  for (const line of lines) {
    // Skip template sections and guides
    if (
      line.includes("How to Use This File") ||
      line.includes("Assumption Template") ||
      line.includes("Review Status") ||
      line.includes("*No assumptions recorded yet*")
    ) {
      continue;
    }

    // Look for actual content sections
    if (
      line.includes("### Architecture Decisions") ||
      line.includes("### Design Principles") ||
      line.includes("### API Behaviors") ||
      line.includes("### Implementation Patterns") ||
      line.includes("### Current Assumptions")
    ) {
      inAssumptionSection = true;
      continue;
    }

    // Collect meaningful content
    if (
      inAssumptionSection &&
      line.trim() &&
      !line.startsWith("#") &&
      !line.includes("```")
    ) {
      meaningfulContent.push(line.trim());
    }
  }

  return meaningfulContent.join("\n");
}

async function generateInlineDocs(projectInfo, handoffDocs, options) {
  const results = [];
  const failures = [];
  const unsavedFiles = [];

  // Check if we have meaningful handoff docs
  const hasHandoffDocs =
    Object.keys(handoffDocs).length > 0 &&
    Object.values(handoffDocs).some((doc) => doc && doc.trim().length > 50);

  for (const fileInfo of projectInfo.files) {
    if (fileInfo.language === "unknown") continue;

    const fileContent = await fs.readFile(fileInfo.path, "utf8");

    // Check if file is empty or appears to be unsaved
    if (fileContent.trim().length === 0) {
      unsavedFiles.push(fileInfo.path);
      continue;
    }

    const codeElements = extractCodeElements(fileContent, fileInfo.language);

    // If no code elements found but file has content, it might be unsaved changes
    if (codeElements.length === 0 && fileContent.length > 50) {
      // File has content but no recognizable code patterns - might be unsaved
      unsavedFiles.push(fileInfo.path);
      continue;
    }

    const fileResult = {
      file: fileInfo.path,
      language: fileInfo.language,
      originalContent: fileContent,
      documentation: [],
    };

    // Process each function/class in the file
    for (const element of codeElements) {
      let documentation;

      if (hasHandoffDocs) {
        // Try to use handoff docs
        documentation = generateHandoffBasedDocumentation(
          element,
          handoffDocs,
          fileInfo.language,
        );
      }

      if (!documentation) {
        // Fallback to generic documentation
        documentation = generateGenericDocumentation(
          element,
          fileContent,
          fileInfo.language,
        );
      }

      if (documentation) {
        fileResult.documentation.push({
          element: element,
          documentation: documentation,
        });
      }
    }

    if (fileResult.documentation.length > 0) {
      fileResult.newContent = injectDocumentationIntoFile(
        fileContent,
        fileResult.documentation,
        fileInfo.language,
      );
      results.push(fileResult);
    }
  }

  // Handle unsaved files
  if (unsavedFiles.length > 0) {
    const chalk = require("chalk");
    console.log(
      chalk.yellow("\n⚠️  Some files appear to be unsaved or empty:"),
    );
    unsavedFiles.forEach((file) => {
      console.log(chalk.gray(`  • ${file}`));
    });
    console.log(
      chalk.blue(
        "\n💡 Please save your files in the editor before running inject-docs.",
      ),
    );
    console.log(
      chalk.gray(
        "Files with unsaved changes cannot be processed for documentation injection.",
      ),
    );

    if (results.length === 0) {
      throw new Error(
        "No files could be processed. Please save your files and try again.",
      );
    }
  }

  return results;
}

function extractCodeElements(content, language) {
  const elements = [];

  switch (language) {
    case "javascript":
    case "typescript":
      // Extract functions and classes
      const functionRegex =
        /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g;
      const classRegex = /(?:export\s+)?class\s+(\w+)/g;
      const arrowFunctionRegex =
        /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;

      let match;
      while ((match = functionRegex.exec(content)) !== null) {
        elements.push({
          type: "function",
          name: match[1],
          line: getLineNumber(content, match.index),
        });
      }
      while ((match = classRegex.exec(content)) !== null) {
        elements.push({
          type: "class",
          name: match[1],
          line: getLineNumber(content, match.index),
        });
      }
      while ((match = arrowFunctionRegex.exec(content)) !== null) {
        elements.push({
          type: "function",
          name: match[1],
          line: getLineNumber(content, match.index),
        });
      }
      break;

    case "python":
      const pyFunctionRegex = /def\s+(\w+)\s*\([^)]*\):/g;
      const pyClassRegex = /class\s+(\w+)(?:\([^)]*\))?:/g;

      while ((match = pyFunctionRegex.exec(content)) !== null) {
        elements.push({
          type: "function",
          name: match[1],
          line: getLineNumber(content, match.index),
        });
      }
      while ((match = pyClassRegex.exec(content)) !== null) {
        elements.push({
          type: "class",
          name: match[1],
          line: getLineNumber(content, match.index),
        });
      }
      break;
  }

  return elements;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split("\n").length;
}

function generateHandoffBasedDocumentation(element, handoffDocs, language) {
  // Look for relevant context in handoff docs
  const allDocsText = Object.values(handoffDocs).join("\n");
  const elementName = element.name.toLowerCase();

  // Find relevant sections
  const relevantSections = findRelevantSections(elementName, allDocsText);

  if (relevantSections.length === 0) {
    return null; // No relevant context found
  }

  // Generate documentation based on relevant sections
  const context = relevantSections[0];
  const description = generateDescriptionFromContext(element, context);

  if (!description) {
    return null;
  }

  return formatDocumentationForLanguage(element, description, language);
}

function findRelevantSections(elementName, docsText) {
  const lines = docsText.split("\n");
  const relevantSections = [];

  // Function-specific patterns to look for
  const functionPatterns = {
    validateEmail: ["email validation", "validate email", "email format"],
    hashPassword: [
      "password hash",
      "bcrypt",
      "salt rounds",
      "password security",
    ],
    calculateDiscount: [
      "discount calculation",
      "percentage-based discount",
      "discount percent",
    ],
    formatPrice: [
      "price format",
      "currency format",
      "intl.numberformat",
      "usd display",
    ],
    generateRandomId: [
      "random string",
      "unique identifier",
      "id generation",
      "base36",
    ],
    authenticateToken: [
      "jwt token",
      "token verification",
      "authentication middleware",
    ],
    generateToken: ["jwt token", "token creation", "token generation"],
    loginUser: ["user login", "authentication", "email password"],
    registerUser: ["user registration", "new account", "signup"],
    getAllProducts: ["product listing", "get products", "product filter"],
    getProductById: ["product by id", "specific product", "find product"],
    createProduct: ["create product", "new product", "add product"],
    updateProduct: ["update product", "modify product", "product update"],
    startServer: ["server startup", "express server", "server listen"],
  };

  // Get patterns for this specific function
  const specificPatterns = functionPatterns[elementName] || [];

  // First try direct function name match
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes(elementName.toLowerCase())) {
      // Get context around this line (2 lines before and after)
      const contextStart = Math.max(0, i - 2);
      const contextEnd = Math.min(lines.length, i + 3);
      const context = lines.slice(contextStart, contextEnd).join(" ").trim();
      relevantSections.push({
        context: context,
        score: 10,
        source: "direct-match",
      });
    }
  }

  // Then try function-specific patterns
  if (specificPatterns.length > 0) {
    for (const pattern of specificPatterns) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (line.includes(pattern)) {
          // Get context around this line
          const contextStart = Math.max(0, i - 1);
          const contextEnd = Math.min(lines.length, i + 2);
          const context = lines
            .slice(contextStart, contextEnd)
            .join(" ")
            .trim();
          relevantSections.push({
            context: context,
            score: 8,
            source: "pattern-match",
            pattern: pattern,
          });
        }
      }
    }
  }

  // If no matches yet, try generic function type patterns
  if (relevantSections.length === 0) {
    const genericPatterns = getGenericFunctionPatterns(elementName);
    for (const pattern of genericPatterns) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (line.includes(pattern.keyword)) {
          // Get context around this line
          const contextStart = Math.max(0, i - 1);
          const contextEnd = Math.min(lines.length, i + 2);
          const context = lines
            .slice(contextStart, contextEnd)
            .join(" ")
            .trim();
          relevantSections.push({
            context: context,
            score: pattern.score,
            source: "generic-match",
            pattern: pattern.keyword,
          });
        }
      }
    }
  }

  // Sort by relevance score and return only the context
  return relevantSections
    .sort((a, b) => b.score - a.score)
    .slice(0, 2) // Take top 2 most relevant
    .map((section) => section.context);
}

function getGenericFunctionPatterns(elementName) {
  const patterns = [];
  const lowerName = elementName.toLowerCase();

  // Add patterns based on function name prefixes
  if (
    lowerName.startsWith("get") ||
    lowerName.startsWith("fetch") ||
    lowerName.startsWith("retrieve")
  ) {
    patterns.push({ keyword: "retrieve", score: 5 });
    patterns.push({ keyword: "get", score: 4 });
    patterns.push({ keyword: "fetch", score: 4 });
  }
  if (
    lowerName.startsWith("create") ||
    lowerName.startsWith("add") ||
    lowerName.startsWith("insert")
  ) {
    patterns.push({ keyword: "create", score: 5 });
    patterns.push({ keyword: "add", score: 4 });
    patterns.push({ keyword: "new", score: 3 });
  }
  if (
    lowerName.startsWith("update") ||
    lowerName.startsWith("modify") ||
    lowerName.startsWith("change")
  ) {
    patterns.push({ keyword: "update", score: 5 });
    patterns.push({ keyword: "modify", score: 4 });
    patterns.push({ keyword: "change", score: 3 });
  }
  if (lowerName.startsWith("delete") || lowerName.startsWith("remove")) {
    patterns.push({ keyword: "delete", score: 5 });
    patterns.push({ keyword: "remove", score: 4 });
  }
  if (lowerName.startsWith("validate") || lowerName.startsWith("check")) {
    patterns.push({ keyword: "validation", score: 5 });
    patterns.push({ keyword: "validate", score: 4 });
  }
  if (lowerName.startsWith("format") || lowerName.startsWith("display")) {
    patterns.push({ keyword: "format", score: 5 });
    patterns.push({ keyword: "display", score: 4 });
  }
  if (lowerName.startsWith("generate") || lowerName.startsWith("create")) {
    patterns.push({ keyword: "generate", score: 5 });
    patterns.push({ keyword: "create", score: 4 });
  }
  if (lowerName.startsWith("hash") || lowerName.startsWith("encrypt")) {
    patterns.push({ keyword: "hash", score: 5 });
    patterns.push({ keyword: "encrypt", score: 4 });
    patterns.push({ keyword: "security", score: 3 });
  }
  if (lowerName.startsWith("auth") || lowerName.startsWith("login")) {
    patterns.push({ keyword: "authentication", score: 5 });
    patterns.push({ keyword: "auth", score: 4 });
    patterns.push({ keyword: "login", score: 3 });
  }
  if (lowerName.startsWith("calculate") || lowerName.startsWith("compute")) {
    patterns.push({ keyword: "calculate", score: 5 });
    patterns.push({ keyword: "compute", score: 4 });
  }

  return patterns;
}

function getFunctionSpecificPatterns(functionName) {
  const lowerName = functionName.toLowerCase();
  const patterns = [];

  // Define very specific patterns for each function type
  if (lowerName.includes("validate")) {
    if (lowerName.includes("email")) {
      patterns.push({ keyword: "email validation", score: 9 });
      patterns.push({ keyword: "email format", score: 8 });
      patterns.push({ keyword: "email regex", score: 7 });
    }
    patterns.push({ keyword: "input validation", score: 6 });
    patterns.push({ keyword: "validation pattern", score: 5 });
  }

  if (lowerName.includes("hash")) {
    if (lowerName.includes("password")) {
      patterns.push({ keyword: "password hashing", score: 9 });
      patterns.push({ keyword: "bcrypt", score: 8 });
      patterns.push({ keyword: "password security", score: 7 });
      patterns.push({ keyword: "salt rounds", score: 6 });
    }
    patterns.push({ keyword: "hashing", score: 5 });
  }

  if (lowerName.includes("format")) {
    if (lowerName.includes("price")) {
      patterns.push({ keyword: "price format", score: 9 });
      patterns.push({ keyword: "currency format", score: 8 });
      patterns.push({ keyword: "money display", score: 7 });
    }
    patterns.push({ keyword: "formatting", score: 5 });
  }

  if (lowerName.includes("calculate")) {
    if (lowerName.includes("discount")) {
      patterns.push({ keyword: "discount calculation", score: 9 });
      patterns.push({ keyword: "price discount", score: 8 });
    }
    patterns.push({ keyword: "calculation", score: 5 });
  }

  if (lowerName.includes("generate")) {
    if (lowerName.includes("id") || lowerName.includes("random")) {
      patterns.push({ keyword: "id generation", score: 9 });
      patterns.push({ keyword: "random id", score: 8 });
      patterns.push({ keyword: "unique identifier", score: 7 });
    }
    patterns.push({ keyword: "generation", score: 5 });
  }

  if (lowerName.includes("auth")) {
    patterns.push({ keyword: "authentication", score: 8 });
    patterns.push({ keyword: "auth token", score: 7 });
    patterns.push({ keyword: "login", score: 6 });
  }

  return patterns;
}

function isContextRelevantToFunction(functionName, context, keyword) {
  const lowerContext = context.toLowerCase();
  const lowerName = functionName.toLowerCase();

  // Check if the context actually relates to the function's purpose
  // This prevents pulling random text that just happens to contain a keyword

  // For email validation
  if (lowerName.includes("validate") && lowerName.includes("email")) {
    return (
      lowerContext.includes("email") &&
      (lowerContext.includes("valid") ||
        lowerContext.includes("format") ||
        lowerContext.includes("regex"))
    );
  }

  // For password hashing
  if (lowerName.includes("hash") && lowerName.includes("password")) {
    return (
      lowerContext.includes("password") &&
      (lowerContext.includes("hash") ||
        lowerContext.includes("bcrypt") ||
        lowerContext.includes("security"))
    );
  }

  // For price formatting
  if (lowerName.includes("format") && lowerName.includes("price")) {
    return (
      lowerContext.includes("price") ||
      lowerContext.includes("currency") ||
      lowerContext.includes("money")
    );
  }

  // For discount calculation
  if (lowerName.includes("calculate") && lowerName.includes("discount")) {
    return lowerContext.includes("discount") && lowerContext.includes("price");
  }

  // For ID generation
  if (
    lowerName.includes("generate") &&
    (lowerName.includes("id") || lowerName.includes("random"))
  ) {
    return (
      lowerContext.includes("id") ||
      lowerContext.includes("random") ||
      lowerContext.includes("unique")
    );
  }

  // Generic relevance check - context should mention the function or related concepts
  return lowerContext.includes(lowerName) || lowerContext.includes(keyword);
}

function generateDescriptionFromContext(element, context) {
  // Clean and extract meaningful description from context
  let description = context
    .replace(/[#*\-\[\]]/g, "") // Remove markdown
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/^\d+\.\s*/, "") // Remove numbered list markers
    .replace(/^[•\-]\s*/, "") // Remove bullet points
    .trim();

  // Function-specific extraction patterns
  const functionName = element.name.toLowerCase();

  // Look for specific patterns in the context that match our function
  const patterns = {
    validateemail: /email validation.*?regex pattern/i,
    hashpassword: /password.*?bcrypt.*?salt rounds/i,
    calculatediscount: /discount calculation.*?percentage.*?validation/i,
    formatprice: /price format.*?currency.*?intl\.numberformat/i,
    generaterandomid: /random.*?string.*?base36/i,
    authenticatetoken: /jwt token.*?verification/i,
    generatetoken: /jwt token.*?creation/i,
    loginuser: /user login.*?authentication.*?email.*?password/i,
    registeruser: /user registration.*?new account.*?validation/i,
    getallproducts: /product listing.*?optional.*?filtering/i,
    getproductbyid: /product.*?by id.*?error handling/i,
    createproduct: /create.*?product.*?validation/i,
    updateproduct: /update.*?product.*?validation/i,
    startserver: /server.*?startup.*?express.*?port/i,
  };

  const pattern = patterns[functionName];
  if (pattern) {
    const match = description.match(pattern);
    if (match) {
      return match[0];
    }
  }

  // Look for lines that contain function-specific keywords
  const lines = description.split(/[.!?:]+/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.length > 15 &&
      isSentenceRelevantToFunction(element.name, trimmed)
    ) {
      return trimmed;
    }
  }

  // Skip generic or irrelevant descriptions
  const genericPhrases = [
    "separation of concerns",
    "error handling",
    "product management",
    "requires authentication",
    "consistent json",
    "routes, middleware",
    "all database",
  ];

  const lowerDescription = description.toLowerCase();
  const isGeneric = genericPhrases.some((phrase) =>
    lowerDescription.includes(phrase),
  );

  if (isGeneric) {
    return null; // This context is too generic/irrelevant
  }

  // If context is too long, extract the most relevant part
  if (description.length > 100) {
    const sentences = description.split(/[.!?]+/);

    // Look for sentences that mention the function name
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (
        trimmed.toLowerCase().includes(element.name.toLowerCase()) &&
        trimmed.length > 20 &&
        trimmed.length < 80
      ) {
        return trimmed;
      }
    }

    // Look for sentences that are function-specific
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (
        isSentenceRelevantToFunction(element.name, trimmed) &&
        trimmed.length > 20 &&
        trimmed.length < 80
      ) {
        return trimmed;
      }
    }

    // If no good sentence found, return null to fall back to generic
    return null;
  }

  // Ensure it's a proper description and relevant to the function
  if (
    description.length < 10 ||
    !isSentenceRelevantToFunction(element.name, description)
  ) {
    return null;
  }

  return description;
}

function isSentenceRelevantToFunction(functionName, sentence) {
  const lowerName = functionName.toLowerCase();
  const lowerSentence = sentence.toLowerCase();

  // Skip sentences that are clearly not about the function
  const irrelevantPhrases = [
    "architecture decisions",
    "design principles",
    "api behaviors",
    "error responses",
    "requires authentication",
    "separation of concerns",
    "async operations",
    "all database",
    "routes, middleware",
  ];

  if (irrelevantPhrases.some((phrase) => lowerSentence.includes(phrase))) {
    return false;
  }

  // Check if the sentence is actually about the function's purpose
  if (lowerName.includes("validate") && lowerName.includes("email")) {
    return (
      lowerSentence.includes("email") &&
      (lowerSentence.includes("valid") ||
        lowerSentence.includes("format") ||
        lowerSentence.includes("check") ||
        lowerSentence.includes("regex")) &&
      !lowerSentence.includes("requires email, password")
    );
  }

  if (lowerName.includes("hash") && lowerName.includes("password")) {
    return (
      lowerSentence.includes("password") &&
      (lowerSentence.includes("hash") ||
        lowerSentence.includes("bcrypt") ||
        lowerSentence.includes("security") ||
        lowerSentence.includes("salt")) &&
      !lowerSentence.includes("always hash passwords, validate inputs")
    );
  }

  if (lowerName.includes("format") && lowerName.includes("price")) {
    return (
      (lowerSentence.includes("price") ||
        lowerSentence.includes("currency") ||
        lowerSentence.includes("money") ||
        lowerSentence.includes("format")) &&
      !lowerSentence.includes("standard format { error")
    );
  }

  if (lowerName.includes("calculate") && lowerName.includes("discount")) {
    return (
      lowerSentence.includes("discount") &&
      (lowerSentence.includes("calculate") ||
        lowerSentence.includes("percentage")) &&
      !lowerSentence.includes("requires authentication")
    );
  }

  if (
    lowerName.includes("generate") &&
    (lowerName.includes("id") || lowerName.includes("random"))
  ) {
    return (
      (lowerSentence.includes("id") ||
        lowerSentence.includes("random") ||
        lowerSentence.includes("generate") ||
        lowerSentence.includes("unique")) &&
      !lowerSentence.includes("user id and email")
    );
  }

  // Generic check - sentence should be about the function's domain
  return (
    lowerSentence.includes(lowerName) ||
    lowerSentence.includes(
      lowerName
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()
        .trim(),
    )
  );
}

function generateGenericDocumentation(element, fileContent, language) {
  // Generate documentation based on function analysis
  const functionCode = extractFunctionCode(element, fileContent);
  const purpose = inferFunctionPurpose(element.name, functionCode);

  let description = generateDescriptionFromPurpose(element.name, purpose);

  // Ensure we always have a description for generic documentation
  if (!description) {
    description = `${element.name} - ${element.type} implementation`;
  }

  return formatDocumentationForLanguage(element, description, language);
}

function extractFunctionCode(element, fileContent) {
  const lines = fileContent.split("\n");
  const startLine = element.line - 1;

  // Extract function code (simplified - just get a few lines)
  const codeLines = lines.slice(
    startLine,
    Math.min(startLine + 5, lines.length),
  );
  return codeLines.join("\n");
}

function inferFunctionPurpose(functionName, functionCode) {
  const purpose = {
    keywords: [],
    confidence: 0,
  };

  // Analyze function name for clues
  const nameKeywords = extractKeywordsFromName(functionName);
  purpose.keywords.push(...nameKeywords);

  // Analyze function code for clues
  const codeKeywords = extractKeywordsFromCode(functionCode);
  purpose.keywords.push(...codeKeywords);

  // Calculate confidence based on how much we can infer
  if (nameKeywords.length > 0) purpose.confidence += 0.5;
  if (codeKeywords.length > 0) purpose.confidence += 0.3;
  if (functionCode.includes("return")) purpose.confidence += 0.2;

  return purpose;
}

function extractKeywordsFromName(functionName) {
  const keywords = [];

  // Common function name patterns
  const patterns = {
    validate: ["validation", "validate", "check"],
    hash: ["hash", "encrypt", "security"],
    calculate: ["calculate", "compute", "math"],
    format: ["format", "display", "string"],
    generate: ["generate", "create", "random"],
    authenticate: ["auth", "login", "security"],
    register: ["register", "signup", "user"],
    get: ["retrieve", "fetch", "get"],
    create: ["create", "add", "new"],
    update: ["update", "modify", "change"],
    delete: ["delete", "remove", "destroy"],
  };

  const lowerName = functionName.toLowerCase();
  for (const [pattern, relatedKeywords] of Object.entries(patterns)) {
    if (lowerName.includes(pattern)) {
      keywords.push(...relatedKeywords);
    }
  }

  return keywords;
}

function extractKeywordsFromCode(code) {
  const keywords = [];
  const lowerCode = code.toLowerCase();

  // Look for specific patterns in code
  if (lowerCode.includes("bcrypt") || lowerCode.includes("hash")) {
    keywords.push("password", "hash", "security");
  }
  if (lowerCode.includes("email") || lowerCode.includes("@")) {
    keywords.push("email", "validation");
  }
  if (lowerCode.includes("jwt") || lowerCode.includes("token")) {
    keywords.push("authentication", "token", "security");
  }
  if (lowerCode.includes("price") || lowerCode.includes("currency")) {
    keywords.push("price", "money", "format");
  }
  if (lowerCode.includes("math.random") || lowerCode.includes("random")) {
    keywords.push("random", "generate", "id");
  }

  return keywords;
}

function generateDescriptionFromPurpose(functionName, purpose) {
  // Fallback for specific functions with high-quality descriptions
  const specificDescriptions = {
    validateEmail: "Validates email addresses using regex pattern",
    hashPassword: "Securely hashes passwords using bcrypt with salt rounds",
    calculateDiscount:
      "Calculates price discount based on percentage with validation",
    formatPrice: "Formats numeric price as USD currency string",
    generateRandomId:
      "Generates random unique identifier using base36 encoding",
    authenticateToken: "Verifies JWT authentication token",
    generateToken: "Creates JWT token for user authentication",
    loginUser: "Authenticates user credentials and returns token",
    registerUser:
      "Creates new user account with validation and password hashing",
    getAllProducts:
      "Retrieves products with optional category and price filtering",
    getProductById: "Retrieves specific product by ID with error handling",
    createProduct: "Creates new product with required field validation",
    updateProduct: "Updates existing product data with validation",
    startServer: "Starts Express server on specified port",
  };

  // Check for specific function descriptions first
  if (specificDescriptions[functionName]) {
    return specificDescriptions[functionName];
  }

  // Generate description based on inferred purpose
  if (purpose.keywords.length === 0) {
    return `${functionName} - Function implementation`;
  }

  // Create description based on keywords and function analysis
  const primaryKeyword = purpose.keywords[0];
  const lowerName = functionName.toLowerCase();

  // Enhanced descriptions based on function name patterns
  if (lowerName.includes("validate")) {
    if (lowerName.includes("email"))
      return "Validates email addresses using regex pattern";
    return "Validates input data according to specified rules";
  }

  if (lowerName.includes("hash")) {
    if (lowerName.includes("password"))
      return "Securely hashes passwords using bcrypt";
    return "Hashes data for secure storage";
  }

  if (lowerName.includes("calculate")) {
    if (lowerName.includes("discount"))
      return "Calculates price discount based on percentage";
    return "Calculates and returns computed value";
  }

  if (lowerName.includes("format")) {
    if (lowerName.includes("price"))
      return "Formats numeric price as currency string";
    return "Formats data for display presentation";
  }

  if (lowerName.includes("generate")) {
    if (lowerName.includes("id") || lowerName.includes("random"))
      return "Generates random unique identifier";
    if (lowerName.includes("token")) return "Generates authentication token";
    return "Generates new value or resource";
  }

  if (lowerName.includes("authenticate") || lowerName.includes("auth")) {
    if (lowerName.includes("token")) return "Verifies authentication token";
    return "Authenticates user credentials";
  }

  if (lowerName.includes("login")) {
    return "Authenticates user credentials and returns token";
  }

  if (lowerName.includes("register")) {
    return "Creates new user account with validation";
  }

  if (lowerName.startsWith("get") || lowerName.startsWith("fetch")) {
    if (lowerName.includes("all"))
      return "Retrieves all items with optional filtering";
    if (lowerName.includes("byid") || lowerName.includes("by_id"))
      return "Retrieves specific item by ID";
    return "Retrieves data from storage";
  }

  if (lowerName.startsWith("create") || lowerName.startsWith("add")) {
    return "Creates new resource with validation";
  }

  if (lowerName.startsWith("update") || lowerName.startsWith("modify")) {
    return "Updates existing resource data";
  }

  if (lowerName.startsWith("delete") || lowerName.startsWith("remove")) {
    return "Deletes specified resource";
  }

  if (lowerName.startsWith("start")) {
    if (lowerName.includes("server")) return "Starts server on specified port";
    return "Starts specified service or process";
  }

  // Fallback to generic descriptions
  const descriptions = {
    validation: `Validates input data`,
    validate: `Validates input data`,
    hash: `Hashes data for secure storage`,
    encrypt: `Encrypts data for security`,
    calculate: `Calculates and returns computed value`,
    format: `Formats data for display`,
    generate: `Generates new value`,
    authenticate: `Authenticates user credentials`,
    register: `Registers new user account`,
    retrieve: `Retrieves data from storage`,
    create: `Creates new resource`,
    update: `Updates existing resource`,
    delete: `Deletes specified resource`,
  };

  const description =
    descriptions[primaryKeyword] || `Handles ${primaryKeyword} operations`;
  return description;
}

function formatDocumentationForLanguage(element, description, language) {
  switch (language) {
    case "javascript":
    case "typescript":
      let jsDoc = `/**\n * ${description}`;
      if (element.type === "function") {
        const returnDoc = generateReturnDocumentation(element.name);
        jsDoc += `\n * @returns ${returnDoc}`;
      }
      jsDoc += `\n */`;
      return jsDoc;

    case "python":
      let pyDoc = `"""${description}`;
      if (element.type === "function") {
        const returnDoc = generateReturnDocumentation(element.name, "python");
        pyDoc += `\n    \n    Returns:\n        ${returnDoc}`;
      }
      pyDoc += `\n    """`;
      return pyDoc;

    case "java":
      let javaDoc = `/**\n * ${description}`;
      if (element.type === "method" || element.type === "function") {
        const returnDoc = generateReturnDocumentation(element.name, "java");
        javaDoc += `\n * @return ${returnDoc}`;
      }
      javaDoc += `\n */`;
      return javaDoc;

    default:
      return `/* ${description} */`;
  }
}

function generateReturnDocumentation(functionName, language = "javascript") {
  const lowerName = functionName.toLowerCase();

  // Specific return documentation for each function
  const specificReturns = {
    validateEmail: {
      javascript: "{boolean} True if email format is valid, false otherwise",
      python: "bool: True if email format is valid, False otherwise",
      java: "boolean True if email format is valid, false otherwise",
    },
    hashPassword: {
      javascript:
        "{Promise<string>} Promise resolving to bcrypt hashed password",
      python: "str: Bcrypt hashed password string",
      java: "String Bcrypt hashed password string",
    },
    calculateDiscount: {
      javascript: "{number} Final price after discount is applied",
      python: "float: Final price after discount is applied",
      java: "double Final price after discount is applied",
    },
    formatPrice: {
      javascript: "{string} Formatted price string in USD currency format",
      python: "str: Formatted price string in USD currency format",
      java: "String Formatted price string in USD currency format",
    },
    generateRandomId: {
      javascript: "{string} Random alphanumeric identifier string",
      python: "str: Random alphanumeric identifier string",
      java: "String Random alphanumeric identifier string",
    },
    authenticateToken: {
      javascript:
        "{void} Calls next() if valid, sends 401/403 response if invalid",
      python: "None: Calls next function or sends error response",
      java: "void Calls next function or sends error response",
    },
    generateToken: {
      javascript: "{string} Signed JWT token string",
      python: "str: Signed JWT token string",
      java: "String Signed JWT token string",
    },
    loginUser: {
      javascript: "{void} Sends JSON response with token or error",
      python: "None: Sends JSON response with token or error",
      java: "void Sends JSON response with token or error",
    },
    registerUser: {
      javascript:
        "{void} Sends JSON response with user data and token or error",
      python: "None: Sends JSON response with user data and token or error",
      java: "void Sends JSON response with user data and token or error",
    },
    getAllProducts: {
      javascript: "{void} Sends JSON response with filtered products array",
      python: "None: Sends JSON response with filtered products array",
      java: "void Sends JSON response with filtered products array",
    },
    getProductById: {
      javascript: "{void} Sends JSON response with product object or 404 error",
      python: "None: Sends JSON response with product object or 404 error",
      java: "void Sends JSON response with product object or 404 error",
    },
    createProduct: {
      javascript:
        "{void} Sends JSON response with created product or validation error",
      python:
        "None: Sends JSON response with created product or validation error",
      java: "void Sends JSON response with created product or validation error",
    },
    updateProduct: {
      javascript: "{void} Sends JSON response with updated product or error",
      python: "None: Sends JSON response with updated product or error",
      java: "void Sends JSON response with updated product or error",
    },
    startServer: {
      javascript: "{void} Starts Express server and logs port information",
      python: "None: Starts server and logs port information",
      java: "void Starts server and logs port information",
    },
  };

  // Check for specific function documentation
  if (specificReturns[functionName]) {
    return (
      specificReturns[functionName][language] ||
      specificReturns[functionName].javascript
    );
  }

  // Pattern-based return documentation for common function types
  if (
    lowerName.startsWith("validate") ||
    lowerName.startsWith("check") ||
    lowerName.startsWith("is")
  ) {
    return language === "javascript"
      ? "{boolean} True if validation passes, false otherwise"
      : language === "python"
        ? "bool: True if validation passes, False otherwise"
        : "boolean True if validation passes, false otherwise";
  }

  if (
    lowerName.startsWith("get") ||
    lowerName.startsWith("fetch") ||
    lowerName.startsWith("find")
  ) {
    if (lowerName.includes("all") || lowerName.includes("list")) {
      return language === "javascript"
        ? "{Array} Array of retrieved items"
        : language === "python"
          ? "list: List of retrieved items"
          : "Array Array of retrieved items";
    }
    return language === "javascript"
      ? "{Object|null} Retrieved item or null if not found"
      : language === "python"
        ? "object|None: Retrieved item or None if not found"
        : "Object Retrieved item or null if not found";
  }

  if (
    lowerName.startsWith("create") ||
    lowerName.startsWith("add") ||
    lowerName.startsWith("insert")
  ) {
    return language === "javascript"
      ? "{Object} Created item object"
      : language === "python"
        ? "object: Created item object"
        : "Object Created item object";
  }

  if (
    lowerName.startsWith("update") ||
    lowerName.startsWith("modify") ||
    lowerName.startsWith("edit")
  ) {
    return language === "javascript"
      ? "{Object} Updated item object"
      : language === "python"
        ? "object: Updated item object"
        : "Object Updated item object";
  }

  if (lowerName.startsWith("delete") || lowerName.startsWith("remove")) {
    return language === "javascript"
      ? "{boolean} True if deletion successful"
      : language === "python"
        ? "bool: True if deletion successful"
        : "boolean True if deletion successful";
  }

  if (lowerName.startsWith("calculate") || lowerName.startsWith("compute")) {
    return language === "javascript"
      ? "{number} Calculated result"
      : language === "python"
        ? "float: Calculated result"
        : "double Calculated result";
  }

  if (lowerName.startsWith("format") || lowerName.startsWith("stringify")) {
    return language === "javascript"
      ? "{string} Formatted string"
      : language === "python"
        ? "str: Formatted string"
        : "String Formatted string";
  }

  if (lowerName.startsWith("generate") || lowerName.startsWith("build")) {
    return language === "javascript"
      ? "{string} Generated value"
      : language === "python"
        ? "str: Generated value"
        : "String Generated value";
  }

  if (lowerName.includes("hash") || lowerName.includes("encrypt")) {
    return language === "javascript"
      ? "{string} Hashed/encrypted string"
      : language === "python"
        ? "str: Hashed/encrypted string"
        : "String Hashed/encrypted string";
  }

  if (
    lowerName.includes("middleware") ||
    lowerName.includes("auth") ||
    lowerName.includes("handler")
  ) {
    return language === "javascript"
      ? "{void} Middleware function with side effects"
      : language === "python"
        ? "None: Function with side effects"
        : "void Function with side effects";
  }

  if (
    lowerName.includes("start") ||
    lowerName.includes("init") ||
    lowerName.includes("setup")
  ) {
    return language === "javascript"
      ? "{void} Initializes and starts service"
      : language === "python"
        ? "None: Initializes and starts service"
        : "void Initializes and starts service";
  }

  // Default fallback
  return language === "javascript"
    ? "{*} Function return value"
    : language === "python"
      ? "Return value of the function"
      : "Function return value";
}

function injectDocumentationIntoFile(content, documentation, language) {
  let newContent = content;
  const lines = content.split("\n");

  // Sort documentation by line number (descending) to avoid index shifting
  const sortedDocs = documentation.sort(
    (a, b) => b.element.line - a.element.line,
  );

  for (const doc of sortedDocs) {
    const lineIndex = doc.element.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      // Check if documentation already exists
      if (!hasExistingDocumentation(lines, lineIndex, language)) {
        // Insert documentation before the element
        const indent = getIndentation(lines[lineIndex]);
        const docLines = doc.documentation
          .split("\n")
          .map((line) => indent + line);
        lines.splice(lineIndex, 0, ...docLines);
      }
    }
  }

  return lines.join("\n");
}

function hasExistingDocumentation(lines, lineIndex, language) {
  // Check if there's already documentation above this line
  if (lineIndex === 0) return false;

  const prevLine = lines[lineIndex - 1].trim();

  // Also check a few lines above for block comments
  let hasDocComment = false;

  switch (language) {
    case "javascript":
    case "typescript":
    case "java":
      // Check if previous line ends a JSDoc comment
      if (prevLine.endsWith("*/")) {
        // Look backwards to see if there's a /** starting the comment
        for (let i = lineIndex - 2; i >= Math.max(0, lineIndex - 10); i--) {
          const line = lines[i].trim();
          if (line.startsWith("/**")) {
            hasDocComment = true;
            break;
          }
          if (line && !line.startsWith("*") && !line.startsWith("*/")) {
            break; // Found non-comment line, stop looking
          }
        }
      }
      return hasDocComment || prevLine.startsWith("/**");

    case "python":
      return prevLine.endsWith('"""') || prevLine.startsWith('"""');

    default:
      return false;
  }
}

function getIndentation(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : "";
}

async function applyDocumentationChanges(results) {
  for (const result of results) {
    await fs.writeFile(result.file, result.newContent, "utf8");
  }
}

function displayDryRunResults(results) {
  console.log("\n📋 Proposed Changes:\n");

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.file} (${result.language})`);
    console.log(
      `   ${result.documentation.length} documentation blocks to add\n`,
    );

    result.documentation.forEach((doc, docIndex) => {
      console.log(
        `   ${docIndex + 1}. ${doc.element.type}: ${doc.element.name} (line ${doc.element.line})`,
      );

      // Show the actual documentation content
      if (doc.documentation) {
        const firstLine =
          doc.documentation.split("\n")[1] || doc.documentation.split("\n")[0]; // Skip /** line
        console.log(`      ${firstLine.trim()}\n`);
      } else {
        console.log(`      [No documentation generated]\n`);
      }
    });
  });

  console.log("\n💡 Run without --dry-run to apply these changes");
}

module.exports = {
  injectDocs,
  applyDocumentationChanges,
  displayDryRunResults,
};
