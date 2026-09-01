# 🦅 Lark Suite

Hệ sinh thái AI Agent Skills & Quy trình Tự động hóa Tương tác Toàn diện với Lark (Feishu).

Lark Suite là kho lưu trữ chung các AI Agent Skills, Rules và công cụ tự động hóa giúp AI Agents (Antigravity, Claude Code, Cursor,...) tương tác thông minh, hai chiều với nền tảng Lark (Lark Base / Bitable, Lark IM, Lark Docs, Quy trình Ticket, Điều tra Codebase,...).

---

## 🌟 Các Skills Hiện Có Trong Suite

| Skill | Mục Đích | Người Phục Vụ | Kênh Thực Thi |
| :--- | :--- | :--- | :--- |
| **`lark-ticket-triage`** | Tiếp nhận ticket mới từ Lark Base, chuẩn hóa fields, tính SLA thông minh, ghi comment Base, gửi tin nhắn IM cho người tạo. | **Requester & Stakeholders** | Webhook Server (24/7), Cron Daemon, hoặc CLI Triage. |
| **`ticket-to-code`** | Tự động đọc PRD Docs trên Lark, soi mã nguồn repo local, tìm chính xác dòng lỗi, lập hồ sơ kỹ thuật 5 phần (Dossier + Diffs). | **Software Engineer / Dev** | Terminal CLI / IDE khi Dev yêu cầu điều tra ticket. |
| **`lark-docs`** | Tự động khởi tạo, quản lý và đồng bộ 8 tài liệu kỹ thuật & sơ đồ kiến trúc Draw.io hai chiều với Lark Docs. | **Technical Lead / Dev** | Lark CLI (`@larksuite/cli`), Draw.io MCP, Node.js Engine. |
| **`drawio-diagrams`** | Tạo sơ đồ Draw.io XML qua MCP server và xuất tự động ra SVG/PNG Retina 2x chuẩn hiển thị. | **Software Engineer / Architect** | Draw.io MCP, `drawio-cli` Headless. |
| **`aesthetic`** | Chuẩn thiết kế sơ đồ & giao diện thẩm mỹ cao (phân tầng màu sắc, bo góc, typographic hierarchy). | **UX/UI / Technical Lead** | Guidelines & AI Multimodal workflow. |

---

## 📁 Cấu Trúc Dự Án

```text
20253-lark-suite/
├── package.json               # Metadata & npm scripts (setup, sync, export-diagrams)
├── README.md                  # Tài liệu hướng dẫn sử dụng & sitemap
├── AGENTS.md                  # Hướng dẫn quy tắc cho AI Agent trong workspace
├── config.example.json        # Mẫu cấu hình Base Token, Table ID & Multirepo path
├── skills/                    # Chứa 5 Agent Skills (Lark Triage, Ticket-to-Code, Lark Docs, Draw.io, Aesthetic)
├── rules/                     # Chứa 4 Bộ quy tắc thực thi (Primary Workflow, Docs Management, Dev Rules, Ticket Rules)
├── workflows/                 # Chứa các quy trình làm việc tự động (sync-docs, draw-diagram, use-mcp)
├── docs/                      # Chứa 8 tài liệu kỹ thuật chuẩn Markdown & sơ đồ Draw.io (docs/diagrams/)
├── scripts/                   # Động cơ tự động hóa Node.js (sync.js, export-diagrams.js)
└── bin/
    └── install.js             # 1 lệnh tự động cài đặt/liên kết vào ~/.agents/ của user
```

---

## 🚀 Cài Đặt Nhanh (1 Bước Duy Nhất)

Clone dự án về máy và chạy lệnh setup:
```bash
npm run setup
```
Lệnh trên sẽ tự động liên kết các skills và rules vào thư mục toàn cục `~/.agents/` của máy bạn.

---

## 💬 Hướng Dẫn Sử Dụng Nhanh

### 1. Khi muốn Triage ticket mới từ Lark Base:
> *"Triage ticket #00246"* hoặc *"Triage ticket mới nhất"*

