---
inclusion: always
---

# Lark Suite — Hướng dẫn Agent trong workspace

Bộ AI Agent Skills để tương tác hai chiều với Lark (Feishu): triage ticket, điều tra codebase, quản lý Lark Docs, vẽ sơ đồ draw.io. Đã refactor sang chuẩn Kiro.

## Cấu trúc trong repo

- **Skills** (Kiro tự load on-demand theo mô tả): `.kiro/skills/`
  - `lark-ticket-triage/` — Triage ticket từ Lark Base, chuẩn hóa fields, tính SLA, gửi IM.
  - `ticket-to-code/` — Bóc tách PRD, soi code local, tạo technical dossier (chỉ điều tra, không sửa code).
  - `lark-docs/` — Tạo/cập nhật/đồng bộ tài liệu Lark Docs qua Lark CLI.
  - `drawio-diagrams/` — Vẽ & xuất sơ đồ draw.io (SVG / PNG Retina 2x).
  - `aesthetic/` — Chuẩn thiết kế sơ đồ & UI/UX thẩm mỹ.
- **Steering** (rules & workflow): `.kiro/steering/`
- **Engine tự động hóa** (scripts, `package.json`, `config.example.json`): thư mục `lark-suite/` ở gốc repo. Chạy `npm run ...` từ trong `lark-suite/`; các script tự trỏ tới `docs/` ở gốc repo.
- **Tài liệu & sơ đồ**: `docs/` ở gốc repo (`docs/*.md`, `docs/diagrams/`, `docs/doc-mapping.json`).

## Kiến trúc tài liệu & sơ đồ

Tài liệu kỹ thuật duy trì ở `docs/` (gốc repo):

- `01-prd.md` — Product Requirements Document
- `02-system-architecture.md` — System Architecture & Design
- `03-database-design.md` — Database & Data Design
- `04-codebase-api-reference.md` — Codebase & API Reference
- `05-development-standards.md` — Development & Code Standards
- `06-ui-ux-design-system.md` — UI/UX & Design System
- `07-testing-deployment.md` — Testing & Deployment
- `08-project-roadmap.md` — Project Roadmap & Management
- `doc-mapping.json` — Ánh xạ Lark Document ID trung tâm
- `diagrams/` — Nguồn `.drawio`, `.drawio.svg`, `.png` (Retina 2x) tạo qua `drawio` MCP + `drawio-cli`.

## Công cụ trong Kiro (ánh xạ từ bản Antigravity gốc)

- **draw.io**: gọi TRỰC TIẾP server `drawio` MCP (`open_drawio_xml`, `open_drawio_mermaid`, `set_page`, `search_shapes`...). KHÔNG dùng Gemini CLI hay subagent `mcp-manager` như bản gốc.
- **Lark**: dùng server `lark` MCP hoặc `lark-cli` (`@larksuite/cli`).
- **Điều tra code**: read_file / read_code (thay `view_file`), grep_search, file_search (thay `find_by_name`), GitHub CLI `gh` cho repo remote.

## Quy tắc chung (luôn áp dụng)

1. **KHÔNG ASCII diagram** — mọi sơ đồ phải vẽ bằng draw.io MCP.
2. **Zero hallucination** — tài liệu/sơ đồ chỉ dựa trên code, schema, asset đã xác minh.
3. **Zero-littering** — không để lại file rác; ưu tiên stream stdin; file tạm ghi vào `os.tmpdir()` và xóa ngay.
4. **Verify trước khi báo xong** — kiểm tra format, metadata, export không lỗi.
