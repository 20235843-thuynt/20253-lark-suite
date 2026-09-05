---
inclusion: manual
---

# Documentation Management, Diagram & Lark Sync Rules

## 1. Cấu trúc chuẩn

Mọi tài liệu duy trì dạng Markdown trong `docs/`. Sơ đồ lưu trong `docs/diagrams/`. Kiến trúc 8 tài liệu là bắt buộc:

```
docs/
├── 01-prd.md
├── 02-system-architecture.md
├── 03-database-design.md
├── 04-codebase-api-reference.md
├── 05-development-standards.md
├── 06-ui-ux-design-system.md
├── 07-testing-deployment.md
├── 08-project-roadmap.md
└── diagrams/
    ├── <name>.drawio
    ├── <name>.drawio.svg
    └── <name>.png
```

---

## 2. Header Metadata & Version Control

Mỗi Markdown trong `docs/` PHẢI mở đầu bằng header metadata chuẩn:

```markdown
---
Title: [Document Title]
Version: v1.0.0
Last Updated: 2026-08-28 17:53:37
Lark Doc ID: [LARK_DOC_ID_OR_NONE]
Status: Draft | In Review | Approved
---
```

### Quy tắc versioning:

- **Major (v1→v2)**: rewrite kiến trúc lớn, thay đổi PRD phá vỡ tương thích.
- **Minor (v1.0→v1.1)**: thêm use case, endpoint API, mục lớn.
- **Patch (v1.0.0→v1.0.1)**: typo, format, tham số nhỏ.
- Mỗi lần cập nhật PHẢI tăng version và log timestamp (`YYYY-MM-DD HH:mm:ss`).

---

## 3. Giao thức tạo & xuất sơ đồ (Draw.io)

### RULE 3.1: Nguồn chân lý & chuẩn thẩm mỹ (STRICT NO ASCII)

- **TUYỆT ĐỐI KHÔNG vẽ sơ đồ bằng khối ASCII**. Mọi sơ đồ PHẢI tạo bằng draw.io MCP.
- Áp dụng **Aesthetic Design System** (color-code theo tầng kiến trúc, bo góc `rx=10, ry=10`, typography sạch, drop shadow).
- Sơ đồ dựa nghiêm ngặt trên code & tài liệu đã xác minh.
- File nguồn lưu tại `docs/diagrams/<name>.drawio`.

### RULE 3.2: Auto Export & Sync ngay lập tức

Ngay sau khi tạo/sửa `.drawio` (chạy từ `lark-suite/`):

1. Biên dịch SVG & PNG Retina 2x: `npm run export-diagrams`
2. Đồng bộ & nhúng ảnh in-place: `npm run sync`

### RULE 3.3: CLI Export Engine

```bash
npx -y drawio-cli -x -f svg -o docs/diagrams/<name>.drawio.svg docs/diagrams/<name>.drawio
npx -y drawio-cli -x -f png --scale 2 -o docs/diagrams/<name>.png docs/diagrams/<name>.drawio
```

### RULE 3.4: Nhúng sơ đồ & Edit Link

```markdown
![<Diagram Name>](./diagrams/<name>.png)
[✏️ Edit Diagram in Draw.io](https://app.diagrams.net/?url=https://raw.githubusercontent.com/<org>/<repo>/main/docs/diagrams/<name>.drawio)
```

---

## 4. Giao thức đồng bộ Lark CLI

### RULE 4.1: Ưu tiên Update (KHÔNG tạo trùng)

- **KHÔNG** tạo Lark Doc mới nếu tài liệu đã tồn tại / đã có `Lark Doc ID`.
- **LUÔN** cập nhật trực tiếp:
  ```bash
  npx lark-cli docs +update --doc <DOCUMENT_ID> --command overwrite --doc-format markdown --content @<RELATIVE_FILE_PATH>
  ```
- **CHỈ** chạy `docs +create` khi file chưa từng tồn tại trên Lark (`Lark Doc ID` chưa gán).
- Cập nhật ngay field `Lark Doc ID` trong header Markdown sau khi tạo mới.

### RULE 4.2: Upload media in-place

```bash
npx lark-cli docs +media-insert --doc <DOC_ID> --file docs/diagrams/<name>.png --type image --caption "<CAPTION>" --selection-with-ellipsis "<name>.drawio" --before
```

Đảm bảo click-to-edit link nằm ngay dưới block sơ đồ.

### RULE 4.3: OAuth Scope & Folder Init

Khi cần scope (`docx:document:create`, `space:document:move`, `drive:drive`):

1. `npx lark-cli auth login --scope "docx:document:create space:document:move drive:drive" --no-wait --json` → lấy `verification_url`, `user_code`, `device_code`.
2. `npx lark-cli auth qrcode --url "<VERIFICATION_URL>" --output docs/diagrams/lark-qr.png`
3. Trình URL + user code + QR cho user, yêu cầu bấm **Xác nhận** và trả lời **"Xong"**.
4. `npx lark-cli auth login --device-code <DEVICE_CODE>`, rồi `node scripts/sync.js --init <FOLDER_TOKEN>`.
