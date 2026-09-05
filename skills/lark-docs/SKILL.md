---
name: lark-docs
description: >-
  Tham chiếu đầy đủ để tương tác với Lark Docs qua Lark CLI (@larksuite/cli).
  Dùng khi thực hiện thao tác trên Lark Docs: tạo/đọc/cập nhật tài liệu, đọc/khảo cứu nội dung doc
  và diagram từ Lark (fetch text + đọc sơ đồ qua link raw .drawio), quản lý media,
  lịch sử phiên bản, phân quyền, comment, import/export, đồng bộ Drive, tìm kiếm và whiteboard.
---

# Lark Docs CLI Reference (@larksuite/cli)

Bảng tham chiếu tương tác với Lark Docs qua Lark CLI (`@larksuite/cli`), phân theo nhóm chức năng.

> 💡 **Fallback / Trợ giúp mở rộng & Diagram:** Nếu không tìm thấy lệnh cần trong các bảng bên dưới, chạy các lệnh sau hoặc xem skill draw.io chuyên biệt:
>
> ```bash
> npx lark-cli skills read lark-doc      # Hướng dẫn sâu về thao tác Document
> npx lark-cli skills read lark-drive    # Hướng dẫn sâu về File & Permission
> npx lark-cli skills read lark-bitable  # Hướng dẫn sâu về Spreadsheet & Base/Bitable
> ```
>
> 🎨 **Diagram skill:** Xem `.kiro/skills/drawio-diagrams/SKILL.md` để vẽ sơ đồ bằng draw.io MCP và xuất SVG/PNG Retina 2x qua `drawio-cli`.
>
> **Engine tự động hóa**: Script đồng bộ tài liệu được đóng gói sẵn trong thư mục `scripts/sync.js` của skill này, hoặc chạy qua thư mục `lark-suite/` của dự án (nếu có).

---

### 🔐 GIAO THỨC OAUTH DEVICE LOGIN & DUYỆT SCOPE (QUAN TRỌNG CHO AGENT)

Khi thực hiện thao tác Drive (tạo folder, di chuyển file, cấp quyền) cần scope OAuth mới (`docx:document:create`, `space:document:move`, `drive:drive`), `lark-cli` sẽ khởi tạo Device Flow. Agent PHẢI theo giao thức:

1. **Bước 1 — Lấy Device Code & URL**:
   Chạy `lark-cli auth login --scope "docx:document:create space:document:move drive:drive" --no-wait --json` để lấy `verification_url`, `user_code`, `device_code`.

2. **Bước 2 — Tạo ảnh QR PNG**:

   ```bash
   lark-cli auth qrcode --url "<VERIFICATION_URL>" --output docs/diagrams/lark-qr.png
   ```

3. **Bước 3 — Trình link & QR cho user**:
   - Link xác thực: `[👉 Bấm để cấp quyền Lark Drive](<VERIFICATION_URL>)`
   - User Code: `user_code`
   - Ảnh QR nhúng: `![Lark Drive Authorization QR Code](docs/diagrams/lark-qr.png)`
   - Yêu cầu user bấm **Xác nhận** và trả lời **"Xong"**.

4. **Bước 4 — Hoàn tất xác thực & tiếp tục**:
   Khi user xác nhận: `lark-cli auth login --device-code <DEVICE_CODE>`
   Sau đó chạy `node scripts/sync.js --init <FOLDER_TOKEN>`.

---

### ⚡ SCRIPT TỰ ĐỘNG & DOCUMENT MAPPING (KHUYẾN NGHỊ)

Agent làm việc trong repo này PHẢI ưu tiên dùng script tự động và JSON mapping:

1. **Central Document Mapping**: `docs/doc-mapping.json`
2. **Đồng bộ Lark tự động**:
   ```bash
   # Cách 1: Chạy từ lark-suite/ của repo:
   npm --prefix lark-suite run sync                                # Đồng bộ tất cả doc đã sửa (overwrite)
   node lark-suite/scripts/sync.js --init <FOLDER_TOKEN>          # Khởi tạo dự án mới trên Lark Drive
   node lark-suite/scripts/sync.js --doc 01-prd                   # Đồng bộ 1 doc cụ thể

   # Cách 2: Chạy trực tiếp script sync của skill:
   node .kiro/skills/lark-docs/scripts/sync.js
   node .kiro/skills/lark-docs/scripts/sync.js --init <FOLDER_TOKEN>
   node .kiro/skills/lark-docs/scripts/sync.js --doc 01-prd
   ```
