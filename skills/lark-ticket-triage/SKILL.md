---
name: lark-ticket-triage
version: 1.6.1
description: 'Dùng KHI user yêu cầu triage, phân loại ticket, gán SLA, cập nhật metadata/fields trên Base, hoặc gửi thông báo tiếp nhận cho requester. Trigger: triage ticket, phân loại ticket, cập nhật SLA, intake ticket. KHÔNG dùng khi user yêu cầu phân tích/điều tra code hoặc tìm nguyên nhân lỗi (đó là skill ticket-to-code).'
metadata:
  requires:
    bins: ['lark-cli']
---

# Lark Ticket Triage Workflow

Quy trình triage & intake tự động cho ticket kỹ thuật lưu trên Lark Base (Bitable). Tập trung vào chuẩn hóa metadata, lập lịch SLA, comment record cho stakeholder, và thông báo cho requester.

> **Config**: đọc `config.json` cạnh file này (`.kiro/skills/lark-ticket-triage/config.json`) để lấy `default_base_token`, `default_table_id`, `sla_matrix_hours`, `rules`.
>
> **Watermark state** (chế độ batch/cron): lưu tại `.state/triage_watermark.json` trong repo (KHÔNG dùng `~/.agents/state/` như bản Antigravity gốc).
>
> **Ánh xạ công cụ trong Kiro**: đọc/ghi Lark qua server `lark` MCP hoặc `lark-cli`; tìm repo local qua file_search/grep_search; tìm repo remote qua GitHub CLI (`gh`) hoặc GitHub MCP nếu có.

---

## 🧹 GIAO THỨC ZERO-LITTERING (TUYỆT ĐỐI KHÔNG ĐỂ LẠI FILE RÁC)

1. **Ưu tiên stream trong bộ nhớ (Zero File Creation):**
   - LUÔN stream payload JSON/Markdown qua `stdin` (`--content -`) trực tiếp trong bộ nhớ.
   - KHÔNG tạo file tạm không cần thiết trong workspace/project root.
2. **Dọn dẹp file batch có kiểm soát:**
   - Nếu bắt buộc cần file tạm cho batch `lark-cli`, chỉ ghi vào thư mục tạm của OS (`os.tmpdir()` / `$env:TEMP`).
   - PHẢI xóa mọi file tạm ngay trong khối `finally` / bước cleanup.

---

## 🇻🇳 BẮT BUỘC TIẾNG VIỆT CÓ DẤU

- **LUÔN dùng tiếng Việt CÓ DẤU đầy đủ:** Với mọi ticket tiếng Việt, PHẢI sinh văn bản tự nhiên, đầy đủ dấu (vd "Chào bạn, ticket của bạn đã được tiếp nhận và phân loại...").
- **NGHIÊM CẤM:** KHÔNG BAO GIỜ viết tiếng Việt không dấu.
- **Encoding:** dấu tiếng Việt (`á`, `à`, `ả`, `ã`, `ạ`, `ắ`, `ế`, `ố`, `ư`, `đ`...) là UTF-8 chuẩn, được Lark Base và Lark IM hỗ trợ 100%.
- **Quy ước header:** dùng ngoặc ASCII (`[Triage]`, `[Overview]`, `[Risk & Impact]`, `[Next Steps]`) CHỈ cho tiêu đề mục để thay emoji 4-byte trong comment Bitable. Mọi câu/đoạn trong mục PHẢI viết tiếng Việt có dấu bình thường.

---

## 👥 Hợp đồng Stakeholder không phụ thuộc vai trò

KHÔNG giả định chức danh cứng ("BA bổ sung spec", "QA chuẩn bị test case", "PO nghiệm thu"). Dùng thuật ngữ tổng quát:

- **`Requester`**: Người gửi ticket. Nguồn định danh chuẩn là field hệ thống **`Created By`** của record (field "Person" của Lark Base), **KHÔNG** phải field free-text "Requester Name"/"Reporter" (có thể bị sửa/sai chính tả/điền hộ).
- **`Assignee` / `Engineering Team`**: Developer/team chịu trách nhiệm review kỹ thuật và xử lý.
- **`Stakeholders`**: Thành viên team theo dõi trạng thái & tiến độ.

---

## 🔍 Thu thập ngữ cảnh & xác minh đầy đủ

