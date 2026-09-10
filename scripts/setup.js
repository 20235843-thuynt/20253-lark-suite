#!/usr/bin/env node

/**
 * Workspace provisioning: validate deps, init config.json, ensure dirs.
 * Usage: npm run setup (or node scripts/setup.js)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');
const EXAMPLE = path.join(REPO_ROOT, 'config.example.json');
const TARGET = path.join(REPO_ROOT, 'config.json');
const DIRS = ['docs', path.join('docs', 'diagrams'), '.state'];

const fail = (msg) => {
  console.error(`❌ ${msg}`);
  process.exit(1);
};
const warn = (msg) => console.warn(`⚠️ ${msg}`);

// 1. Required deps: Node >= 20, npm present. Fail with guide, never auto-install.
const major = parseInt(process.versions.node.split('.')[0], 10);
if (Number.isNaN(major) || major < 20) {
  fail(`Node >= 20 required (found ${process.versions.node}). Upgrade: https://nodejs.org`);
}
try {
  execSync('npm --version', { stdio: 'ignore' });
} catch {
  fail('npm not found. Install Node >= 20 (bundles npm): https://nodejs.org');
}
console.log(`✅ Node ${process.versions.node} + npm OK`);

// 2. Optional deps: warn-only with fix guide.
// ponytail: warn-only presence checks, add version-pin check if drift causes sync/export failures
try {
  execSync('npx --no-install lark-cli --version', { stdio: 'ignore' });
} catch {
  warn('lark-cli missing. Fix: npm i -g @larksuite/cli && lark-cli auth login');
}
try {
  require.resolve('@drawio/mcp-server', { paths: [REPO_ROOT] });
} catch {
  warn('Draw.io MCP not found. See README.md §4 (mcpServers.drawio via npx -y @drawio/mcp-server)');
}

// 3. Config root-only: copy example once, validate parse, never overwrite.
if (!fs.existsSync(EXAMPLE)) fail(`Missing template: ${EXAMPLE}`);
try {
  JSON.parse(fs.readFileSync(EXAMPLE, 'utf8'));
} catch (e) {
  fail(`Invalid template ${EXAMPLE}: ${e.message}`);
}
if (!fs.existsSync(TARGET)) {
  fs.copyFileSync(EXAMPLE, TARGET);
  console.log('✅ Created config.json from config.example.json (fill in your IDs)');
} else {
  try {
    JSON.parse(fs.readFileSync(TARGET, 'utf8'));
    console.log('✅ config.json exists and parses OK (left untouched)');
  } catch (e) {
    fail(`Invalid config.json: ${e.message}`);
  }
}

// 4. Directories.
for (const d of DIRS) fs.mkdirSync(path.join(REPO_ROOT, d), { recursive: true });
console.log('✅ Dirs OK: docs/, docs/diagrams/, .state/');
console.log('🚀 Setup complete');
