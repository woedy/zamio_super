#!/usr/bin/env node

/**
 * Comprehensive test runner for ZamIO frontend applications
 * Supports different test modes and reporting options
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    log(`\n${'='.repeat(60)}`, 'cyan')
    log(`Running: ${command} ${args.join(' ')}`, 'bright')
    log('='.repeat(60), 'cyan')
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options,
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        log(`✅ Command completed successfully`, 'green')
        resolve(code)
      } else {
        log(`❌ Command failed with exit code ${code}`, 'red')
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })
    
    child.on('error', (error) => {
      log(`❌ Command error: ${error.message}`, 'red')
      reject(error)
    })
  })
}

async function checkDependencies() {
  log('Checking dependencies...', 'yellow')
  
  if (!fs.existsSync('node_modules')) {
    log('Installing dependencies...', 'yellow')
    await runCommand('npm', ['install'])
  }
  
  log('✅ Dependencies ready', 'green')
}

async function runUnitTests(options = {}) {
  log('Running unit tests...', 'blue')
  
  const args = ['test']
  
  if (options.coverage) {
    args.push('--coverage')
  }
  
  if (options.watch) {
    args.push('--watch')
  } else {
    args.push('--run')
  }
  
  if (options.ui) {
    args.push('--ui')
  }
  
  if (options.reporter) {
    args.push('--reporter', options.reporter)
  }
  
  await runCommand('npm', args)
}

async function runAccessibilityTests() {
  log('Running accessibility tests...', 'blue')
  
  await runCommand('npm', ['run', 'test:accessibility'])
}

async function runE2ETests(options = {}) {
  log('Running end-to-end tests...', 'blue')
  
  // Build the application first
  log('Building application for E2E tests...', 'yellow')
  await runCommand('npm', ['run', 'build'])
  
  const args = ['run', 'test:e2e']
  
  if (options.ui) {
    args[2] = 'test:e2e:ui'
  }
  
  if (options.headed) {
    args.push('--', '--headed')
  }
  
  if (options.browser) {
    args.push('--', '--project', options.browser)
  }
  
  await runCommand('npm', args)
}

async function runLinting() {
  log('Running linting...', 'blue')
  
  // Check if ESLint is configured
  if (fs.existsSync('.eslintrc.js') || fs.existsSync('.eslintrc.json')) {
    await runCommand('npx', ['eslint', 'src', '--ext', '.ts,.tsx'])
  } else {
    log('⚠️  ESLint not configured, skipping...', 'yellow')
  }
}

async function runTypeChecking() {
  log('Running TypeScript type checking...', 'blue')
  
  await runCommand('npx', ['tsc', '--noEmit'])
}

async function generateReports(options = {}) {
  log('Generating test reports...', 'blue')
  
  const reportsDir = 'test-reports'
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }
  
  // Generate coverage report
  if (options.coverage) {
    log('Generating coverage report...', 'yellow')
    await runCommand('npm', ['run', 'test:coverage'])
  }
  
  // Generate accessibility report
  if (options.accessibility) {
    log('Generating accessibility report...', 'yellow')
    await runAccessibilityTests()
  }
  
  log('📊 Reports generated in test-reports/', 'green')
}

function printUsage() {
  log('\nZamIO Frontend Test Runner', 'bright')
  log('Usage: node run-tests.js [options]', 'cyan')
  log('\nOptions:', 'bright')
  log('  --mode <mode>        Test mode: unit, e2e, accessibility, all (default: all)', 'cyan')
  log('  --coverage           Generate coverage report', 'cyan')
  log('  --watch              Run tests in watch mode', 'cyan')
  log('  --ui                 Run tests with UI', 'cyan')
  log('  --headed             Run E2E tests in headed mode', 'cyan')
  log('  --browser <name>     Run E2E tests on specific browser', 'cyan')
  log('  --lint               Run linting', 'cyan')
  log('  --type-check         Run TypeScript type checking', 'cyan')
  log('  --reports            Generate comprehensive reports', 'cyan')
  log('  --help               Show this help message', 'cyan')
  log('\nExamples:', 'bright')
  log('  node run-tests.js --mode unit --coverage', 'yellow')
  log('  node run-tests.js --mode e2e --browser chromium', 'yellow')
  log('  node run-tests.js --mode accessibility', 'yellow')
  log('  node run-tests.js --lint --type-check', 'yellow')
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help')) {
    printUsage()
    return
  }
  
  const options = {
    mode: 'all',
    coverage: false,
    watch: false,
    ui: false,
    headed: false,
    browser: null,
    lint: false,
    typeCheck: false,
    reports: false,
  }
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--mode':
        options.mode = args[++i]
        break
      case '--coverage':
        options.coverage = true
        break
      case '--watch':
        options.watch = true
        break
      case '--ui':
        options.ui = true
        break
      case '--headed':
        options.headed = true
        break
      case '--browser':
        options.browser = args[++i]
        break
      case '--lint':
        options.lint = true
        break
      case '--type-check':
        options.typeCheck = true
        break
      case '--reports':
        options.reports = true
        break
    }
  }
  
  try {
    log('🚀 Starting ZamIO Frontend Tests', 'bright')
    log(`Mode: ${options.mode}`, 'cyan')
    
    await checkDependencies()
    
    // Run linting if requested
    if (options.lint) {
      await runLinting()
    }
    
    // Run type checking if requested
    if (options.typeCheck) {
      await runTypeChecking()
    }
    
    // Run tests based on mode
    switch (options.mode) {
      case 'unit':
        await runUnitTests(options)
        break
        
      case 'e2e':
        await runE2ETests(options)
        break
        
      case 'accessibility':
        await runAccessibilityTests()
        break
        
      case 'all':
        await runUnitTests(options)
        await runAccessibilityTests()
        await runE2ETests(options)
        break
        
      default:
        throw new Error(`Unknown test mode: ${options.mode}`)
    }
    
    // Generate reports if requested
    if (options.reports) {
      await generateReports(options)
    }
    
    log('\n🎉 All tests completed successfully!', 'green')
    
  } catch (error) {
    log(`\n💥 Test execution failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n⚠️  Test execution interrupted', 'yellow')
  process.exit(1)
})

process.on('SIGTERM', () => {
  log('\n⚠️  Test execution terminated', 'yellow')
  process.exit(1)
})

if (require.main === module) {
  main()
}

module.exports = {
  runUnitTests,
  runE2ETests,
  runAccessibilityTests,
  runLinting,
  runTypeChecking,
}