Trước khi hiệu chỉnh metadata, skill PHẢI thực hiện một lượt ngữ cảnh nhẹ — đủ để đánh giá ticket đã sẵn sàng làm chưa, KHÔNG phải điều tra kỹ thuật đầy đủ (đó là việc của skill `ticket-to-code`).

### ⛔ QUY TẮC KHÔNG GIẢ ĐỊNH (bắt buộc cứng)

KHÔNG mô tả/tóm tắt/tham chiếu nội dung tài liệu/attachment/repo trừ khi đã thực sự gọi tool mở nó trong lần chạy này. Thấy file/link tồn tại ≠ đã đọc. Nếu chưa gọi tool, PHẢI nói rõ (vd "tệp đính kèm test.docx chưa được mở/đọc") — không được ngầm mô tả nó "có lẽ chứa gì".

### 1. Phát hiện mọi tham chiếu trên ticket

Kiểm tra cả ba nguồn (riêng biệt, không bỏ sót):
a) **Text mô tả:** link Lark Doc/Wiki (`/docx/`, `/wiki/`), URL repo/PR, tên module/service.
b) **Field attachment của record:** file upload trực tiếp lên record Bitable (field "Attachment" — vd `test.docx`). Khác với link doc trong mô tả và hay bị bỏ sót.
c) **Ngữ cảnh repo:** repo/service ngầm định qua Labels/Affected Service dù không có link.

### 2. Thực sự mở những gì tìm thấy (read-only, không mutate)

- **Link Doc/Wiki:** đọc qua `lark-cli drive +get` (hoặc server `lark` MCP).
- **Attachment record:** tải qua `lark-cli base +download-attachment` (hoặc lệnh tương đương — chạy `lark-cli base --help` nếu chưa chắc subcommand), rồi trích text trước khi trích dẫn. File `.docx` phải được chuyển/đọc, không đoán từ tên.
- **Tham chiếu repo/code:**
  - Repo đã mount trong workspace: chỉ kiểm tra nông — xác nhận file/module/service tồn tại (file_search, một grep_search nhắm đích).
  - Repo không có local: PHẢI dùng GitHub CLI (`gh search code`) hoặc GitHub MCP với keyword từ ticket. Đừng bỏ qua chỉ vì không có repo mở.
- Nếu link hỏng, attachment tải lỗi, hoặc GitHub trả 0 kết quả, ghi rõ kết cục đó — một lần tra thất bại vẫn là fact cần báo.

### 3. Đánh giá độ đầy đủ

Phân loại ticket vào đúng một trạng thái:

- **`Sufficient`** — có đủ problem statement, affected service/module, ngữ cảnh tái hiện, VÀ mọi tham chiếu đã thực sự mở và nhất quán.
- **`Partial`** — triage được, nhưng ít nhất một tham chiếu tồn tại mà chưa mở/verify được, hoặc thiếu một tham chiếu hữu ích (spec/repro).
- **`Insufficient`** — thiếu thông tin then chốt, hoặc cái đã đọc mâu thuẫn với ticket.

Chỉ được đánh `Sufficient` khi mọi tham chiếu phát hiện đều đã thực sự mở — một attachment chưa mở hay một lần bỏ qua GitHub sẽ giới hạn kết quả ở mức `Partial`.

---

## 🛡️ Giao thức gửi UTF-8 tin cậy

### 1. Gửi tin nhắn Lark IM

- **Giải requester (BẮT BUỘC):** `requesterId` PHẢI là `open_id` trong field **`Created By`** của record (trả về bởi `lark-cli base +record-get`, dạng `{ "id": "ou_xxxx", "name": "..." }`). KHÔNG giải từ field free-text hay mô tả — `Created By` là field duy nhất bảo đảm phản ánh người tạo thật.
- **Phương thức ưu tiên:** `--msg-type interactive` (Lark Card) với element markdown. KHÔNG dùng `--msg-type text` khi nội dung có Markdown emphasis (`**bold**`, list...) — text message không parse Markdown.
  ```javascript
  const requesterId = record['Created By'].id; // open_id, KHÔNG lấy từ field text
  const cardPayload = JSON.stringify({
    config: { wide_screen_mode: true },
    header: { title: { tag: 'plain_text', content: 'Xác nhận tiếp nhận ticket' }, template: 'blue' },
    elements: [
      { tag: 'markdown', content: 'Chào bạn 👋,\n\nTicket **#00255** đã được tiếp nhận và phân loại thành công...' },
    ],
  });
  spawnSync(
    'lark-cli',
    [
      'im',
      '+messages-send',
      '--user-id',
      requesterId,
      '--msg-type',
      'interactive',
      '--content',
      '-',
      '--as',
      'bot',
      '--format',
      'json',
    ],
    { input: Buffer.from(cardPayload, 'utf-8'), encoding: 'utf-8', shell: true }
  );
  ```