3. **Xuất sơ đồ tự động**:
   ```bash
   # Từ lark-suite:
   npm --prefix lark-suite run export-diagrams
   # Hoặc trực tiếp:
   node .kiro/skills/drawio-diagrams/scripts/export-diagrams.js
   ```

---

### 📖 ĐỌC & KHẢO CỨU DOC TỪ LARK (READ WORKFLOW)

Khi cần đọc lại nội dung tài liệu đã ở trên Lark (không phải file local), theo luồng sau.

**1. Đọc text của doc**

```bash
# Đọc toàn văn dạng markdown (khuyến nghị khi chỉ cần nội dung)
npx lark-cli docs +fetch --doc <DOC_ID> --doc-format markdown

# Giữ cấu trúc block + neo comment (khi cần chỉnh sửa theo block hoặc đọc comment)
npx lark-cli docs +fetch --doc <DOC_ID> --doc-format xml
```

- ⚠️ Flag đúng là **`--doc-format`** (giá trị: `xml` | `markdown` | `im-markdown`), KHÔNG phải `--format` (dùng `--format` sẽ lỗi validation).
- Lấy `<DOC_ID>` từ `docs/doc-mapping.json` (khóa như `01-prd`, `02-system-architecture` → field `doc_id`), hoặc tìm bằng `npx lark-cli docs +search --query "..."`.
- Kết quả trả JSON `ok:true` với `data.document.content` chứa markdown; title giữ đánh số (vd `# 02. System Architecture & Design`).

**2. Đọc DIAGRAM — QUA LINK, KHÔNG QUA ẢNH PNG**

Trong nội dung doc, mỗi sơ đồ có 2 phần: ảnh PNG (link nội bộ Lark `feishu.cn/file/...`) và **link edit draw.io**:

```
[✏️ Edit Diagram in Draw.io](https://app.diagrams.net/?url=https://raw.githubusercontent.com/<org>/<repo>/main/docs/diagrams/<name>.drawio)
```

Để đọc được **ngữ nghĩa** sơ đồ (node, cạnh, nhãn quan hệ) — không phải chỉ pixel:

1. **KHÔNG mở/fetch nguyên link `app.diagrams.net/?url=...`** — đó là trang editor cho người, fetch chỉ ra HTML vô nghĩa.
2. **Tách phần URL nằm sau `?url=`** — chính là link raw `.drawio` trên GitHub.
3. **`web_fetch` thẳng vào link raw đó** → nhận XML mxGraph → parse `<mxCell>` để đọc node/edge/nhãn/style.

```
# Ví dụ URL raw cần fetch (đã tách từ link edit):
https://raw.githubusercontent.com/<org>/<repo>/main/docs/diagrams/<name>.drawio
```

- Ảnh PNG (`feishu.cn/file/...`) chỉ là hình — muốn hiểu logic sơ đồ PHẢI đi qua `.drawio` (XML). Nếu chỉ cần "nhìn" ảnh, dùng `docs +media-download` để tải PNG.
- **Điều kiện:** file `.drawio` phải đã được push lên đúng branch trong link (`main`); nếu chưa push → raw URL trả 404 (draw.io báo "Không tìm thấy tập tin").
- **Shortcut khi làm việc ngay trong repo này:** đọc thẳng file local `docs/diagrams/<name>.drawio` (nhanh hơn, không cần mạng). Chỉ dùng đường raw GitHub khi đọc từ xa (không có repo local).

**3. Đọc ảnh/tài nguyên khác**

- `docs +media-download --doc <DOC_ID> --out-dir ./images` — tải mọi ảnh trong doc.
- `docs +resource-download --doc <DOC_ID> --type cover --out cover.png` — tải cover.
- `docs +history-list --doc <DOC_ID>` — xem lịch sử phiên bản.

---

### 📝 NHÓM 1: Chỉnh sửa & quản lý nội dung (CRUD)

