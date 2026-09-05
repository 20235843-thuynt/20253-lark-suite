# 🦅 Lark Suite

> **Hệ sinh thái AI Agent Skills, Rules & Động cơ Tự động hóa Tương tác Toàn diện với Lark (Feishu)**  
> Tương thích đa nền tảng: **Google Antigravity (AGY)**, **Kiro / KiroCrew**, **OpenAI Codex**, **Claude Code**, và các LLM Agent CLI.

Lark Suite cung cấp bộ công cụ, domain skills và quy tắc vận hành chuẩn mực giúp các AI Coding Agent tương tác hai chiều thông minh với hệ sinh thái Lark / Feishu: tự động tiếp nhận & phân loại ticket (Lark Base/Bitable), điều tra mã nguồn đa repo (Ticket-to-Code), quản lý & đồng bộ tài liệu kỹ thuật (Lark Docs Kit), và biên vẽ sơ đồ kiến trúc thẩm mỹ cao (Draw.io MCP).

---

## 🗺️ Bản Đồ Hệ Sinh Thái & Vai Trò Tập Tin (File Ownership)

Lark Suite được thiết kế theo kiến trúc **Universal Agent Framework**, cho phép nhiều nền tảng AI Agent cùng khai thác chung một mã nguồn kỹ năng và quy tắc:

```text
20253-lark-suite/
├── .kiro/
│   └── steering/                  # 🟢 [KIRO NATIVE] Steering rules cho Kiro / KiroCrew
│       ├── lark-primary-workflow.md
│       ├── lark-suite-overview.md
│       ├── lark-development-rules.md
│       ├── lark-documentation-management.md
│       ├── lark-ticket-workflow-rules.md
│       ├── workflow-draw-diagram.md
│       ├── workflow-sync-docs.md
│       └── workflow-use-mcp.md
├── rules/                         # 🔵 [ANTIGRAVITY / AGY] Bộ quy tắc thực thi cốt lõi
│   ├── primary-workflow.md        # Thuật toán thực thi 4 pha chuẩn AGY
│   ├── documentation-management.md# Quy tắc đồng bộ & cấu trúc 8 tài liệu kỹ thuật
│   ├── development-rules.md       # Quy tắc kiểm thử nghiêm ngặt & chống ảo giác
│   ├── ticket-workflow-rules.md   # Quy tắc giữ sạch workspace & giao tiếp ticket
│   └── lark-suite-overview.md     # Tổng quan hệ sinh thái & cấu trúc chéo
├── workflows/                     # 🔵 [AGY / CLAUDE CODE] Quy trình thực thi tuần tự
│   ├── sync-docs.md               # Quy trình đồng bộ tài liệu Lark Docs
│   ├── draw-diagram.md            # Quy trình vẽ và xuất sơ đồ kiến trúc
│   └── use-mcp.md                 # Quy trình gọi các MCP Server (Draw.io, Lark)
├── skills/                        # 🌐 [UNIVERSAL] 5 Domain Skills chuẩn (AGY, Kiro, Codex, Claude)
│   ├── lark-ticket-triage/        # Skill tiếp nhận & gán SLA ticket tự động
│   ├── ticket-to-code/            # Skill bóc tách PRD, soi mã nguồn & lập dossier
│   ├── lark-docs/                 # Skill khởi tạo & đồng bộ tài liệu 2 chiều
│   ├── drawio-diagrams/           # Skill vẽ sơ đồ XML & render SVG/PNG Retina 2x
│   └── aesthetic/                 # Skill chuẩn hóa thiết kế & thẩm mỹ trực quan
├── scripts/                       # ⚡ [ENGINE / CLI] Động cơ thực thi Node.js độc lập
│   ├── sync.js                    # Động cơ đồng bộ Markdown <-> Lark Docs
│   ├── export-diagrams.js         # Động cơ xuất sơ đồ Draw.io sang SVG/PNG
│   └── drawio-inline-link.js      # Động cơ tạo URL chỉnh sửa Draw.io trực tiếp (#R...)
├── AGENTS.md                      # 🔵 [AGY / UNIVERSAL] Điểm khởi đầu định tuyến agent
├── config.example.json            # ⚙️ Mẫu cấu hình tham số Base, Table, Folders & Workspace
└── package.json                   # 📦 NPM scripts điều khiển tự động hóa
```