- ⚠️ **Không dùng `--file ./msg.txt`** (Lark coi là upload file đính kèm thay vì tin nhắn chat).

### 2. Đăng comment stakeholder vào record Base

- Stream JSON qua `stdin` hoặc ghi vào `os.tmpdir()`:
  ```javascript
  const commentText = [
    '[Triage Overview]',
    'Ticket đã được tiếp nhận và phân tích sơ bộ.',
    '',
    '[Affected Service]',
    'Dịch vụ bị ảnh hưởng: Payment & Webhook Service.',
    '',
    '[Risk & Impact]',
    'Rủi ro mức trung bình, ảnh hưởng luồng webhook.',
    '',
    '[Related Specs]',
    'Đã kiểm tra tài liệu PRD thanh toán.',
    '',
    '[Info Completeness]',
    'Sufficient - Đầy đủ thông tin tái hiện.',
    '',
    '[Next Steps]',
    'Assignee tiến hành kiểm tra mã nguồn và triển khai bản vá.',
  ].join('\n');
  larkCli(
    [
      'drive',
      '+add-comment',
      '--doc',
      baseToken,
      '--type',
      'bitable',
      '--block-id',
      blockId,
      '--content',
      '-',
      '--as',
      'bot',
      '--format',
      'json',
    ],
    JSON.stringify([{ type: 'text', text: commentText }])
  );
  ```

---

## 📋 Hợp đồng Output

### 1. Thông báo Requester (Lark IM Direct Message)

- **Đối tượng:** Requester — giải chặt từ field `Created By`, không từ field tên free-text.
- **Ngôn ngữ:** Tiếng Việt có dấu chuẩn.
- **Ràng buộc:** Chỉ ngôn ngữ nghiệp vụ. KHÔNG kèm code, regex, số dòng, signature, stack trace.
- **Nội dung bắt buộc:** Lời chào & xác nhận tiếp nhận; phân loại chuẩn hóa (Loại, Ưu tiên); trạng thái & thời gian dự kiến (`TTR Due At`/SLA); tóm tắt hướng giải quyết mức nghiệp vụ. Nếu completeness `Partial`/`Insufficient`: hỏi lịch sự phần còn thiếu — không phrase như từ chối ticket.

### 2. Comment Base cho Stakeholder

- **Đối tượng:** Team xem ticket trong Lark Base.
- **Ngôn ngữ:** Tiếng Việt có dấu.
- **Ràng buộc:** Executive summary. Dùng ngoặc ASCII (`[Triage]`, `[Overview]`) thay emoji 4-byte.
- **FORMAT CỐ ĐỊNH — KHÔNG LỆCH:** Comment PHẢI có đúng 6 mục sau, đúng thứ tự, đúng tên header. Không thêm header, không đổi tên, không bỏ mục nào dù ngắn:
  1. `[Triage Overview]`: Tóm tắt vấn đề & nguyên nhân tổng quan.
  2. `[Affected Service]`: Tên dịch vụ/module bị ảnh hưởng.
  3. `[Risk & Impact]`: Đánh giá rủi ro & phạm vi.
  4. `[Related Specs]`: Đường dẫn tài liệu/PRD & tên attachment đã tìm thấy, ghi rõ cái nào đã mở đọc thành công, cái nào thử mở thất bại, cái nào chưa mở. Không nêu nội dung doc trừ khi đã thực sự mở.
  5. `[Info Completeness]`: Ghi rõ `Sufficient`/`Partial`/`Insufficient` và lý do cụ thể. Kết quả calibrate metadata (`Type`/`Priority`/`Complexity`/`Risk`/`Team`/`Labels`) và quyết định SLA thuộc về field record (Bước 4), không phải mục comment riêng.
  6. `[Next Steps]`: Các bước hành động trung lập tiếp theo.

---

## 🤖 TỰ TRỊ TUYỆT ĐỐI - KHÔNG DỪNG HỎI

- **KHÔNG hỏi xác nhận, không hỏi lựa chọn phạm vi, không dừng chờ duyệt.**
- Thực thi end-to-end tự động qua Bước 1→6 (Calibrate fields → Update Base → Add Comment → Send IM to Requester).
- Khi chạy qua Cron/batch sweep ("quét ticket mới"), áp dụng cơ chế Watermark Checkpoint bên dưới để tự động lọc ticket mới hợp lệ.

