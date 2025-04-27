#!/usr/bin/env node

/**
 * Comprehensive code analysis script that generates detailed metrics about the frontend codebase.
 *
 * Metrics provided:
 * - Lines of Code (LOC)
 * - Comment Lines of Code (CLOC)
 * - Code complexity
 * - Module breakdowns
 * - Programming languages
 * - File and directory statistics
 *
 * NOTE: To use this script with ES modules, ensure your package.json contains:
 * "type": "module"
 */

// Use ES module imports
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { execSync } from 'child_process'
import os from 'os'

const readFileAsync = promisify(fs.readFile)

// File patterns to analyze - frontend focus
const CODE_EXTENSIONS = {
  // Frontend (keep only these)
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.html': 'HTML',
  // Config files
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.toml': 'TOML',
  '.txt': 'Text',
}

// Categorize extensions by type
const FRONTEND_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.scss',
  '.html',
])
const CONFIG_EXTENSIONS = new Set(['.yaml', '.yml', '.toml'])
const DOCS_EXTENSIONS = new Set(['.txt'])

// Patterns for identifying module types
const MODULE_PATTERNS = {
  frontend: [
    'src/components',
    'src/pages',
    'public',
    'static',
    'assets',
    'styles',
  ],
  config: ['config', '.config', 'configs'],
  docs: ['docs', 'documentation', 'wiki'],
  other: [],
}

// Directories to ignore during analysis
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.cache',
  '.vscode',
  '.idea',
  '__pycache__',
]

// Files to ignore during analysis
const IGNORE_FILES = [
  '.DS_Store',
  '.gitignore',
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
]

// Create a simple table formatter function
function formatTable(data, headers) {
  if (!data || data.length === 0) {
    return ''
  }

  // Calculate column widths
  const colWidths = headers.map((h) => h.length)

  data.forEach((row) => {
    row.forEach((cell, i) => {
      colWidths[i] = Math.max(colWidths[i], String(cell).length)
    })
  })

  // Create separator line
  const sepLine = '+' + colWidths.map((w) => '-'.repeat(w + 2)).join('+') + '+'

  // Create header line
  const headerLine =
    '|' +
    headers.map((h, i) => ` ${h.padEnd(colWidths[i], ' ')} `).join('|') +
    '|'

  // Create rows
  const rows = data.map((row) => {
    return (
      '|' +
      row
        .map((cell, i) => ` ${String(cell).padEnd(colWidths[i], ' ')} `)
        .join('|') +
      '|'
    )
  })

  // Assemble table
  const table = [sepLine, headerLine, sepLine, ...rows, sepLine]
  return table.join('\n')
}

class CodeMetrics {
  constructor(projectRoot) {
    this.projectRoot = projectRoot
    this.ignoredPatterns = this.getIgnoredPatterns()
    this.metrics = {
      total: {
        files: 0,
        loc: 0,
        blank: 0,
        comment: 0,
        code: 0,
      },
      byLanguage: {},
      byCategory: {
        frontend: {
          files: 0,
          loc: 0,
          blank: 0,
          comment: 0,
          code: 0,
        },
        config: {
          files: 0,
          loc: 0,
          blank: 0,
          comment: 0,
          code: 0,
        },
        docs: {
          files: 0,
          loc: 0,
          blank: 0,
          comment: 0,
          code: 0,
        },
      },
      byFile: {},
      byDirectory: {},
      complexity: {
        total: 0,
        max: 0,
        maxFile: '',
        byFile: {},
      },
      structure: {
        directories: new Set(),
        classes: 0,
        functions: 0,
        methods: 0,
      },
      commits: 0,
    }
  }

