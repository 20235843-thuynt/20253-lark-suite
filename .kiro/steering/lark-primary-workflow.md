---
inclusion: manual
---

# Primary Execution Workflow (Lark Suite)

Thuật toán từng bước cho Agent khi xử lý tác vụ tài liệu kỹ thuật / thiết kế kiến trúc / đồng bộ Lark trong repo này.

---

## 🧭 PHASE 1: Phân loại tác vụ & map file

Khi user yêu cầu tài liệu kỹ thuật, thiết kế kiến trúc, hoặc đồng bộ:

1. **Đọc ngữ cảnh workspace**: `.kiro/steering/lark-suite-overview.md`, `README.md`, `docs/doc-mapping.json`.
2. **Xác định tài liệu đích** — map ý định user vào tài liệu chuẩn trong `docs/`:
   - `01-prd.md`: mục tiêu nghiệp vụ, persona, use case, acceptance criteria.
   - `02-system-architecture.md`: system context, container, sequence flow, data flow.
   - `03-database-design.md`: ERD, schema quan hệ, bảng, index, kiểu dữ liệu.
   - `04-codebase-api-reference.md`: cấu trúc thư mục, REST API, JSON schema request/response.
   - `05-development-standards.md`: chuẩn code, quy ước đặt tên, chiến lược Git branch.
   - `06-ui-ux-design-system.md`: design token, bảng màu, typography, component, layout.
   - `07-testing-deployment.md`: chiến lược test, CI/CD, Docker/cloud deploy.
   - `08-project-roadmap.md`: milestone, breakdown feature, task, timeline, changelog.

---

## 📝 PHASE 2: Soạn nội dung & Header Metadata

1. Sửa file Markdown local trong `docs/`.
2. Cập nhật header metadata (`Version`, `Last Updated: YYYY-MM-DD HH:mm:ss`, `Status`).
3. **STRICT**: KHÔNG vẽ sơ đồ bằng ASCII (`+---+`, `[User] -> [Server]`). Luôn dùng draw.io MCP ở Phase 3.

---

## 🎨 PHASE 3: Tạo sơ đồ & xuất thẩm mỹ (nếu cần sơ đồ)

1. **Tạo nguồn**: sinh `docs/diagrams/<name>.drawio` bằng draw.io MCP. Áp dụng Aesthetic Design System (color-code theo tầng, bo góc `rx=10, ry=10`).
2. **Nhúng preview & edit link** vào Markdown:
   ```markdown
   ![<Diagram Title>](./diagrams/<name>.png)
   [✏️ Edit Diagram in Draw.io](https://app.diagrams.net/?url=https://raw.githubusercontent.com/<org>/<repo>/main/docs/diagrams/<name>.drawio)
   ```
3. **Biên dịch ảnh**: `npm run export-diagrams` (từ `lark-suite/`).

---

## 🚀 PHASE 4: Đồng bộ Lark Drive

1. **Kiểm tra chế độ sync**: đọc `docs/doc-mapping.json`.
   - **Mode A — Khởi tạo folder mới** (nếu `doc_id` rỗng / folder mới):
     - Lấy `FOLDER_TOKEN` từ user hoặc ngữ cảnh.
     - Chạy: `node scripts/sync.js --init <FOLDER_TOKEN>`.
     - _Nếu cần OAuth scope_: trình verification URL + QR (`docs/diagrams/lark-qr.png`), resume qua `lark-cli auth login --device-code <CODE>`.
   - **Mode B — Cập nhật đè dự án đã có**:
     - Chạy: `npm run sync`.
2. **Verify output**: xác nhận tất cả tài liệu cập nhật không lỗi.
