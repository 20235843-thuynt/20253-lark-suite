#!/usr/bin/env node

/**
 * Script tự động xuất sơ đồ .drawio trong docs/diagrams/ sang PNG Retina 2x
 *
 * Cách dùng:
 *   node scripts/export-diagrams.js                     # xuất TẤT CẢ .drawio
 *   node scripts/export-diagrams.js activity-rescue     # chỉ xuất 1 file (có/không đuôi .drawio đều được)
 *   node scripts/export-diagrams.js a.drawio b.drawio   # xuất nhiều file cụ thể
 *   hoặc: npm run export-diagrams
 *         npm run export-diagrams -- activity-rescue
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// docs/ nằm ở gốc repo (parent của scripts/), nên đi lên 1 cấp từ scripts/
const DIAGRAM_DIR = path.join(__dirname, '../docs/diagrams');

// Binary draw.io: ưu tiên biến môi trường DRAWIO_BIN, mặc định 'drawio' (desktop CLI trên PATH,
// vd cài qua Homebrew: `brew install --cask drawio`). KHÔNG dùng gói npm `drawio-cli` (không tồn tại).
const DRAWIO_BIN = process.env.DRAWIO_BIN || 'drawio';

// Lề (px) chừa quanh sơ đồ khi export để tránh crop sát mép. Chỉnh qua biến DRAWIO_BORDER.
const BORDER = process.env.DRAWIO_BORDER || '24';

if (!fs.existsSync(DIAGRAM_DIR)) {
  console.error(`❌ Thư mục ${DIAGRAM_DIR} không tồn tại.`);
  process.exit(1);
}

// Tham số dòng lệnh: nếu có tên file -> chỉ xuất các file đó; không có -> xuất tất cả.
// Chấp nhận tên có/không đuôi .drawio, và cả đường dẫn (chỉ lấy basename).
const args = process.argv.slice(2);

let files;
if (args.length > 0) {
  files = [];
  for (const arg of args) {
    const name = path.basename(arg).replace(/\.drawio$/i, '') + '.drawio';
    if (!fs.existsSync(path.join(DIAGRAM_DIR, name))) {
      console.error(`❌ Không tìm thấy ${name} trong ${DIAGRAM_DIR}`);
      process.exit(1);
    }
    files.push(name);
  }
} else {
  files = fs.readdirSync(DIAGRAM_DIR).filter((file) => file.endsWith('.drawio'));
}

if (files.length === 0) {
  console.log('ℹ️ Không tìm thấy file .drawio nào trong docs/diagrams/.');
  process.exit(0);
}

console.log(`🎨 Bắt đầu xuất ${files.length} sơ đồ Draw.io...\n`);

for (const file of files) {
  const filePath = path.join(DIAGRAM_DIR, file);
  const basename = path.basename(file, '.drawio');
  const pngPath = path.join(DIAGRAM_DIR, `${basename}.png`);

  console.log(`📌 Processing: ${file}`);

  try {
    // Export PNG Retina 2x for Lark Docs (dùng drawio desktop CLI đã cài, vd Homebrew: /opt/homebrew/bin/drawio)
    // --border: chừa lề quanh sơ đồ để ảnh không bị crop sát mép (mặc định drawio = 0 → xấu).
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
