---
name: lark-ticket-triage
version: 1.5.0
description: "Use ONLY when the user asks to triage, phân loại ticket, gán SLA, cập nhật metadata/fields trên Base, hoặc gửi thông báo tiếp nhận cho requester. Trigger words: triage ticket, phân loại ticket, cập nhật SLA, intake ticket. Do NOT use when the user asks to analyze/investigate code or find root cause."
metadata:
  requires:
    bins: ["lark-cli"]
---

# Lark Ticket Triage Workflow

Autonomous triage and intake workflow for software engineering tickets stored in Lark Base (Bitable). Focuses on metadata calibration, SLA scheduling, executive record comments, and requester communication.

---

## 🧹 MANDATORY ZERO-LITTERING PROTOCOL (TUYỆT ĐỐI KHÔNG ĐỂ LẠI FILE RÁC)

1. **Pure In-Memory Streams First (Zero File Creation):**
   - ALWAYS stream JSON/Markdown payloads via `stdin` (`--content -`) directly in memory.
   - NEVER create unnecessary temporary files in the current workspace or project root.
2. **Deterministic Cleanup for Batch Payloads:**
   - If a temporary file is strictly required for `lark-cli` batch operations, write it exclusively to the OS temporary directory (`os.tmpdir()` or `$env:TEMP`).
   - You MUST delete all temporary files immediately inside a `finally` block or clean-up step.

---

## 🇻🇳 MANDATORY VIETNAMESE ACCENT DIRECTIVE (BẮT BUỘC TIẾNG VIỆT CÓ DẤU)

- **ALWAYS use standard Vietnamese WITH FULL ACCENTS (Tiếng Việt CÓ DẤU đầy đủ):**
  - For any Vietnamese ticket, you MUST generate natural, fluent Vietnamese text with complete diacritics (e.g., "Chào bạn, ticket của bạn đã được tiếp nhận và phân loại...").
  - **STRICTLY FORBIDDEN:** NEVER write unaccented Vietnamese (tuyệt đối KHÔNG viết không dấu).
- **Encoding Reality:** Vietnamese diacritics (`á`, `à`, `ả`, `ã`, `ạ`, `ắ`, `ế`, `ố`, `ư`, `đ`...) are standard UTF-8 and are 100% natively supported by Lark Base and Lark IM.
- **Header Label Convention:** The recommendation to use ASCII brackets (e.g. `[Triage]`, `[Overview]`, `[Risk & Impact]`, `[Next Steps]`) applies SOLELY to section title tags to replace graphical 4-byte emojis (like 📌, 🚀) in Bitable comments. All sentences, paragraphs, and descriptions within those sections MUST be written in normal, accented Vietnamese.

---

## 👥 Role-Agnostic Stakeholder Contract

Do NOT assume rigid enterprise titles (do NOT write "BA bổ sung spec", "QA chuẩn bị test case", "PO nghiệm thu"). Use universal role-agnostic terminology:
- **`Requester`**: The person who submitted the ticket (for providing clarifications, reproduction data, or final acceptance).
- **`Assignee` / `Engineering Team`**: The developer or team responsible for technical review and resolving the issue.
- **`Stakeholders`**: General team members reviewing status and tracking progress.

---

## 🛡️ Reliable UTF-8 Delivery Protocol

### 1. Sending Lark IM Messages
- **Preferred Method (Stdin stream in Node.js / script):**
  ```javascript
  const payload = JSON.stringify({
    text: "Chào bạn 👋,\n\nTicket #00255 đã được tiếp nhận và phân loại thành công..."
  });
  spawnSync('lark-cli', [
    'im', '+messages-send',
    '--user-id', requesterId,
    '--msg-type', 'text',
    '--content', '-',
    '--as', 'bot',
    '--format', 'json'
  ], { input: Buffer.from(payload, 'utf-8'), encoding: 'utf-8', shell: true });
  ```
- ⚠️ **Never use `--file ./msg.txt`** (Lark treats it as a file attachment upload instead of a chat message).

