#!/usr/bin/env node

/**
 * Global installer for Kiro (IDE + Crew): clone repo, run once, use everywhere.
 * Usage: npm run install:global  (or: node scripts/install-global.js)
 *
 * Does 3 idempotent things, never overwrites user config:
 *   1. skills/*            -> ~/.agents/skills/*        (global skills)
 *   2. .kiro/steering/*.md -> ~/.kiro/steering/         (global steering, IDE)
 *   3. merges mcpServers.drawio into ~/.kiro/settings/mcp.json (user-level MCP)
 *   4. registers ~/.agents/skills in Crew skills.extra_paths (global skills, Crew)
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const HOME = os.homedir();
const AGENTS_SKILLS = path.join(HOME, '.agents', 'skills');
const KIRO_STEERING = path.join(HOME, '.kiro', 'steering');
const KIRO_MCP = path.join(HOME, '.kiro', 'settings', 'mcp.json');
const CREW_CONFIG = path.join(HOME, '.kiro', 'crew', 'config.json');

const DRAWIO_SERVER = { command: 'npx', args: ['-y', '@drawio/mcp-server'] };

const copyFresh = (src, dst) => {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(src, dst, { recursive: true });
  console.log(`✅ ${path.relative(HOME, dst) || dst}`);
};

// 1+2. Skills + steering (copy-fresh: re-run after git pull to update).
for (const name of fs.readdirSync(path.join(REPO_ROOT, 'skills'))) {
  copyFresh(path.join(REPO_ROOT, 'skills', name), path.join(AGENTS_SKILLS, name));
}
fs.mkdirSync(KIRO_STEERING, { recursive: true });
for (const f of fs.readdirSync(path.join(REPO_ROOT, '.kiro', 'steering'))) {
  if (!f.endsWith('.md')) continue;
  fs.copyFileSync(path.join(REPO_ROOT, '.kiro', 'steering', f), path.join(KIRO_STEERING, f));
}
console.log(`✅ ${path.relative(HOME, KIRO_STEERING)}/*.md`);

// 3. User-level MCP: merge drawio, keep everything else untouched.
fs.mkdirSync(path.dirname(KIRO_MCP), { recursive: true });
let mcp = {};
try {
  mcp = JSON.parse(fs.readFileSync(KIRO_MCP, 'utf8'));
} catch { /* missing/invalid -> start fresh, user file never clobbered field-by-field */ }
mcp.mcpServers ??= {};
mcp.mcpServers.drawio ??= DRAWIO_SERVER;
fs.writeFileSync(KIRO_MCP, JSON.stringify(mcp, null, 2) + '\n');
console.log(`✅ ${path.relative(HOME, KIRO_MCP)} (mcpServers.drawio)`);

// 4. Crew: point skills.extra_paths at the global skills dir (one entry, idempotent).
try {
  const raw = fs.readFileSync(CREW_CONFIG, 'utf8');
  const crew = JSON.parse(raw);
  crew.skills ??= {};
  crew.skills.extra_paths ??= [];
  if (!crew.skills.extra_paths.includes(AGENTS_SKILLS)) {
    fs.copyFileSync(CREW_CONFIG, CREW_CONFIG + '.bak');
    crew.skills.extra_paths.push(AGENTS_SKILLS);
    fs.writeFileSync(CREW_CONFIG, JSON.stringify(crew, null, 2));
    console.log(`✅ crew skills.extra_paths += ${AGENTS_SKILLS} (.bak kept)`);
  } else {
    console.log('✅ crew skills.extra_paths already set');
  }
} catch (e) {
  console.warn(`⚠️ skipped Crew registration (${e.message}); IDE install above still applies`);
}

console.log('🚀 Done. Reload Kiro window / restart Crew gateway to pick up skills + MCP.');
