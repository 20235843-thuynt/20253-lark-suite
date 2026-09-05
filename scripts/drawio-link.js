#!/usr/bin/env node

/**
 * Sinh link nhúng XML "#R" của draw.io từ một file .drawio trong docs/diagrams/.
 *
 * Link dạng: https://app.diagrams.net/#R<encoded>
 *   trong đó <encoded> = encodeURIComponent( base64( deflateRaw( encodeURIComponent(xml) ) ) )
 * Đây là định dạng draw.io yêu cầu cho fragment "#R" (nội dung sơ đồ nằm ngay trong URL,
 * KHÔNG cần push .drawio lên GitHub). KHÔNG dán XML thô vào sau #R (URL sẽ hỏng → Bad Request).
 *
 * Cách dùng (từ trong lark-suite/):
 *   node scripts/drawio-link.js system-context          # in link cho docs/diagrams/system-context.drawio
 *   node scripts/drawio-link.js system-context.drawio    # có/không đuôi .drawio đều được
 *   node scripts/drawio-link.js a b c                    # nhiều file, mỗi dòng "<name>\t<link>"
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DIAGRAM_DIR = path.join(__dirname, '../../docs/diagrams');

// Tách <mxGraphModel>...</mxGraphModel> khỏi wrapper <mxfile> nếu có.
function extractGraphModel(xml) {
  const start = xml.indexOf('<mxGraphModel');
  const end = xml.lastIndexOf('</mxGraphModel>');
  if (start !== -1 && end !== -1) {
    return xml.slice(start, end + '</mxGraphModel>'.length);
  }
  return xml;
}

function encodeForDrawio(xml) {
  const model = extractGraphModel(xml);
  const encoded = encodeURIComponent(model);
  const deflated = zlib.deflateRawSync(Buffer.from(encoded, 'utf8'));
  const b64 = deflated.toString('base64');
  return encodeURIComponent(b64);
}

function decodeFromDrawio(fragment) {
  const b64 = decodeURIComponent(fragment);
  const inflated = zlib.inflateRawSync(Buffer.from(b64, 'base64')).toString('utf8');
  return decodeURIComponent(inflated);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Cách dùng: node scripts/drawio-link.js <name> [<name> ...]');
  process.exit(1);
}

for (const arg of args) {
  const name = path.basename(arg).replace(/\.drawio$/i, '') + '.drawio';
  const file = path.join(DIAGRAM_DIR, name);
  if (!fs.existsSync(file)) {
    console.error(`❌ Không tìm thấy ${name} trong ${DIAGRAM_DIR}`);
    process.exit(1);
  }
  const xml = fs.readFileSync(file, 'utf8');
  const frag = encodeForDrawio(xml);

  // round-trip verify để chắc chắn link không hỏng
  if (decodeFromDrawio(frag).trim() !== extractGraphModel(xml).trim()) {
    console.error(`❌ Round-trip verify thất bại cho ${name}`);
    process.exit(1);
  }

  const link = 'https://app.diagrams.net/#R' + frag;
  if (args.length === 1) {
    console.log(link);
  } else {
    console.log(`${name}\t${link}`);
  }
}