### 2. Khi muốn Phân tích Kỹ thuật & Bóc tách Code từ Ticket:
> *"Phân tích ticket #00253"* hoặc *"Điều tra ticket #00253"*

---

## 📚 Lark Docs Kit

> Hệ thống tự động hóa tài liệu & sơ đồ kiến trúc ưu tiên AI Agent (Agent-First). Quản lý tài liệu kỹ thuật ở định dạng Markdown, vẽ sơ đồ kiến trúc thông qua Draw.io MCP và tự động đồng bộ hai chiều với Lark Docs qua Lark CLI (`@larksuite/cli`).

---

### 🤖 Mô Hình Vận Hành Ưu Tiên AI Agent (Agent-First)

**Bạn không cần phải ghi nhớ hay chạy các câu lệnh CLI phức tạp.** 

`Lark Docs Kit` được vận hành dựa trên khung Agent **Antigravity Kit** trong thư mục `.agents/`. Mọi thao tác — từ tạo tài liệu, vẽ sơ đồ chuẩn thẩm mỹ, xuất tài nguyên độ phân giải cao cho đến đồng bộ lên Lark Drive — đều được xử lý **hoàn toàn tự động bởi AI Coding Agent** (Google Antigravity, Gemini IDE, Claude Code) thông qua các câu lệnh bằng ngôn ngữ tự nhiên.

---

### 🛠️ Thiết Lập Môi Trường (Chỉ Thực Hiện 1 Lần)

Trước khi gửi câu lệnh cho AI Agent, hãy hoàn tất các bước thiết lập môi trường sau:

#### 1. Cài Đặt Dependencies
```bash
npm install
```

#### 2. Xác Thực Lark CLI
Cài đặt Lark CLI toàn cục và đăng nhập vào tài khoản Lark / Feishu của bạn:
```bash
npm install -g @larksuite/cli
lark-cli auth login
```

#### 3. Đăng Ký Draw.io MCP Server (Dành Cho AI Agent)
Thêm `drawio` MCP server vào cấu hình IDE hoặc Agent của bạn (ví dụ: `~/.gemini/antigravity-ide/mcp_config.json` hoặc `.agents/mcp_config.json`):

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

### 💬 Hướng Dẫn Tương Tác Với AI Agent (Prompt Mẫu)

Chỉ cần đưa ra yêu cầu bằng ngôn ngữ tự nhiên cho AI Agent trong cửa sổ chat:

#### 🚀 Khởi Tạo Dự Án Mới Trên Lark Drive
> *"Agent, hãy khởi tạo toàn bộ 8 tài liệu dự án trên Lark Drive."*  
*(Hoặc cung cấp tên/đường dẫn thư mục: "Agent, khởi tạo docs trong thư mục Lark 'Shiori Docs' hoặc URL thư mục...")*
- **Hành động của Agent**: 
  - Nếu có URL/tên thư mục: Tự động tìm kiếm token thư mục bằng `lark-cli drive +search` hoặc phân tích URL.
  - Nếu không có thư mục: Chạy `node scripts/sync.js --init` để **tự động tạo một thư mục mới** trên Lark Drive, tạo đủ 8 tài liệu chuẩn bên trong và lưu các document ID vào `docs/doc-mapping.json`.
  - Nếu cần duyệt quyền OAuth scope, hiển thị mã QR xác thực và liên kết đăng nhập để xác nhận 1-click.

#### 📝 Viết Hoặc Cập Nhật Tài Liệu Kỹ Thuật
> *"Agent, hãy viết Product Requirements Document (PRD) cho dự án mới trong `docs/01-prd.md` và đồng bộ lên Lark."*
- **Hành động của Agent**: Điền nội dung `docs/01-prd.md` theo mẫu chuẩn, cập nhật metadata (`Version`, `Last Updated`), và đồng bộ thay đổi lên Lark Docs.

