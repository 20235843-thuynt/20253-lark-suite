# 🦅 Lark Suite

Hệ sinh thái AI Agent Skills & Quy trình Tự động hóa Tương tác Toàn diện với Lark (Feishu).

Lark Suite là kho lưu trữ chung các AI Agent Skills, Rules và công cụ tự động hóa giúp AI Agents (Antigravity, Claude Code, Cursor,...) tương tác thông minh, hai chiều với nền tảng Lark (Lark Base / Bitable, Lark IM, Lark Docs, Quy trình Ticket, Điều tra Codebase,...).

---

## 🌟 Các Skills Hiện Có Trong Suite

| Skill | Mục Đích | Người Phục Vụ | Kênh Thực Thi |
| :--- | :--- | :--- | :--- |
| **`lark-ticket-triage`** | Tiếp nhận ticket mới từ Lark Base, chuẩn hóa fields, tính SLA thông minh, ghi comment Base, gửi tin nhắn IM cho người tạo. | **Requester & Stakeholders** | Webhook Server (24/7), Cron Daemon, hoặc CLI Triage. |
| **`ticket-to-code`** | Tự động đọc PRD Docs trên Lark, soi mã nguồn repo local, tìm chính xác dòng lỗi, lập hồ sơ kỹ thuật 5 phần (Dossier + Diffs). | **Software Engineer / Dev** | Terminal CLI / IDE khi Dev yêu cầu điều tra ticket. |

---

## 📁 Cấu Trúc Dự Án

```text
20253-lark-suite/
├── package.json               # Metadata & script cài đặt
├── README.md                  # Tài liệu hướng dẫn sử dụng
├── config.example.json        # Mẫu cấu hình Base Token, Table ID & Multirepo path
├── skills/
│   ├── lark-ticket-triage/    # Skill Triage & Ingress
│   │   ├── SKILL.md
│   │   └── config.json
│   └── ticket-to-code/        # Skill Developer Companion
│       ├── SKILL.md
│       └── config.json
├── rules/
│   └── ticket-workflow-rules.md # Quy tắc giữ sạch workspace & chuẩn hóa tương tác
└── bin/
    └── install.js             # 1 lệnh tự động cài vào ~/.agents/skills/ của user
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