---

## 🔄 Quy trình thực thi

### Bước 1: Nạp ticket & xác định phạm vi

1. **Mode A — Ticket cụ thể:** Có Ticket ID (`#00258`), Record ID (`rec...`), hoặc URL: nạp và xử lý record đó.
2. **Mode B — Ticket mới nhất:** "ticket mới nhất"/"latest ticket": lấy record mới nhất (`sort: Created At desc, limit: 1`).
3. **Mode C — Batch Sweep tự trị (Cron / Watermark):**
   - **Watermark Checkpoint:** Lưu lần chạy cuối tại `.state/triage_watermark.json` trong repo:
     ```json
     { "last_processed_created_at": "2026-09-03T10:00:00.000+07:00", "last_processed_ticket_id": "#00257" }
     ```
   - **Phạm vi nạp:** Query records `Created At asc` với `Created At > last_processed_created_at`. Cold start (chưa có watermark): lấy batch mới nhất trong 2 giờ gần nhất. KHÔNG lọc theo Title/Field — xử lý MỌI ticket mới (kể cả `aaa`, `test`, `123`) và bất kể requester đã điền Priority/Type hay chưa.
   - **Thực thi & tiến state:** Triage tuần tự qua Bước 2–6; cập nhật `Acknowledged At` trên Base; tiến & lưu watermark với `Created At` + `Ticket ID` của ticket cuối xử lý thành công.
   - Nếu 0 record khớp: xuất _"Không có ticket mới kể từ lần chạy trước ([last_processed_created_at])."_ và thoát sạch.
4. **Giải Requester chuẩn:** Với mỗi ticket, trích identity thật từ field hệ thống **`Created By`** (chứa `open_id` + tên người tạo thật). Lưu làm `requesterId` cho Bước 6 — không thay bằng field tên khác.

### Bước 2: Thu thập ngữ cảnh & xác minh đầy đủ

Theo protocol **🔍 Thu thập ngữ cảnh** ở trên — không thỏa mãn bằng việc chỉ ghi nhận link/attachment tồn tại:

1. Kiểm tra cả ba nguồn: text mô tả, field attachment, ngữ cảnh repo/service ngầm.
2. Thực sự gọi tool: tải & đọc mọi attachment, mở mọi link doc, dùng GitHub khi repo không mount.
3. Phân loại `Sufficient`/`Partial`/`Insufficient` theo quy tắc tham chiếu chưa mở giới hạn ở `Partial`.

### Bước 3: Calibrate Metadata & SLA

- **`Type`**: `Bug`/`Feature`/`Task`/`Incident`.
- **`Priority`**: `High`/`Medium`/`Low`.
- **`Complexity`**: `High`/`Medium`/`Low`.
- **`Risk`**: `High`/`Medium`/`Low`.
- **`Team`**: `Engineer`.
- **`Labels`**: tag domain (`["Payment","Backend"]`, `["Frontend","UI/UX"]`). Nếu `Partial`/`Insufficient`, thêm label `"Needs-Info"`.
- **`TTR Due At`**: đánh giá deadline. Nếu phi thực tế/quá gấp (< 2 giờ cho bug không tầm thường), reschedule theo `sla_matrix_hours` trong `config.json`. Nếu `Insufficient`, không rút SLA ngắn hơn default matrix.

### Bước 4: Cập nhật record Lark Base

Áp field update qua `lark-cli base +record-batch-update` (file tạm trong `os.tmpdir()`, xóa ngay trong `finally`). Đảm bảo `Acknowledged At` được đóng dấu ISO datetime hiện tại.

### Bước 5: Đăng comment Stakeholder

Đăng Executive Stakeholder Comment vào record qua `lark-cli drive +add-comment`, theo FORMAT CỐ ĐỊNH (đúng 6 mục, đúng thứ tự), qua `stdin`.

### Bước 6: Thông báo Requester

Gửi thông báo tiếng Việt có dấu tới `requesterId` (open_id từ `Created By` ở Bước 1) dạng interactive Lark Card qua `lark-cli im +messages-send` qua `stdin`. Kèm câu hỏi follow-up theo completeness khi cần. Cuối cùng, cập nhật & lưu watermark tại `.state/triage_watermark.json` trong repo.