### Phân Bổ Trách Nhiệm Theo Nền Tảng (Platform Matrix)

| Nền tảng / Công cụ | Thư mục & Tệp tin phụ trách | Cơ chế kích hoạt / Hoạt động |
| :--- | :--- | :--- |
| **Kiro / KiroCrew** | `.kiro/steering/**/*.md`<br>`skills/` (cấu hình qua `skills.extra_paths`) | Tự động tải các tệp steering từ `.kiro/steering/` vào system prompt; gọi các skill theo định dạng chuẩn SKILL.md. |
| **Google Antigravity (AGY)** | `AGENTS.md`<br>`rules/**/*.md`<br>`workflows/**/*.md`<br>`skills/` | Tự động đọc `AGENTS.md` tại workspace root, nạp các rules tương ứng và gọi skill linh hoạt theo ngữ cảnh người dùng. |
| **OpenAI Codex / Claude Code** | `skills/**/SKILL.md`<br>`scripts/*.js` | Đọc trực tiếp phần Frontmatter YAML trong `SKILL.md` (metadata `description`, `trigger words`) và gọi trực tiếp các script Node.js. |
| **Độc Lập / Developers** | `scripts/*.js`<br>`package.json` | Lập trình viên có thể chạy trực tiếp các lệnh `npm run sync`, `npm run export-diagrams`, `npm run inline-link` qua terminal. |

> [!NOTE]
> - **Về thư mục `docs/`**: Đã được lược bỏ khỏi repository này để giữ vai trò là một **Bộ khung Kỹ năng (Skill Suite)** thuần túy. Khi áp dụng vào một dự án phần mềm cụ thể (Target Project), bộ 8 tài liệu kỹ thuật chuẩn (`docs/01-prd.md` đến `08-project-roadmap.md`) và `docs/doc-mapping.json` sẽ được Agent tự động khởi tạo khi chạy `npm run sync:init`.
> - **Về thư mục `bin/`**: Logic đóng gói CLI / installer đã được tách riêng để chuyển giao cho thành viên phụ trách packaging độc lập.

---

## 🔑 Hướng Dẫn Tra Cứu & Lấy Các Mã ID Trên Lark / Feishu

Để cấu hình hệ thống hoạt động chính xác (trong `config.json` hoặc biến môi trường), bạn cần thu thập các ID định danh từ Lark. Bảng hướng dẫn chi tiết dưới đây chỉ rõ nơi lấy từng giá trị:

| Tên Tham Số | Định Dạng Mẫu | Ý Nghĩa & Nơi Lấy Trên Lark / Feishu |
| :--- | :--- | :--- |
| `default_base_token` | `CRchbC460aXVh...` (27 ký tự) | **Token của bảng Lark Base (Bitable)**.<br>👉 **Cách lấy**: Mở Lark Base trên trình duyệt, quan sát thanh địa chỉ URL:<br>`https://<domain>.larksuite.com/base/CRchbC460aXVhLs9jDHjSrQtpIf?table=...`<br>Chuỗi nằm ngay giữa `/base/` và dấu `?` chính là `base_token`. |
| `default_table_id` | `tblYupanzbN3ejQ9` (bắt đầu bằng `tbl`) | **ID của bảng dữ liệu con (Table)**.<br>👉 **Cách lấy**: Trong cùng URL của Lark Base trên trình duyệt, lấy giá trị của query parameter `?table=tblYupanzbN3ejQ9`. |
| `default_view_id` | `vew3YGlRjp` (bắt đầu bằng `vew`) | **ID của góc nhìn hiển thị (View)**.<br>👉 **Cách lấy**: Trong URL của Lark Base, lấy giá trị của tham số `&view=vew3YGlRjp`. |
| `docs_folder_token` | `OyQIfsO45l3net...` | **Token thư mục Lark Drive chứa tài liệu kỹ thuật**.<br>👉 **Cách lấy**: Mở thư mục mong muốn trên Lark Drive qua trình duyệt:<br>`https://<domain>.larksuite.com/drive/folder/OyQIfsO45l3netdTvCejgWnLp9c`<br>Chuỗi nằm sau `/drive/folder/` chính là `folder_token`. |
| `use_case_docs_folder_token` | `OyQIfsO45l3net...` | **Token thư mục chứa tài liệu Use-Case / PRD** (tương tự như `docs_folder_token`). |
| `wiki_space_id` | `7123456789012345678` (chuỗi số dài) | **ID của Không gian Wiki (Knowledge Space)**.<br>👉 **Cách lấy**: Truy cập vào không gian Wiki trên Lark $ightarrow$ chọn Cài đặt không gian (Space Settings), URL sẽ hiển thị dạng:<br>`https://<domain>.larksuite.com/wiki/settings/7123456789012345678` hoặc tham số `?space_id=...`. |
| `app_id` | `cli_a1b2c3d4e5...` (bắt đầu bằng `cli_`) | **App ID của Lark Custom App**.<br>👉 **Cách lấy**: Truy cập [Lark Developer Console](https://open.larksuite.com/app) $ightarrow$ Chọn ứng dụng của bạn $ightarrow$ Mở mục **Credentials & Basic Info** $ightarrow$ Copy giá trị **App ID**. |
| `app_secret` | Chuỗi ký tự bí mật 32 ký tự | **App Secret của Lark Custom App**.<br>👉 **Cách lấy**: Tại cùng trang **Credentials & Basic Info** trong Developer Console $ightarrow$ Nhấn **Show** hoặc **Copy** tại mục **App Secret**. |
| `requester_open_id` | `ou_9876543210abcdef...` (bắt đầu bằng `ou_`) | **Lark Open ID của người tạo ticket / người nhận thông báo**.<br>👉 **Cách lấy**: Trong Lark Base, cột hệ thống `Created By` lưu trữ trực tiếp User ID này. Ngoài ra có thể tra cứu tại **Developer Console $ightarrow$ Member Management**. |
| `root_directory` | `C:/Users/.../GitHub` hoặc `/mnt/c/...` | **Đường dẫn thư mục gốc chứa các repository cục bộ** của lập trình viên (dùng cho skill `ticket-to-code` quét mã nguồn). |

---

## 🌟 5 Domain Skills Cốt Lõi

| Kỹ Năng | Phiên Bản | Mục Đích | Người Dùng / Kênh Phục Vụ |
| :--- | :--- | :--- | :--- |
| **`lark-ticket-triage`** | `v1.6.1` | Tự động hóa tiếp nhận ticket từ Lark Base: chuẩn hóa Type/Priority, tính SLA động, ghi comment Base, gửi tin nhắn IM cho requester, cơ chế chống lặp watermark `.state/`. | **Requester, PM, On-call Dev**<br>Chạy qua Cron, Webhook 24/7, hoặc CLI. |
| **`ticket-to-code`** | `v1.3.1` | Tự động đọc PRD trên Lark Docs, truy quét đa repository local, định vị chính xác vị trí lỗi/tính năng, lập hồ sơ kỹ thuật 5 phần (Dossier + Diffs). | **Software Engineers**<br>Kích hoạt qua chat / prompt trong IDE. |
| **`lark-docs`** | `v1.0.0` | Khởi tạo trọn bộ 8 tài liệu kỹ thuật chuẩn, quản lý phiên bản Markdown, đồng bộ 2 chiều với Lark Docs qua Lark CLI (`@larksuite/cli`). | **Technical Leads & Architects**<br>Quản lý tài liệu dự án tập trung. |
| **`drawio-diagrams`** | `v1.0.0` | Tạo sơ đồ Draw.io chuẩn XML qua MCP server, tự động render SVG & PNG Retina 2x, tạo URL nhúng chỉnh sửa trực tiếp `#R<payload>`. | **System Architects & Devs**<br>Tích hợp trực tiếp vào tài liệu Markdown. |
| **`aesthetic`** | `v1.0.0` | Bộ tiêu chuẩn thẩm mỹ cao cấp dành cho sơ đồ và giao diện: bảng màu phân tầng (layered themes), bo góc `rx=10`, hệ thống cấp bậc thị giác chuẩn. | **UI/UX & Tech Leads**<br>Áp dụng tự động trong mọi sơ đồ/giao diện. |

---

## ⚙️ Cài Đặt & Thiết Lập

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Thiết lập Cấu hình Tham số
Sao chép mẫu cấu hình và điền các ID đã tra cứu ở bước trên:
```bash
cp config.example.json config.json
```
*(Nếu làm việc trên môi trường Windows PowerShell: `Copy-Item config.example.json config.json`)*

### 3. Đăng nhập Lark CLI (Dành cho tài liệu & Drive)
```bash
npm install -g @larksuite/cli
lark-cli auth login
```

### 4. Đăng ký Draw.io MCP Server (Cho AI Agent)
Thêm cấu hình sau vào tệp cấu hình MCP của IDE (ví dụ `mcp_config.json`):
```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["-y", "@drawio/mcp-server"]
    }
  }
}
```

---

## 🛠️ Bộ Lệnh Thực Thi Tự Động Hóa (NPM Scripts)

| Câu Lệnh | Chức Năng |
| :--- | :--- |
| `npm run sync` | Quét và đồng bộ toàn bộ tài liệu Markdown nội bộ lên các tài liệu tương ứng trên Lark Docs mà không trùng lặp. |
| `npm run sync:init` | Tự động tạo một thư mục mới trên Lark Drive, khởi tạo sẵn 8 tài liệu kỹ thuật chuẩn và lưu document IDs vào `docs/doc-mapping.json`. |
| `npm run export-diagrams` | Quét toàn bộ sơ đồ `.drawio` trong thư mục tài liệu và tự động xuất ra định dạng `.drawio.svg` và `.png` (Retina 2x). |
| `npm run inline-link` | Tạo liên kết chỉnh sửa Draw.io trực tiếp dạng `#R<deflate_base64>` (giới hạn an toàn < 8000 ký tự). |

---

## 💬 Câu Lệnh Mẫu Tương Tác Với AI Agent

Sau khi cài đặt, bạn chỉ cần giao tiếp bằng ngôn ngữ tự nhiên trong giao diện chat của Agent (Antigravity, Kiro, Claude Code):

- **Triage Ticket Base**:
  > *"Agent, hãy triage các ticket mới trên Base và gửi thông báo tiếp nhận cho requester."*
- **Điều tra Bug / Feature từ Ticket**:
  > *"Agent, hãy phân tích ticket #00253, soi code trong repo và lập technical dossier cho tôi."*
- **Khởi tạo & Đồng bộ Docs**:
  > *"Agent, hãy khởi tạo bộ 8 tài liệu kỹ thuật trên thư mục Lark Drive 'Project Phoenix' và đồng bộ nội dung PRD lên đó."*
- **Vẽ Sơ Đồ Hệ Thống**:
  > *"Agent, hãy vẽ sơ đồ Architecture Flow cho luồng xác thực SSO bằng Draw.io MCP chuẩn thẩm mỹ aesthetic và cập nhật vào System Architecture docs."*

---

## 📄 Bản Quyền & Giấy Phép
Phát hành theo giấy phép [MIT](LICENSE).