| Lệnh CLI              | Cú pháp đầy đủ                                                                                         | Mục đích & tham số                                        |
| :-------------------- | :----------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| `docs +create`        | `npx lark-cli docs +create --folder-token <FOLDER_ID> --doc-format markdown --content @<PATH>`         | Tạo document mới từ Markdown/text.                        |
| `docs +fetch`         | `npx lark-cli docs +fetch --doc <DOC_ID> --doc-format markdown`                                        | Đọc/tải nội dung document về local (markdown, json).      |
| `docs +update`        | `npx lark-cli docs +update --doc <DOC_ID> --command overwrite --doc-format markdown --content @<PATH>` | Cập nhật nội dung (`overwrite` để thay, `append` để nối). |
| `drive +update-title` | `npx lark-cli drive +update-title --token <DOC_ID> --title "New Title"`                                | Đổi tiêu đề mà không đổi nội dung.                        |
| `docs +script`        | `npx lark-cli docs +script --doc <DOC_ID> --action profile`                                            | Khởi tạo draft workspace, kiểm tra cấu trúc block.        |

---

### 🖼️ NHÓM 2: Quản lý Media & Assets

| Lệnh CLI                  | Cú pháp đầy đủ                                                                                  | Mục đích                                                        |
| :------------------------ | :---------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| `docs +media-insert`      | `npx lark-cli docs +media-insert --doc <DOC_ID> --file <PATH> --type image --caption "Caption"` | Nhúng ảnh/file vào cuối document (tự upload, tạo block + link). |
| `docs +media-upload`      | `npx lark-cli docs +media-upload --doc <DOC_ID> --block-id <BLOCK_ID> --file <PATH>`            | Upload ảnh/attachment gắn vào Block ID cụ thể.                  |
| `docs +media-download`    | `npx lark-cli docs +media-download --doc <DOC_ID> --out-dir ./images`                           | Tải mọi ảnh trong document về folder local.                     |
| `docs +media-preview`     | `npx lark-cli docs +media-preview --doc <DOC_ID> --file-token <TOKEN>`                          | Xem trước ảnh/file trong document.                              |
| `docs +resource-update`   | `npx lark-cli docs +resource-update --doc <DOC_ID> --type cover --file cover.png`               | Đặt Cover Image đầu trang.                                      |
| `docs +resource-download` | `npx lark-cli docs +resource-download --doc <DOC_ID> --type cover --out cover.png`              | Tải cover image.                                                |
| `docs +resource-delete`   | `npx lark-cli docs +resource-delete --doc <DOC_ID> --type cover`                                | Xóa cover image.                                                |

---

### ⏳ NHÓM 3: Version Control & Lịch sử

| Lệnh CLI                      | Cú pháp đầy đủ                                                            | Mục đích                                      |
| :---------------------------- | :------------------------------------------------------------------------ | :-------------------------------------------- |
| `docs +history-list`          | `npx lark-cli docs +history-list --doc <DOC_ID>`                          | Xem lịch sử phiên bản (timestamp, người sửa). |
| `docs +history-revert`        | `npx lark-cli docs +history-revert --doc <DOC_ID> --version <VERSION_ID>` | Khôi phục document về phiên bản cũ.           |
| `docs +history-revert-status` | `npx lark-cli docs +history-revert-status --task-id <TASK_ID>`            | Kiểm tra trạng thái task revert.              |

---

### 👥 NHÓM 4: Phân quyền & Chia sẻ

| Lệnh CLI                        | Cú pháp đầy đủ                                                                                                 | Mục đích                                 |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
| `drive +member-add`             | `npx lark-cli drive +member-add --token <DOC_ID> --member-type email --member-id user@company.com --perm edit` | Cấp quyền (`view`/`edit`/`full_access`). |
| `drive +member-list`            | `npx lark-cli drive +member-list --token <DOC_ID>`                                                             | Liệt kê thành viên có quyền.             |
| `drive +member-remove`          | `npx lark-cli drive +member-remove --token <DOC_ID> --member-id <USER_OR_OPEN_ID>`                             | Thu hồi quyền.                           |
| `drive +permission-get-setting` | `npx lark-cli drive +permission-get-setting --token <DOC_ID>`                                                  | Kiểm tra cài đặt chia sẻ công khai.      |
| `drive +apply-permission`       | `npx lark-cli drive +apply-permission --token <DOC_ID> --perm edit --reason "..."`                             | Gửi yêu cầu quyền cho Owner.             |

