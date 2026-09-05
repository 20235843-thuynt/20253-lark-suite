#!/usr/bin/env node

/**
 * Script đồng bộ tự động tài liệu Lark Docs từ docs/doc-mapping.json
 * Tự động tạo Thư mục, upload tiêu đề, và đính kèm sơ đồ Draw.io dạng ảnh trực quan ĐÚNG VỊ TRÍ MỤC.
 * 
 * Cách dùng:
 *  1. Cập nhật tất cả docs:
 *     npm run sync  (hoặc node scripts/sync.js)
 * 
 *  2. Khởi tạo dự án mới vào một Folder cụ thể trên Lark Drive:
 *     node scripts/sync.js --init <FOLDER_TOKEN>
 * 
 *  3. Cập nhật 1 doc cụ thể:
 *     node scripts/sync.js --doc 01-prd
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const dirArgIdx = args.indexOf('--dir');
const targetDirArg = (dirArgIdx !== -1 && args[dirArgIdx + 1]) ? args[dirArgIdx + 1] : null;

let REPO_ROOT = null;
let MAPPING_FILE = null;

const candidateRoots = [
  targetDirArg ? (path.isAbsolute(targetDirArg) ? targetDirArg : path.resolve(process.cwd(), targetDirArg)) : null,
  process.env.PROJECT_DIR,
  process.cwd(),
  path.join(__dirname, '..'),
  path.join(__dirname, '../..'),
].filter(Boolean);

for (const dir of candidateRoots) {
  const mapFile = path.join(dir, 'docs/doc-mapping.json');
  if (fs.existsSync(mapFile)) {
    REPO_ROOT = dir;
    MAPPING_FILE = mapFile;
    break;
  }
}

if (!MAPPING_FILE) {
  console.error(`❌ Không tìm thấy file mapping docs/doc-mapping.json trong các vị trí:\n${candidateRoots.map((r) => `   - ${path.join(r, 'docs/doc-mapping.json')}`).join('\n')}\n\nGợi ý: Truyền đường dẫn thư mục dự án qua: node scripts/sync.js --dir <path/to/project>`);
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));

// Binary lark-cli: ưu tiên biến môi trường LARK_BIN, mặc định 'lark-cli'
const LARK_BIN = process.env.LARK_BIN || 'lark-cli';

const isInit = args.includes('--init');
let folderTokenIdx = args.indexOf('--init') + 1;
let folderToken = isInit && folderTokenIdx < args.length && !args[folderTokenIdx].startsWith('--') ? args[folderTokenIdx] : null;

// Nếu là --init nhưng không cung cấp folderToken -> Tự động tạo Folder mới trên Lark Drive!
if (isInit && !folderToken) {
  console.log('📁 Không thấy FOLDER_TOKEN được cung cấp. Đang tự động tạo Thư mục mới trên Lark Drive...');
  try {
    const createFolderCmd = `${LARK_BIN} drive +create-folder --name "Project Documentation"`;
    const folderOutput = execSync(createFolderCmd, { encoding: 'utf8', cwd: REPO_ROOT });
    let createdToken = null;
    try {
      const jsonRes = JSON.parse(folderOutput);
      createdToken = jsonRes?.data?.token || jsonRes?.data?.folder_token;
    } catch (e) {}
    if (!createdToken) {
      const match = folderOutput.match(/("token"|"folder_token"|token:)\s*:\s*"([^"]+)"/) || folderOutput.match(/fldcn[a-zA-Z0-9]+/);
      if (match) createdToken = match[2] || match[1] || match[0];
    }
    if (createdToken) {
      folderToken = createdToken;
      console.log(`✅ Đã tự động tạo Thư mục trên Lark Drive! Folder Token: ${folderToken}\n`);
    } else {
      console.log(`⚠️ Không tự động bóc tách được Folder Token. Sẽ tạo bài viết ở 'My Library'.\n`);
    }
  } catch (err) {
    console.warn(`⚠️ Không thể tự động tạo Thư mục (${err.message}). Sẽ tạo bài viết ở 'My Library'.\n`);
  }
}

const docArgIdx = args.indexOf('--doc') + 1;
const targetDocKey = args.includes('--doc') ? args[docArgIdx] : null;

console.log(`🚀 Bắt đầu tiến trình đồng bộ Lark Docs (Repo: ${REPO_ROOT})...\n`);

let updatedMapping = false;

for (const [key, item] of Object.entries(mapping)) {
  if (targetDocKey && key !== targetDocKey) continue;

  const relFilePath = item.file; // e.g. "docs/01-prd.md"
  const absFilePath = path.join(REPO_ROOT, item.file);

  if (!fs.existsSync(absFilePath)) {
    console.warn(`⚠️ Bỏ qua ${key}: Không tìm thấy file ${item.file}`);
    continue;
  }

  const docTitle = item.title;

  // 1. Khởi tạo mới nếu chưa có doc_id
  if (!item.doc_id) {
    const parentFlag = (folderToken && !folderToken.startsWith('--')) 
      ? `--parent-token ${folderToken}` 
      : `--parent-position my_library`;

    console.log(`📝 [Tạo mới] ${docTitle} -> ${parentFlag}`);
    try {
      const cmd = `${LARK_BIN} docs +create ${parentFlag} --title "${docTitle}" --doc-format markdown --content @${relFilePath}`;
      const output = execSync(cmd, { encoding: 'utf8', cwd: REPO_ROOT });
      
      let newDocId = null;
      try {
        const jsonRes = JSON.parse(output);
        newDocId = jsonRes?.data?.document?.document_id || jsonRes?.data?.document_id;
      } catch (e) {}

      if (!newDocId) {
        const match = output.match(/("document_id"|"doc_id"|"token"|document_id:)\s*:\s*"([^"]+)"/) || output.match(/(doccn[a-zA-Z0-9]+|docx[a-zA-Z0-9]+|[a-zA-Z0-9_-]{20,})/);
        if (match) newDocId = match[2] || match[1];
      }

      if (newDocId) {
        item.doc_id = newDocId;
        updatedMapping = true;
        console.log(`   ✅ Đã tạo thành công! Lark Doc ID: ${newDocId}`);

        let content = fs.readFileSync(absFilePath, 'utf8');
        content = content.replace(/Lark Doc ID: .*/, `Lark Doc ID: ${newDocId}`);
        fs.writeFileSync(absFilePath, content, 'utf8');
      } else {
        console.log(`   ⚠️ Tạo thành công nhưng không tự động bóc tách được ID. Output:\n${output}`);
      }
    } catch (err) {
      console.error(`   ❌ Lỗi tạo mới ${key}:`, err.message);
    }
  }

  // 2. Cập nhật doc đã có doc_id
  if (item.doc_id) {
    console.log(`🔄 [Cập nhật] ${docTitle} (ID: ${item.doc_id})`);
    try {
      // a. Ghi đè nội dung Markdown TRƯỚC (dùng relative path @relFilePath)
      //    Lưu ý: overwrite markdown khiến Lark lấy H1 đầu tiên làm title, nên phải set title SAU
      //    để giữ tiền tố đánh số (vd "01. ...") vốn không có trong H1 của file .md.
      const cmd = `${LARK_BIN} docs +update --doc ${item.doc_id} --command overwrite --doc-format markdown --content @${relFilePath}`;
      execSync(cmd, { stdio: 'pipe', cwd: REPO_ROOT });
      console.log(`   ✅ Cập nhật văn bản Markdown thành công!`);

      // b. Cập nhật tiêu đề trên Lark Drive SAU khi overwrite content (để title đánh số không bị H1 ghi đè)
      try {
        execSync(`${LARK_BIN} drive +update-title --token ${item.doc_id} --type docx --title "${docTitle}"`, {
          stdio: 'pipe',
          cwd: REPO_ROOT,
        });
        console.log(`   ✅ Đặt lại tiêu đề (giữ đánh số): ${docTitle}`);
      } catch (e) {
        console.warn(`   ⚠️ Không đặt được tiêu đề: ${e.message}`);
      }

      // c. Tự động chèn sơ đồ Draw.io (.png) ĐÚNG VỊ TRÍ MỤC bằng cách match chính xác link ".drawio"
      const markdownContent = fs.readFileSync(absFilePath, 'utf8');
      const imgRegex = /!\[(.*?)\]\(\.\/diagrams\/(.*?\.png)\)/g;
      let match;
      while ((match = imgRegex.exec(markdownContent)) !== null) {
        const altText = match[1] || 'Draw.io Diagram';
        const imgFileName = match[2];
        const drawioFileName = imgFileName.replace('.png', '.drawio');
        const relImgPath = `docs/diagrams/${imgFileName}`;
        const absImgPath = path.join(REPO_ROOT, relImgPath);

        if (fs.existsSync(absImgPath)) {
          console.log(`   🖼️ Đang chèn Sơ đồ Draw.io vào ĐÚNG VỊ TRÍ: ${relImgPath}...`);
          try {
            // Định vị chính xác block chứa link drawio trong phần đó và chèn ảnh ngay trước link
            const insertCmd = `${LARK_BIN} docs +media-insert --doc ${item.doc_id} --file "${relImgPath}" --type image --caption "${altText}" --selection-with-ellipsis "${drawioFileName}" --before`;
            execSync(insertCmd, { stdio: 'pipe', cwd: REPO_ROOT });
            console.log(`      ✅ Đã chèn sơ đồ ${imgFileName} đúng vị trí thành công!`);
          } catch (insertErr) {
            console.warn(`      ⚠️ Không thể định vị chèn ảnh ${imgFileName}: ${insertErr.message}`);
          }
        }
      }
    } catch (err) {
      console.error(`   ❌ Lỗi cập nhật ${key}:`, err.message);
    }
  } else {
    console.log(`⏭️ [Bỏ qua] ${docTitle}: Chưa có doc_id. Dùng '--init <FOLDER_TOKEN>' để khởi tạo mới.`);
  }
}

if (updatedMapping) {
  fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2), 'utf8');
  console.log('\n💾 Đã tự động lưu các Lark Doc ID mới vào docs/doc-mapping.json!');
}

console.log('\n✨ Hoàn tất tiến trình đồng bộ!');
