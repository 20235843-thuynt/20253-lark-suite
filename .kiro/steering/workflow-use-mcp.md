---
inclusion: manual
---

# Workflow: Dùng công cụ MCP trong Kiro

> Bản gốc (Antigravity) thực thi MCP qua **Gemini CLI** và subagent `mcp-manager`/`mcp-builder`. Điều đó KHÔNG áp dụng cho Kiro. Trong Kiro, agent gọi TRỰC TIẾP các tool MCP đã kết nối — không cần CLI trung gian hay subagent để chạy tool.

## Cơ chế trong Kiro

- Các MCP server khai báo trong `.kiro/settings/mcp.json` (workspace) hoặc `~/.kiro/settings/mcp.json` (user). Kiro tự kết nối và expose tool cho agent.
- Server liên quan bộ này: `drawio` (vẽ sơ đồ) và `lark` / `lark-recall` (tương tác Lark).
- Gọi tool trực tiếp trong phiên. Không dựng script tạm để chạy MCP.

## draw.io MCP

Các tool chính của server `drawio`:

- `open_drawio_xml` — tạo/mở sơ đồ từ XML mxGraph.
- `open_drawio_mermaid` — tạo sơ đồ từ cú pháp Mermaid.
- `open_drawio_csv` — tạo sơ đồ từ CSV (org chart, flow...).
- `list_pages` / `get_page` / `set_page` — làm việc với file `.drawio` nhiều trang.
- `search_shapes` — tìm shape/icon domain-specific (AWS, Cisco, P&ID, logo...).

Sau khi tạo/sửa `.drawio`, chạy export + sync theo `workflow-draw-diagram.md`.

## Lark MCP / Lark CLI

- Ưu tiên server `lark` MCP cho thao tác đọc/ghi Lark Docs, Base, IM khi tool phù hợp có sẵn.
- Nếu tool MCP chưa đủ hoặc chưa kết nối, fallback sang `lark-cli` (`@larksuite/cli`) theo skill `lark-docs` và `lark-ticket-triage`.

## Nếu MCP server chưa kết nối

1. Kiểm tra `.kiro/settings/mcp.json` có khai báo server đúng chưa.
2. Reconnect trong panel **MCP Servers** của Kiro, hoặc Reload Window.
3. Nếu vẫn lỗi, báo lại main agent để chuyển phương án (vd dùng `lark-cli` thay cho `lark` MCP), KHÔNG tự tạo script vòng vo.

## Anti-Pattern (KHÔNG dùng trong Kiro)

- KHÔNG chạy `gemini -y -m ... -p "..."` để gọi MCP (đây là cơ chế của bản Antigravity gốc).
- KHÔNG tạo subagent `mcp-manager`/`mcp-builder` — không tồn tại trong Kiro.
- KHÔNG viết script tạm chỉ để gọi một tool MCP mà agent có thể gọi trực tiếp.