### 2. Posting Stakeholder Comments to Base Records
- Stream JSON payload via `stdin` or write to `os.tmpdir()`:
  ```javascript
  const commentText = [
    '[Triage Đánh giá Tổng quan]',
    'Ticket đã được tiếp nhận và phân tích sơ bộ.',
    '',
    '[Affected Service]',
    'Dịch vụ bị ảnh hưởng: Payment & Webhook Service.',
    '',
    '[Next Steps]',
    'Assignee tiến hành kiểm tra mã nguồn và triển khai bản vá.'
  ].join('\n');

  larkCli(['drive', '+add-comment', '--doc', baseToken, '--type', 'bitable', '--block-id', blockId, '--content', '-', '--as', 'bot', '--format', 'json'], JSON.stringify([{ type: 'text', text: commentText }]));
  ```

---

## 📋 Output Contracts

### 1. Requester Notification (Lark IM via Direct Message)
- **Target Audience:** Ticket Requester.
- **Language:** Fluent, accented Vietnamese (`Tiếng Việt có dấu chuẩn`).
- **Constraint:** Business-friendly language only. NEVER include code, regex, line numbers, function signatures, or stack traces.
- **Required Content:**
  - Lời chào lịch sự và xác nhận tiếp nhận ticket.
  - Phân loại đã chuẩn hóa (Loại ticket, Mức độ ưu tiên).
  - Trạng thái & Thời gian dự kiến xử lý (`TTR Due At` / SLA).
  - Tóm tắt hướng giải quyết ở mức độ nghiệp vụ.

### 2. Stakeholder Base Comment (Lark Base Record Comment)
- **Target Audience:** Project team members viewing the ticket in Lark Base.
- **Language:** Accented Vietnamese (`Tiếng Việt có dấu`).
- **Constraint:** Executive summary only. Use ASCII section brackets (`[Triage]`, `[Overview]`) instead of 4-byte graphical emojis.
- **Required Content:**
  - `[Triage Overview]`: Tóm tắt vấn đề và nguyên nhân tổng quan.
  - `[Affected Service]`: Tên dịch vụ / module bị ảnh hưởng.
  - `[Risk & Impact]`: Đánh giá rủi ro và phạm vi ảnh hưởng.
  - `[Related Specs]`: Đường dẫn tài liệu PRD/Kiến trúc liên quan.
  - `[Next Steps]`: Các bước hành động trung lập tiếp theo.

---

## 🔄 Execution Workflow

### Step 1: Ingest Ticket
1. Read `config.json` to get default Base Token, Table ID, and View ID.
2. If prompted for "latest" or "newest": Query records via `lark-cli base +record-list` sorted by `Created At desc` (limit 1).
3. If a Record ID or URL is provided: Parse `base_token` and `record_id` directly.

### Step 2: Calibrate Metadata Fields & SLA
Evaluate all ticket metadata fields:
- `Type`: Assign `Bug`, `Feature`, `Task`, or `Incident`.
- `Priority`: Assign `High`, `Medium`, or `Low`.
- `Complexity`: Assign `High`, `Medium`, or `Low`.
- `Risk`: Assign `High`, `Medium`, or `Low`.
- `Team`: Assign `Engineer`.
- `Labels`: Assign relevant domain tags (e.g. `["Payment", "Backend"]`, `["Frontend", "UI/UX"]`).
- `TTR Due At`: Evaluate current deadline. If unrealistic or overly tight (< 2 hours for non-trivial bugs), automatically reschedule based on `config.json` SLA matrix.

### Step 3: Update Lark Base Record
Apply field updates to the record via `lark-cli base +record-batch-update` using a temp file in `os.tmpdir()` cleaned up immediately in `finally`.

### Step 4: Post Stakeholder Comment
Post the Executive Stakeholder Comment to the record using `lark-cli drive +add-comment` (accented Vietnamese with ASCII headers) via `stdin`.

### Step 5: Notify Requester
Send formatted accented Vietnamese Markdown IM to the ticket requester's `open_id` using `lark-cli im +messages-send` via `stdin`.
