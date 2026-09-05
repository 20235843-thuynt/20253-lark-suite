#!/usr/bin/env node
/**
 * drawio-inline-link.js
 * Tạo edit link tự chứa của draw.io (#R<payload>) nhúng thẳng XML vào URL
 * để mở/sửa trên draw.io Web mà KHÔNG cần push file .drawio lên remote.
 *
 * Payload = XML .drawio -> deflateRaw -> base64 -> URL-encode
 * (đúng format nút "Copy as URL" / #R của draw.io).
 *
 * Cách dùng:
 *   node drawio-inline-link.js <path-to.drawio> [title]
 *
 * In ra:
 *   - Full edit URL
 *   - Độ dài URL (đã encode)
 *   - Cảnh báo nếu URL >= ngưỡng an toàn (edge/Akamai chặn request-line dài -> "Bad Request")
 *
 * Không cần cài package: chỉ dùng module chuẩn fs/path/zlib của Node.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Ngưỡng an toàn cho độ dài URL đã encode. Vượt ngưỡng này thì link #R
// có thể bị edge chặn ("Bad Request"). Đã gặp thực tế với URL 12-16k ký tự.
const SAFE_URL_LEN = 8000;

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node drawio-inline-link.js <path-to.drawio> [title]');
    process.exit(1);
  }
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    console.error(`File không tồn tại: ${abs}`);
    process.exit(1);
  }

  const title = process.argv[3] || path.basename(abs);
  const xml = fs.readFileSync(abs, 'utf8');

  const deflated = zlib.deflateRawSync(Buffer.from(xml, 'utf8'));
  const payload = encodeURIComponent(deflated.toString('base64'));
  const url = `https://app.diagrams.net/?title=${encodeURIComponent(title)}#R${payload}`;

  console.log('');
  console.log(`  Source     : ${abs}`);
  console.log(`  XML bytes  : ${Buffer.byteLength(xml, 'utf8')}`);
  console.log(`  URL length : ${url.length} (ngưỡng an toàn ~${SAFE_URL_LEN})`);
  console.log('');
  console.log(url);
  console.log('');

  if (url.length >= SAFE_URL_LEN) {
    console.error(
      `⚠️  URL ${url.length} >= ${SAFE_URL_LEN} ký tự — link #R có thể vỡ ("Bad Request").\n` +
      `    Fallback: upload .drawio lên Lark Drive (lark-cli drive +upload) và link tới đó,\n` +
      `    hoặc push GitHub + dùng ?url=raw.githubusercontent...`
    );
    process.exit(2);
  }
}

main();