  getIgnoredPatterns() {
    try {
      const gitignore = fs.readFileSync('.gitignore', 'utf8')
      return gitignore
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('#'))
        .map((line) => line.trim())
    } catch {
      console.warn('Warning: .gitignore file not found.')
      return []
    }
  }

  isIgnored(filePath) {
    try {
      // Try using git check-ignore
      try {
        execSync(`git check-ignore -q "${filePath}"`, { stdio: 'ignore' })
        return true
      } catch {
        // If command returns non-zero, file is not ignored
      }

      // Check against IGNORE_DIRS and IGNORE_FILES lists
      const fileName = path.basename(filePath)
      const pathParts = filePath.split(path.sep)

      // Check if the file is in the ignore files list
      if (IGNORE_FILES.includes(fileName)) {
        return true
      }

      // Check if any part of the path is in the ignore directories list
      for (const part of pathParts) {
        if (IGNORE_DIRS.includes(part)) {
          return true
        }
      }

      // Fallback to manual checking
      const filePathParts = filePath.split(path.sep)

      for (const pattern of this.ignoredPatterns) {
        const cleanPattern = pattern.endsWith('/')
          ? pattern.slice(0, -1)
          : pattern

        // Handle directory-specific patterns
        if (pattern.includes('/')) {
          if (path.normalize(cleanPattern) === path.normalize(filePath)) {
            return true
          }

          const normalizedPattern = cleanPattern.startsWith('./')
            ? cleanPattern.slice(2)
            : cleanPattern

          if (filePath.startsWith(normalizedPattern)) {
            return true
          }
        }
        // Handle wildcard patterns
        else if (pattern.includes('*')) {
          const patternRegex = new RegExp(
            `^${pattern.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`
          )
          for (const part of filePathParts) {
            if (patternRegex.test(part)) {
              return true
            }
          }
        }
        // Handle simple file/directory names
        else {
          const patternWithoutSlash = pattern.endsWith('/')
            ? pattern.slice(0, -1)
            : pattern
          if (
            filePathParts.includes(pattern) ||
            filePathParts.includes(patternWithoutSlash)
          ) {
            return true
          }
        }
      }

      return false
    } catch (error) {
      console.error(`Error checking if file is ignored: ${error.message}`)
      return false
    }
  }

  shouldCountFile(filePath) {
    const ext = path.extname(filePath).toLowerCase()
    // Always explicitly exclude .md and .json files
    if (ext === '.md' || ext === '.json') {
      return false
    }
    // Only analyze frontend and config files for this project
    return (
      ext in CODE_EXTENSIONS &&
      (FRONTEND_EXTENSIONS.has(ext) ||
        CONFIG_EXTENSIONS.has(ext) ||
        DOCS_EXTENSIONS.has(ext))
    )
  }

  getFileCategory(filePath) {
    const ext = path.extname(filePath).toLowerCase()
    const relativeDirPath = path.dirname(filePath)

    // Check file extension first
    if (FRONTEND_EXTENSIONS.has(ext)) {
      return 'frontend'
    } else if (CONFIG_EXTENSIONS.has(ext)) {
      return 'config'
    } else if (DOCS_EXTENSIONS.has(ext)) {
      return 'docs'
    }

    // If extension check is inconclusive, check directory patterns
    for (const [category, patterns] of Object.entries(MODULE_PATTERNS)) {
      for (const pattern of patterns) {
        if (relativeDirPath.includes(pattern)) {
          return category
        }
      }
    }

    // Default fallback
    return 'other'
  }

  getCommitCount() {
    try {
      const result = execSync('git rev-list --count HEAD', { encoding: 'utf8' })
      return parseInt(result.trim(), 10)
    } catch (error) {
      console.error(`Error getting commit count: ${error.message}`)
      return 0
    }
  }

  calculateCyclomaticComplexity(filePath, fileContent) {
    try {
      const ext = path.extname(filePath).toLowerCase()

      // Only calculate complexity for JavaScript/TypeScript files
      if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        return 0
      }

      let complexity = 0
      const lines = fileContent.split('\n')

      for (const line of lines) {
        // Count if statements
        if (line.match(/\bif\s*\(/g)) {
          complexity++
        }

        // Count else if statements
        if (line.match(/\belse\s+if\s*\(/g)) {
          complexity++
        }

        // Count for loops
        if (line.match(/\bfor\s*\(/g)) {
          complexity++
        }

        // Count while loops
        if (line.match(/\bwhile\s*\(/g)) {
          complexity++
        }

        // Count do-while loops
        if (line.match(/\bdo\s*\{/g)) {
          complexity++
        }

        // Count switch cases
        if (line.match(/\bcase\s+[^:]+:/g)) {
          complexity++
        }

        // Count catch blocks
        if (line.match(/\bcatch\s*\(/g)) {
          complexity++
        }

        // Count logical AND and OR operators
        const andMatches = line.match(/&&/g)
        if (andMatches) {
          complexity += andMatches.length
        }

        const orMatches = line.match(/\|\|/g)
        if (orMatches) {
          complexity += orMatches.length
        }

        // Count ternary operators
        const ternaryMatches = line.match(/\?.*:/g)
        if (ternaryMatches) {
          complexity += ternaryMatches.length
        }
      }

      // Add minimum complexity of 1 if the file has any code
      return Math.max(1, complexity)
    } catch (error) {
      console.error(
        `Error calculating complexity for ${filePath}: ${error.message}`
      )
      return 0
    }
  }

  countStructureElements(filePath, fileContent) {
    const result = { classes: 0, functions: 0, methods: 0 }

    try {
      const ext = path.extname(filePath).toLowerCase()

      if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        return result
      }

      const lines = fileContent.split('\n')

      // Look for class declarations
      const classMatches = fileContent.match(/\bclass\s+\w+/g)
      if (classMatches) {
        result.classes = classMatches.length
      }

      // Count function declarations
      let inClass = false
      for (const line of lines) {
        // Track if we're in a class definition
        if (line.match(/\bclass\s+\w+/)) {
          inClass = true
        }

        if (inClass && line.match(/^}/)) {
          inClass = false
        }

        // Match function declarations
        if (line.match(/\bfunction\s+\w+\s*\(/)) {
          if (inClass) {
            result.methods++
          } else {
            result.functions++
          }
        }

        // Match arrow functions with names (const foo = () => {})
        if (
          line.match(/\b(const|let|var)\s+\w+\s*=\s*(\([^)]*\)|[^=]*)\s*=>/)
        ) {
          result.functions++
        }

        // Match class methods
        if (inClass && line.match(/\b\w+\s*\([^)]*\)\s*{/)) {
          result.methods++
        }
      }

      return result
    } catch (error) {
      console.error(
        `Error counting structure elements for ${filePath}: ${error.message}`
      )
      return result
    }
  }

  async analyzeFile(filePath) {
    const result = {
      loc: 0,
      blank: 0,
      comment: 0,
      code: 0,
      complexity: 0,
      classes: 0,
      functions: 0,
      methods: 0,
    }

    try {
      const ext = path.extname(filePath).toLowerCase()
      const content = await readFileAsync(filePath, 'utf8')
      const lines = content.split('\n')

      result.loc = lines.length

      let inMultilineComment = false

      // Detect comment patterns based on file extension
      let singleComment = '//'
      let multiCommentStart = '/*'
      let multiCommentEnd = '*/'

      if (ext === '.py') {
        singleComment = '#'
        multiCommentStart = '"""'
        multiCommentEnd = '"""'
      } else if (ext === '.rb') {
        singleComment = '#'
        multiCommentStart = '=begin'
        multiCommentEnd = '=end'
      } else if (['.sh', '.bash'].includes(ext)) {
        singleComment = '#'
        multiCommentStart = null
        multiCommentEnd = null
      } else if (['.md', '.txt'].includes(ext)) {
        // No standard comments in markdown/text
        singleComment = null
        multiCommentStart = null
        multiCommentEnd = null
      }

      for (const line of lines) {
        const trimmedLine = line.trim()

        // Count blank lines
        if (!trimmedLine) {
          result.blank++
          continue
        }

        // Check for single line comments
        if (singleComment && trimmedLine.startsWith(singleComment)) {
          result.comment++
          continue
        }

        // Handle multiline comments
        if (multiCommentStart && multiCommentEnd) {
          if (inMultilineComment) {
            result.comment++
            if (trimmedLine.includes(multiCommentEnd)) {
              inMultilineComment = false
            }
            continue
          }

          if (trimmedLine.startsWith(multiCommentStart)) {
            result.comment++
            if (
              !trimmedLine.includes(multiCommentEnd, multiCommentStart.length)
            ) {
              inMultilineComment = true
            }
            continue
          }
        }

        // If not blank or comment, it's code
        result.code++
      }

      // Calculate cyclomatic complexity for JS/TS files
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        result.complexity = this.calculateCyclomaticComplexity(
          filePath,
          content
        )
        const structureElements = this.countStructureElements(filePath, content)
        result.classes = structureElements.classes
        result.functions = structureElements.functions
        result.methods = structureElements.methods
      }

      return result
    } catch (error) {
      console.error(`Error analyzing ${filePath}: ${error.message}`)
      return result
    }
  }

  async analyze() {
    const filesToAnalyze = []

    // Walk the directory tree and collect files to analyze
    const traverseDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.relative(this.projectRoot, fullPath)

        // Skip hidden files and directories
        if (entry.name.startsWith('.')) {
          continue
        }

        // Skip ignored files and directories
        if (this.isIgnored(relativePath)) {
          continue
        }

        if (entry.isDirectory()) {
          this.metrics.structure.directories.add(relativePath)
          traverseDir(fullPath)
        } else if (entry.isFile() && this.shouldCountFile(fullPath)) {
          filesToAnalyze.push({ fullPath, relativePath })
        }
      }
    }

    traverseDir(this.projectRoot)

    // Analyze files in parallel using worker threads
    const cpuCount = os.cpus().length
    const batchSize = Math.max(1, Math.ceil(filesToAnalyze.length / cpuCount))
    const batches = []

    for (let i = 0; i < filesToAnalyze.length; i += batchSize) {
      batches.push(filesToAnalyze.slice(i, i + batchSize))
    }

    const analyzeFileBatch = async (fileBatch) => {
      const results = []

      for (const file of fileBatch) {
        const fileMetrics = await this.analyzeFile(file.fullPath)
        results.push({
          file,
          metrics: fileMetrics,
        })
      }

      return results
    }

    const batchResults = await Promise.all(
      batches.map((batch) => analyzeFileBatch(batch))
    )
    const allResults = batchResults.flat()

    // Process results
    for (const { file, metrics } of allResults) {
      const { fullPath, relativePath } = file

      // Update total metrics
      this.metrics.total.files++
      this.metrics.total.loc += metrics.loc
      this.metrics.total.blank += metrics.blank
      this.metrics.total.comment += metrics.comment
      this.metrics.total.code += metrics.code

      // Store metrics by file
      this.metrics.byFile[relativePath] = metrics

      // Update directory metrics
      const dirPath = path.dirname(relativePath)
      if (!this.metrics.byDirectory[dirPath]) {
        this.metrics.byDirectory[dirPath] = {
          files: 0,
          loc: 0,
          blank: 0,
          comment: 0,
          code: 0,
        }
      }

      this.metrics.byDirectory[dirPath].files++
      this.metrics.byDirectory[dirPath].loc += metrics.loc
      this.metrics.byDirectory[dirPath].blank += metrics.blank
      this.metrics.byDirectory[dirPath].comment += metrics.comment
      this.metrics.byDirectory[dirPath].code += metrics.code

      // Update language metrics
      const ext = path.extname(fullPath).toLowerCase()
      const language = CODE_EXTENSIONS[ext] || 'Other'

      if (!this.metrics.byLanguage[language]) {
        this.metrics.byLanguage[language] = {
          files: 0,
          loc: 0,
          blank: 0,
          comment: 0,
          code: 0,
        }
      }

      this.metrics.byLanguage[language].files++
      this.metrics.byLanguage[language].loc += metrics.loc
      this.metrics.byLanguage[language].blank += metrics.blank
      this.metrics.byLanguage[language].comment += metrics.comment
      this.metrics.byLanguage[language].code += metrics.code

      // Update category metrics
      const category = this.getFileCategory(fullPath)
      if (category in this.metrics.byCategory) {
        this.metrics.byCategory[category].files++
        this.metrics.byCategory[category].loc += metrics.loc
        this.metrics.byCategory[category].blank += metrics.blank
        this.metrics.byCategory[category].comment += metrics.comment
        this.metrics.byCategory[category].code += metrics.code
      }

      // Update complexity metrics
      const complexity = metrics.complexity
      this.metrics.complexity.total += complexity
      this.metrics.complexity.byFile[relativePath] = complexity

      if (complexity > this.metrics.complexity.max) {
        this.metrics.complexity.max = complexity
        this.metrics.complexity.maxFile = relativePath
      }

      // Update structure metrics
      this.metrics.structure.classes += metrics.classes
      this.metrics.structure.functions += metrics.functions
      this.metrics.structure.methods += metrics.methods
    }

    // Get the commit count
    this.metrics.commits = this.getCommitCount()
  }

  printReport() {
    console.log('\n' + '='.repeat(80))
    console.log(' '.repeat(30) + 'CODE METRICS REPORT')
    console.log(' '.repeat(30) + '(FRONTEND ANALYSIS)')
    console.log('='.repeat(80))

    // Overall stats
    console.log('\n' + '#'.repeat(40))
    console.log('OVERALL STATISTICS')
    console.log('#'.repeat(40))

    const total = this.metrics.total
    const commentRatio = total.loc > 0 ? (total.comment / total.loc) * 100 : 0

    console.log(`Total Files: ${total.files}`)
    console.log(`Total Lines of Code (LOC): ${total.loc}`)
    console.log(`Comment Lines of Code (CLOC): ${total.comment}`)
    console.log(`Blank Lines: ${total.blank}`)
    console.log(`Code Lines: ${total.code}`)
    console.log(`Comment Ratio: ${commentRatio.toFixed(2)}%`)
    console.log(`Total Commits: ${this.metrics.commits}`)

    if (total.code > 0) {
      const commitsPerLoc = this.metrics.commits / total.code
      console.log(`Commits per Line of Code: ${commitsPerLoc.toFixed(4)}`)
    }

    // Category breakdown
    console.log('\n' + '#'.repeat(40))
    console.log('CATEGORY BREAKDOWN')
    console.log('#'.repeat(40))

    const categoriesData = []
    for (const [category, stats] of Object.entries(this.metrics.byCategory)) {
      if (stats.loc > 0) {
        const catCommentRatio =
          stats.loc > 0 ? (stats.comment / stats.loc) * 100 : 0
        categoriesData.push([
          category.charAt(0).toUpperCase() + category.slice(1),
          stats.loc,
          stats.comment,
          `${catCommentRatio.toFixed(2)}%`,
        ])
      }
    }

    if (categoriesData.length > 0) {
      // Add total row
      categoriesData.push([
        'Total',
        total.loc,
        total.comment,
        `${commentRatio.toFixed(2)}%`,
      ])

      console.log(
        formatTable(categoriesData, [
          'Category',
          'LOC',
          'CLOC',
          'Comment Ratio',
        ])
      )
    }

    // Language breakdown
    console.log('\n' + '#'.repeat(40))
    console.log('PROGRAMMING LANGUAGES')
    console.log('#'.repeat(40))

    const languagesData = []
    const sortedLanguages = Object.entries(this.metrics.byLanguage).sort(
      (a, b) => b[1].loc - a[1].loc
    )

    for (const [language, stats] of sortedLanguages) {
      if (stats.loc > 0) {
        const percentage = total.loc > 0 ? (stats.loc / total.loc) * 100 : 0
        languagesData.push([
          language,
          stats.files,
          stats.loc,
          `${percentage.toFixed(2)}%`,
        ])
      }
    }

    if (languagesData.length > 0) {
      console.log(
        formatTable(languagesData, ['Language', 'Files', 'LOC', 'Percentage'])
      )
    }

    // Most significant modules/files
    console.log('\n' + '#'.repeat(40))
    console.log('TOP MODULES BY SIZE')
    console.log('#'.repeat(40))

    // Group files by category
    const frontendFiles = []

    for (const [filePath, stats] of Object.entries(this.metrics.byFile)) {
      const category = this.getFileCategory(filePath)
      const fileInfo = [filePath, stats]

      if (category === 'frontend') {
        frontendFiles.push(fileInfo)
      }
    }

    // Sort by lines of code
    frontendFiles.sort((a, b) => b[1].loc - a[1].loc)

    // Print top frontend modules
    if (frontendFiles.length > 0) {
      console.log('\nFrontend Module Breakdown')
      const frontendData = frontendFiles
        .slice(0, 10)
        .map(([filePath, stats]) => [path.basename(filePath), stats.loc])

      console.log(formatTable(frontendData, ['Module', 'Lines of Code']))
    }

    // Complexity metrics
    console.log('\n' + '#'.repeat(40))
    console.log('COMPLEXITY METRICS')
    console.log('#'.repeat(40))

    if (Object.keys(this.metrics.complexity.byFile).length > 0) {
      const filesWithComplexity = {}
      const frontendComplexity = []

      for (const [filePath, complexity] of Object.entries(
        this.metrics.complexity.byFile
      )) {
        if (complexity > 0) {
          const category = this.getFileCategory(filePath)
          filesWithComplexity[filePath] = [complexity, category]

          if (category === 'frontend') {
            frontendComplexity.push(complexity)
          }
        }
      }

      // Calculate averages
      const frontendAvg =
        frontendComplexity.length > 0
          ? frontendComplexity.reduce((a, b) => a + b, 0) /
            frontendComplexity.length
          : 0

      // Find max complexity files
      let frontendMaxFile = ['N/A', 0]

      for (const [filePath, [complexity, category]] of Object.entries(
        filesWithComplexity
      )) {
        if (category === 'frontend' && complexity > frontendMaxFile[1]) {
          frontendMaxFile = [filePath, complexity]
        }
      }

      const complexityData = [
        [
          'Frontend',
          `${frontendAvg.toFixed(1)}`,
          `${frontendMaxFile[1]} (${path.basename(frontendMaxFile[0])})`,
        ],
      ]

      console.log(
        formatTable(complexityData, [
          'Repository',
          'Avg. Cyclomatic Complexity',
          'Max Cyclomatic Complexity',
        ])
      )
    }

    // Structure analysis
    console.log('\n' + '#'.repeat(40))
    console.log('STRUCTURE ANALYSIS')
    console.log('#'.repeat(40))

    const structureData = []

    // Calculate structure metrics by category
    const frontendFileCount = Object.entries(this.metrics.byFile).filter(
      ([f]) => this.getFileCategory(f) === 'frontend'
    ).length

    // Count directories that contain frontend files
    const frontendDirs = new Set()
    for (const filePath of Object.keys(this.metrics.byFile)) {
      if (this.getFileCategory(filePath) === 'frontend') {
        frontendDirs.add(path.dirname(filePath))
      }
    }

    structureData.push([
      'Frontend',
      frontendFileCount,
      frontendDirs.size,
      this.metrics.structure.classes,
      this.metrics.structure.methods + this.metrics.structure.functions,
    ])

    console.log(
      formatTable(structureData, [
        'Category',
        'Files',
        'Directories',
        'Classes',
        'Methods/Functions',
      ])
    )

    // Code quality assessment
    console.log('\n' + '#'.repeat(40))
    console.log('CODE QUALITY ASSESSMENT')
    console.log('#'.repeat(40))

    // Simple algorithm to assess code quality based on metrics
    const assessRating = (value, thresholds) => {
      for (const [threshold, rating] of thresholds) {
        if (value >= threshold) {
          return rating
        }
      }
      return 'Poor'
    }

    // Comment ratio assessment
    const commentRatioRating = assessRating(commentRatio, [
      [20, 'Excellent'],
      [15, 'Good'],
      [10, 'Average'],
      [5, 'Fair'],
    ])

    // Define default frontendComplexity array if it doesn't exist in this scope
    const frontendComplexity = Object.entries(this.metrics.complexity.byFile)
      .filter(
        ([filePath, complexity]) =>
          complexity > 0 && this.getFileCategory(filePath) === 'frontend'
      )
      .map(([, complexity]) => complexity)

    // Complexity assessment (lower is better)
    const frontendAvgComplexity =
      frontendComplexity && frontendComplexity.length > 0
        ? frontendComplexity.reduce((a, b) => a + b, 0) /
          frontendComplexity.length
        : 0
    const complexityRating = assessRating(-frontendAvgComplexity, [
      [-3, 'Excellent'],
      [-5, 'Good'],
      [-8, 'Average'],
      [-12, 'Fair'],
    ])

    // Simple assessment for modular design
    let modularRating = 'Good' // Default
    if (this.metrics.structure.classes > 10 && frontendFileCount > 20) {
      modularRating = 'Excellent'
    } else if (this.metrics.structure.classes < 3 && frontendFileCount > 15) {
      modularRating = 'Fair'
    }

    // Maintainability assessment (composite of other metrics)
    let maintainabilityRating
    if (
      ['Good', 'Excellent'].includes(commentRatioRating) &&
      ['Good', 'Excellent'].includes(complexityRating)
    ) {
      maintainabilityRating = 'Excellent'
    } else if (
      ['Fair', 'Poor'].includes(commentRatioRating) &&
      ['Fair', 'Poor'].includes(complexityRating)
    ) {
      maintainabilityRating = 'Fair'
    } else {
      maintainabilityRating = 'Good'
    }

    const qualityData = [
      [
        'Documentation',
        commentRatioRating,
        `${commentRatio.toFixed(1)}% comment ratio`,
      ],
      [
        'Complexity',
        complexityRating,
        `Avg. complexity: ${frontendAvgComplexity.toFixed(1)}`,
      ],
      [
        'Modularity',
        modularRating,
        `${this.metrics.structure.classes} classes, ${this.metrics.structure.directories.size} directories`,
      ],
      [
        'Maintainability',
        maintainabilityRating,
        'Based on documentation and complexity',
      ],
    ]

    console.log(formatTable(qualityData, ['Metric', 'Rating', 'Comments']))
  }
}

async function main() {
  console.log('Frontend Code Metrics Analysis Tool')
  console.log('==================================')

  // Get project root (current directory or parent if in scripts)
  const currentDir = process.cwd()

  let projectRoot
  if (path.basename(currentDir) === 'scripts') {
    projectRoot = path.dirname(currentDir)
  } else {
    projectRoot = currentDir
  }

  // Create and run the metrics analyzer
  console.log('Analyzing frontend code metrics... This may take a moment.')
  const analyzer = new CodeMetrics(projectRoot)
  await analyzer.analyze()
  analyzer.printReport()
}

// Use ES module pattern instead of CommonJS
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Error running code analysis:', error)
    process.exit(1)
  })
}