---

### 💬 NHÓM 5: Comment & Review

| Lệnh CLI                 | Cú pháp đầy đủ                                                                                | Mục đích                             |
| :----------------------- | :-------------------------------------------------------------------------------------------- | :----------------------------------- |
| `drive +add-comment`     | `npx lark-cli drive +add-comment --token <DOC_ID> --content "..."`                            | Thêm comment mới.                    |
| `drive +list-comments`   | `npx lark-cli drive +list-comments --token <DOC_ID>`                                          | Lấy danh sách comment và trạng thái. |
| `drive +add-reply`       | `npx lark-cli drive +add-reply --token <DOC_ID> --comment-id <CMT_ID> --content "..."`        | Reply comment.                       |
| `drive +resolve-comment` | `npx lark-cli drive +resolve-comment --token <DOC_ID> --comment-id <CMT_ID>`                  | Đánh dấu comment đã xử lý.           |
| `drive +restore-comment` | `npx lark-cli drive +restore-comment --token <DOC_ID> --comment-id <CMT_ID>`                  | Mở lại comment đã resolve.           |
| `drive +delete-reply`    | `npx lark-cli drive +delete-reply --token <DOC_ID> --comment-id <CMT_ID> --reply-id <REP_ID>` | Xóa reply.                           |
| `drive +react-reply`     | `npx lark-cli drive +react-reply --token <DOC_ID> --reply-id <REP_ID> --emoji "THUMBSUP"`     | Thêm emoji reaction.                 |

---

### 📦 NHÓM 6: Import, Export & Quản lý File/Folder (Drive)

| Lệnh CLI                 | Cú pháp đầy đủ                                                                               | Mục đích                                    |
| :----------------------- | :------------------------------------------------------------------------------------------- | :------------------------------------------ |
| `drive +export`          | `npx lark-cli drive +export --token <DOC_ID> --type pdf`                                     | Export sang PDF/Word.                       |
| `drive +export-download` | `npx lark-cli drive +export-download --file-token <FILE_TOKEN> --out output.pdf`             | Tải file đã export.                         |
| `drive +import`          | `npx lark-cli drive +import --file spec.docx --folder-token <FOLDER_ID>`                     | Chuyển Word/Excel/Markdown thành Lark Docx. |
| `drive +copy`            | `npx lark-cli drive +copy --source-token <DOC_ID> --target-folder <FOLDER_ID> --title "..."` | Nhân bản document.                          |
| `drive +move`            | `npx lark-cli drive +move --file-token <DOC_ID> --target-folder <FOLDER_ID>`                 | Di chuyển document.                         |
| `drive +delete`          | `npx lark-cli drive +delete --token <DOC_ID> --type docx`                                    | Xóa document (vào Trash).                   |
| `drive +sync`            | `npx lark-cli drive +sync --local-dir ./docs --folder-token <FOLDER_ID>`                     | Đồng bộ 2 chiều folder local ↔ Lark Drive.  |

---

### 🔍 NHÓM 7: Search & Whiteboard

| Lệnh CLI                  | Cú pháp đầy đủ                                                                                 | Mục đích                                                 |
| :------------------------ | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| `docs +search`            | `npx lark-cli docs +search --query "System Architecture"`                                      | Full-text search toàn Workspace.                         |
| `docs +whiteboard-update` | `npx lark-cli docs +whiteboard-update --doc <DOC_ID> --whiteboard-id <WB_ID> --dsl @chart.dsl` | Cập nhật sơ đồ trên Whiteboard (Mermaid, PlantUML, DSL). |

---

### 🔄 NHÓM 8: Lệnh Fallback & Tham chiếu Diagram Skill

Nếu không tìm được lệnh cần thiết, chạy các lệnh sau để lấy tài liệu chi tiết từ Lark CLI:

```bash
npx lark-cli skills read lark-doc
npx lark-cli skills read lark-drive
npx lark-cli skills read lark-bitable
```

- **Draw.io Diagram Skill:** `.kiro/skills/drawio-diagrams/SKILL.md`
