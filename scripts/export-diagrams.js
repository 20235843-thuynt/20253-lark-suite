#!/usr/bin/env node

/**
 * Script tự động xuất tất cả sơ đồ .drawio trong docs/diagrams/ sang SVG và PNG Retina 2x
 * 
 * Cách dùng:
 *   node scripts/export-diagrams.js
 *   hoặc: npm run export-diagrams
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIAGRAM_DIR = path.join(__dirname, '../docs/diagrams');

if (!fs.existsSync(DIAGRAM_DIR)) {
  console.error(`❌ Thư mục ${DIAGRAM_DIR} không tồn tại.`);
  process.exit(1);
}

const files = fs.readdirSync(DIAGRAM_DIR).filter(file => file.endsWith('.drawio'));

if (files.length === 0) {
  console.log('ℹ️ Không tìm thấy file .drawio nào trong docs/diagrams/.');
  process.exit(0);
}

console.log('🎨 Bắt đầu xuất các sơ đồ Draw.io...\n');

for (const file of files) {
  const filePath = path.join(DIAGRAM_DIR, file);
  const basename = path.basename(file, '.drawio');
  const svgPath = path.join(DIAGRAM_DIR, `${basename}.drawio.svg`);
  const pngPath = path.join(DIAGRAM_DIR, `${basename}.png`);

  console.log(`📌 Processing: ${file}`);

  try {
    // Export SVG for repository docs
    console.log(`   -> Exporting SVG: ${basename}.drawio.svg`);
    execSync(`npx -y drawio-cli -x -f svg -o "${svgPath}" "${filePath}"`, { stdio: 'inherit' });

    // Export PNG Retina 2x for Lark Docs
    console.log(`   -> Exporting PNG Retina 2x: ${basename}.png`);
    execSync(`npx -y drawio-cli -x -f png --scale 2 -o "${pngPath}" "${filePath}"`, { stdio: 'inherit' });

    console.log(`   ✅ Hoàn tất: ${basename}\n`);
  } catch (err) {
    console.error(`   ❌ Lỗi xuất sơ đồ ${file}:`, err.message);
  }
}

console.log('✨ Hoàn tất xuất tất cả sơ đồ Draw.io!');
