---
inclusion: manual
---

# Workflow: Đồng bộ tài liệu lên Lark Docs

Quy trình cập nhật tài liệu local trong `docs/` và đồng bộ lên Lark Docs bằng Lark CLI (`@larksuite/cli`). Chạy các lệnh `npm run ...` / `node scripts/...` từ **gốc repo**.

## Bước 1: Pre-flight Check

1. Xác minh đường dẫn file trong `docs/`.
2. Đảm bảo file có header metadata chuẩn:
   ```markdown
   ---
   Title: <Document Title>
   Version: v<MAJOR>.<MINOR>.<PATCH>
   Last Updated: YYYY-MM-DD HH:mm:ss
   Lark Doc ID: <DOCUMENT_ID_OR_NONE>
   ---
   ```

## Bước 2: Timestamp & Version Log

1. Tăng version (`v1.0.1` → `v1.1.0`).
2. Cập nhật timestamp: `date "+%Y-%m-%d %H:%M:%S"`.
3. Thêm changelog trong mục tài liệu.

## Bước 3: Đồng bộ qua script (khuyến nghị)

### A. Cập nhật tất cả doc đã có

```bash
npm run sync
# Hoặc: node scripts/sync.js
```

### B. Khởi tạo dự án mới trên Lark Drive

```bash
node scripts/sync.js --init <FOLDER_TOKEN>
```

_Tạo doc trên Lark Drive, tự bóc ID và lưu vào `docs/doc-mapping.json` + header markdown._

#### 🔑 Xử lý OAuth Scope (khi tạo/di chuyển folder cần quyền):

Nếu Lark CLI yêu cầu scope mới (`docx:document:create`, `space:document:move`, `drive:drive`):

1. `npx lark-cli auth login --scope "docx:document:create space:document:move drive:drive" --no-wait --json`
2. `npx lark-cli auth qrcode --url "<VERIFICATION_URL>" --output docs/diagrams/lark-qr.png`
3. Trình verification link, user code, QR cho user.
4. Sau khi user xác nhận: `npx lark-cli auth login --device-code <DEVICE_CODE>`
5. `node scripts/sync.js --init <FOLDER_TOKEN>`

### C. Cập nhật 1 doc

```bash
node scripts/sync.js --doc 01-prd
```

---

## Bước 4: Lệnh CLI trực tiếp (thay thế)

### Cập nhật doc đã có

```bash
npx lark-cli docs +update --doc <DOCUMENT_ID> --command overwrite --doc-format markdown --content @./docs/<FILENAME>.md
```

### Tạo doc mới

```bash
npx lark-cli docs +create --folder-token <FOLDER_ID> --doc-format markdown --content @./docs/<FILENAME>.md
```