#### 🎨 Vẽ Sơ Đồ Kiến Trúc & Cơ Sở Dữ Liệu (ERD)
> *"Agent, hãy vẽ sơ đồ Kiến trúc Hệ thống và ERD Database bằng Draw.io MCP, xuất file PNG Retina 2x, sau đó cập nhật vào `docs/02-system-architecture.md` và `docs/03-database-design.md`."*
- **Hành động của Agent**: Sử dụng công cụ `drawio` MCP để tạo định nghĩa XML trong `docs/diagrams/`, áp dụng **Hệ Thống Thiết Kế Thẩm Mỹ** (`classDef` phân màu theo tầng, bo góc `rx=10, ry=10`), biên dịch SVG & PNG Retina 2x qua `npm run export-diagrams`, chèn link chỉnh sửa tương tác, và đồng bộ khối hình ảnh trực tiếp lên Lark Docs.

#### 🔄 Đồng Bộ Toàn Bộ Thay Đổi Tài Liệu
> *"Agent, hãy đồng bộ toàn bộ file tài liệu và sơ đồ đã chỉnh sửa lên Lark Docs."*
- **Hành động của Agent**: Thực thi `npm run sync` để ghi đè cập nhật tất cả các file Markdown cục bộ lên tài liệu Lark Docs tương ứng mà không tạo trùng lặp file.

---

### 📂 Cấu Trúc Thư Mục & Bản Đồ Agent Kit

```text
20253-lark-suite/
├── rules/                        # Quy tắc thực thi cốt lõi của Agent (Link sang ~/.agents/rules/)
│   ├── primary-workflow.md       # Thuật toán thực thi 4 pha của Agent
│   ├── documentation-management.md # Quy tắc đồng bộ & kiến trúc 8 tài liệu
│   ├── development-rules.md      # Quy tắc xác minh & chống ảo giác
│   └── ticket-workflow-rules.md  # Quy tắc giữ sạch workspace & tương tác ticket
├── skills/                       # Domain Skills cho AI Agent (Link sang ~/.agents/skills/)
│   ├── lark-ticket-triage/       # Skill Triage ticket từ Lark Base & gửi IM
│   ├── ticket-to-code/           # Skill bóc tách PRD, soi code local & tạo dossier
│   ├── lark-docs/                # Skill quản lý, tạo mới & đồng bộ Lark Docs
│   ├── drawio-diagrams/          # Skill vẽ & xuất sơ đồ Draw.io (SVG / PNG 2x)
│   └── aesthetic/                # Skill chuẩn thiết kế sơ đồ & UI/UX thẩm mỹ
├── workflows/                    # Quy trình thực thi (Workflows)
│   ├── sync-docs.md              # Quy trình đồng bộ tài liệu
│   ├── draw-diagram.md           # Quy trình tạo & xuất sơ đồ
│   └── use-mcp.md                # Quy trình thực thi công cụ MCP
├── docs/                         # Mã nguồn tài liệu kỹ thuật (Markdown)
│   ├── 01-prd.md                 # Product Requirements Document — PRD
│   ├── 02-system-architecture.md # System Architecture & Design
│   ├── 03-database-design.md     # Database & Data Design
│   ├── 04-codebase-api-reference.md # Codebase & API Reference
│   ├── 05-development-standards.md # Development & Code Standards
│   ├── 06-ui-ux-design-system.md # UI/UX & Design System
│   ├── 07-testing-deployment.md # Testing & Deployment
│   ├── 08-project-roadmap.md     # Project Roadmap & Management
│   ├── doc-mapping.json          # Ánh xạ document ID trung tâm trên Lark
│   └── diagrams/                 # Mã nguồn Draw.io (.drawio, .drawio.svg, .png)
├── scripts/                      # Động cơ tự động hóa cho Agent
│   ├── sync.js                   # Động cơ đồng bộ Lark Docs bằng Node.js
│   └── export-diagrams.js        # Động cơ xuất sơ đồ Draw.io bằng Node.js
├── bin/                          # Script cài đặt toàn cục
│   └── install.js                # Lệnh liên kết symlink/junction vào ~/.agents/
├── config.example.json           # Mẫu cấu hình Token & Table ID
├── package.json                  # Metadata dự án & npm scripts
├── AGENTS.md                     # Hướng dẫn Agent cho workspace
└── README.md                     # Hướng dẫn sử dụng & sitemap dự án
```
