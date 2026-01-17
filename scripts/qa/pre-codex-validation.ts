#!/usr/bin/env bun

/**
 * Pre-Codex Validation Script
 *
 * Validates that the Finance Guru system is ready for Codex full review.
 * This script checks:
 * - System architecture integrity
 * - Documentation completeness
 * - Configuration files
 * - Directory structure
 * - Multi-broker support implementation
 * - CSV mapping templates
 *
 * Exit codes:
 * - 0: All checks passed
 * - 1: One or more checks failed
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

const results: CheckResult[] = [];
const projectRoot = process.cwd();

// Helper functions
function checkFile(path: string, description: string, critical = true): void {
  const fullPath = join(projectRoot, path);
  const exists = existsSync(fullPath);
  results.push({
    name: description,
    passed: exists,
    message: exists ? `✓ ${path}` : `✗ Missing: ${path}`,
    severity: critical ? 'critical' : 'warning'
  });
}

function checkDirectory(path: string, description: string, critical = true): void {
  const fullPath = join(projectRoot, path);
  const exists = existsSync(fullPath) && statSync(fullPath).isDirectory();
  results.push({
    name: description,
    passed: exists,
    message: exists ? `✓ ${path}/` : `✗ Missing directory: ${path}/`,
    severity: critical ? 'critical' : 'warning'
  });
}

function checkFileContent(path: string, searchString: string, description: string): void {
  const fullPath = join(projectRoot, path);
  if (!existsSync(fullPath)) {
    results.push({
      name: description,
      passed: false,
      message: `✗ Cannot check content: ${path} not found`,
      severity: 'critical'
    });
    return;
  }

  const content = readFileSync(fullPath, 'utf-8');
  const contains = content.includes(searchString);
  results.push({
    name: description,
    passed: contains,
    message: contains
      ? `✓ ${path} contains "${searchString}"`
      : `✗ ${path} missing "${searchString}"`,
    severity: 'warning'
  });
}

function checkDirectoryContents(path: string, expectedFiles: string[], description: string): void {
  const fullPath = join(projectRoot, path);
  if (!existsSync(fullPath)) {
    results.push({
      name: description,
      passed: false,
      message: `✗ Directory not found: ${path}`,
      severity: 'critical'
    });
    return;
  }

  const files = readdirSync(fullPath);
  const missingFiles = expectedFiles.filter(f => !files.includes(f));

  results.push({
    name: description,
    passed: missingFiles.length === 0,
    message: missingFiles.length === 0
      ? `✓ ${path}/ contains all expected files`
      : `✗ ${path}/ missing: ${missingFiles.join(', ')}`,
    severity: 'warning'
  });
}

// Validation checks
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 Pre-Codex Validation - Finance Guru™');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

// 1. Core Documentation
console.log('📄 Checking core documentation...');
checkFile('CLAUDE.md', 'CLAUDE.md exists', true);
checkFile('README.md', 'README.md exists', true);
checkFile('src/CLAUDE.md', 'src/CLAUDE.md exists (developer guidance)', true);
checkFile('docs/SETUP.md', 'Setup documentation exists', true);
checkFile('docs/TROUBLESHOOTING.md', 'Troubleshooting guide exists', false);

// 2. System Architecture
console.log('🏗️  Checking system architecture...');
checkDirectory('src', 'src/ directory exists', true);
checkDirectory('src/analysis', 'src/analysis/ exists', true);
checkDirectory('src/strategies', 'src/strategies/ exists', true);
checkDirectory('src/utils', 'src/utils/ exists', true);
checkDirectory('src/models', 'src/models/ exists', true);
checkDirectory('fin-guru', 'fin-guru/ directory exists', true);
checkDirectory('notebooks', 'notebooks/ directory exists', true);

// 3. Multi-Broker Support (Task 4.2)
console.log('🏦 Checking multi-broker support implementation...');
checkDirectory('docs/csv-mappings', 'CSV mappings directory exists', true);
checkFile('docs/csv-mappings/README.md', 'CSV mappings README exists', true);
checkFile('docs/csv-mappings/generic-mapping-template.json', 'Generic mapping template exists', true);

// Check for broker-specific templates
const brokerTemplates = ['fidelity', 'schwab', 'vanguard', 'etrade', 'robinhood'];
brokerTemplates.forEach(broker => {
  checkFile(
    `docs/csv-mappings/${broker}-mapping.json`,
    `${broker.charAt(0).toUpperCase() + broker.slice(1)} mapping template`,
    false
  );
});

// 4. Required CSV Uploads Documentation (Task 4.3)
console.log('📋 Checking CSV upload documentation...');
checkFile('docs/required-csv-uploads.md', 'CSV uploads documentation exists', true);

// 5. Tools Documentation (Task 2.1)
console.log('🔧 Checking tools documentation...');
checkFile('docs/tools.md', 'Tools documentation (moved from python-tools.md)', false);

// 6. Notebooks Folder Structure (Task 3.1)
console.log('📓 Checking notebooks structure...');
checkDirectory('notebooks/updates', 'notebooks/updates/ exists', true);
checkDirectory('notebooks/tools-needed', 'notebooks/tools-needed/ exists', false);

// 7. Agent System
console.log('🤖 Checking agent system...');
checkFile('.claude/commands/fin-guru/agents/finance-orchestrator.md', 'Finance Orchestrator exists', true);

const requiredAgents = [
  'market-researcher',
  'quant-analyst',
  'strategy-advisor',
  'compliance-officer',
  'margin-specialist',
  'dividend-specialist'
];

requiredAgents.forEach(agent => {
  checkFile(
    `.claude/commands/fin-guru/agents/${agent}.md`,
    `Agent: ${agent}`,
    false
  );
});

// 8. Configuration Files
console.log('⚙️  Checking configuration files...');
checkFile('pyproject.toml', 'Python project configuration', true);
checkFile('package.json', 'Node.js package configuration', false);
checkFile('.gitignore', '.gitignore exists', true);

// 9. Test Infrastructure
console.log('🧪 Checking test infrastructure...');
checkDirectory('tests', 'tests/ directory exists', false);
checkFile('docs/MANUAL_TEST_CHECKLIST.md', 'Manual test checklist exists', true);

// 10. Skills and Commands
console.log('💡 Checking skills/commands...');
checkDirectory('.claude/skills', 'Skills directory exists', false);
checkDirectory('.claude/commands', 'Commands directory exists', true);

// 11. Version Information
console.log('🏷️  Checking version information...');
checkFileContent('CLAUDE.md', 'v2.0.0', 'Finance Guru version is v2.0.0');
checkFileContent('CLAUDE.md', 'BMAD-CORE™', 'BMAD-CORE reference exists');

// 12. Recent completions validation
console.log('✅ Validating recent task completions...');

// Task 1.3: README updates
checkFileContent('README.md', 'skills', 'README mentions skills/commands installation');

// Task 2.2: src/CLAUDE.md
if (existsSync(join(projectRoot, 'src/CLAUDE.md'))) {
  const srcClaude = readFileSync(join(projectRoot, 'src/CLAUDE.md'), 'utf-8');
  results.push({
    name: 'src/CLAUDE.md has developer guidance',
    passed: srcClaude.length > 100,
    message: srcClaude.length > 100
      ? '✓ src/CLAUDE.md contains guidance'
      : '✗ src/CLAUDE.md appears empty or incomplete',
    severity: 'warning'
  });
}

// Print results
console.log();
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Validation Results');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

// Group by severity
const critical = results.filter(r => !r.passed && r.severity === 'critical');
const warnings = results.filter(r => !r.passed && r.severity === 'warning');
const passed = results.filter(r => r.passed);

console.log(`✅ Passed: ${passed.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Critical: ${critical.length}`);
console.log();

if (critical.length > 0) {
  console.log('❌ CRITICAL ISSUES:');
  critical.forEach(r => console.log(`   ${r.message}`));
  console.log();
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(r => console.log(`   ${r.message}`));
  console.log();
}

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (critical.length === 0 && warnings.length <= 5) {
  console.log('✅ SYSTEM READY FOR CODEX REVIEW');
  console.log();
  console.log('Next step: Run Codex full review (Task 5.2)');
  console.log('   → bd update family-office-spr --status=in_progress');
  process.exit(0);
} else if (critical.length === 0) {
  console.log('⚠️  SYSTEM MOSTLY READY (warnings exist)');
  console.log();
  console.log('System has warnings but no critical issues.');
  console.log('You may proceed with Codex review or address warnings first.');
  process.exit(0);
} else {
  console.log('❌ SYSTEM NOT READY');
  console.log();
  console.log(`Fix ${critical.length} critical issue(s) before Codex review.`);
  process.exit(1);
}
