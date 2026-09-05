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

// 1. Xác định thư mục diagrams: CLI arg -> env DIAGRAM_DIR -> env PROJECT_DIR/docs/diagrams -> cwd()/docs/diagrams -> __dirname/../docs/diagrams
const cliArg = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
let customDir = null;
if (cliArg) {
  const resolved = path.isAbsolute(cliArg) ? cliArg : path.resolve(process.cwd(), cliArg);
  if (fs.existsSync(resolved)) {
    const subDiagrams = path.join(resolved, 'docs/diagrams');
    customDir = fs.existsSync(subDiagrams) ? subDiagrams : resolved;
  }
}

const candidateDirs = [
  customDir,
  process.env.DIAGRAM_DIR,
  process.env.PROJECT_DIR ? path.join(process.env.PROJECT_DIR, 'docs/diagrams') : null,
  path.join(process.cwd(), 'docs/diagrams'),
  path.join(__dirname, '../docs/diagrams'),
  path.join(__dirname, '../../docs/diagrams'),
].filter(Boolean);

const DIAGRAM_DIR = candidateDirs.find((d) => fs.existsSync(d));

if (!DIAGRAM_DIR) {
  console.error(`❌ Không tìm thấy thư mục diagrams hợp lệ trong các vị trí sau:\n${candidateDirs.map(d => `   - ${d}`).join('\n')}\n\nGợi ý: Truyền đường dẫn: node scripts/export-diagrams.js <path/to/project_or_diagrams>`);
  process.exit(1);
}

// Binary draw.io: ưu tiên biến môi trường DRAWIO_BIN, mặc định 'drawio'
const DRAWIO_BIN = process.env.DRAWIO_BIN || 'drawio';

// Lề (px) chừa quanh sơ đồ khi export để tránh crop sát mép. Chỉnh qua biến DRAWIO_BORDER.
const BORDER = process.env.DRAWIO_BORDER || '24';

const files = fs.readdirSync(DIAGRAM_DIR).filter((file) => file.endsWith('.drawio'));

if (files.length === 0) {
  console.log(`ℹ️ Không tìm thấy file .drawio nào trong ${DIAGRAM_DIR}.`);
  process.exit(0);
}

console.log(`🎨 Bắt đầu xuất các sơ đồ Draw.io từ: ${DIAGRAM_DIR}\n`);

for (const file of files) {
  const filePath = path.join(DIAGRAM_DIR, file);
  const basename = path.basename(file, '.drawio');
  const svgPath = path.join(DIAGRAM_DIR, `${basename}.drawio.svg`);
  const pngPath = path.join(DIAGRAM_DIR, `${basename}.png`);

  console.log(`📌 Processing: ${file}`);

  try {
    // Export SVG for repository docs
    console.log(`   -> Exporting SVG: ${basename}.drawio.svg`);
    execSync(`${DRAWIO_BIN} --export --format svg --border ${BORDER} -o "${svgPath}" "${filePath}"`, {
      stdio: 'inherit',
    });

    // Export PNG Retina 2x for Lark Docs
    console.log(`   -> Exporting PNG Retina 2x: ${basename}.png`);
    execSync(`${DRAWIO_BIN} --export --format png --scale 2 --border ${BORDER} -o "${pngPath}" "${filePath}"`, {
      stdio: 'inherit',
    });

    console.log(`   ✅ Hoàn tất: ${basename}\n`);
  } catch (err) {
    console.error(`   ❌ Lỗi xuất sơ đồ ${file}:`, err.message);
  }
}

console.log('✨ Hoàn tất xuất tất cả sơ đồ Draw.io!');

