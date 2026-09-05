---
name: ticket-to-code
version: 1.6.2
description: 'Technical investigation companion cho developer. Dùng khi user yêu cầu phân tích ticket, điều tra ticket, investigate ticket, tìm nguyên nhân lỗi, soi code, xem file nào lỗi, hướng dẫn sửa ticket, chia task, hoặc hiểu tác động lên codebase. Nạp ticket, chủ động tìm Lark Docs/Wiki (có fallback shared-space khi search personal-doc bị chặn quyền) và phát hiện repo liên quan, đọc PRD/use-case, trace codebase, xuất technical dossier + đề xuất chia task — KHÔNG chỉnh sửa code.'
metadata:
  requires:
    bins: ['lark-cli']
---

# Ticket Investigation & Developer Companion Workflow

Quy trình điều tra kỹ thuật tương tác cho kỹ sư phần mềm. Là companion nghiên cứu sâu, cầu nối giữa ticket trên Lark Base, tài liệu product/use-case, và một hoặc nhiều repo local/remote để chuẩn bị technical dossier + đề xuất chia task. Output luôn hiển thị trực tiếp trong chat; skill này KHÔNG ghi ngược vào code, Base, hay Docs.

> **Config**: đọc `config.json` cạnh file này (`.kiro/skills/ticket-to-code/config.json`) để lấy `default_base_token`, `default_table_id`, `workspaces.root_directory`.
>
> **Ánh xạ công cụ trong Kiro**: các tool điều tra tương đương — `view_file` → read_file / read_code; `grep_search` → grep_search; `find_by_name` → file_search; tìm repo remote → GitHub CLI (`gh`) hoặc GitHub MCP nếu có; đọc/tìm Lark → server `lark` MCP hoặc `lark-cli`.

---

## 🧹 GIAO THỨC ZERO-LITTERING (TUYỆT ĐỐI KHÔNG ĐỂ LẠI FILE RÁC)

- **Chỉ điều tra (Read-Only):** Skill này thuần túy điều tra.
- **Không dump tạm:** Không để lại script tìm kiếm tạm, dump JSON thô, hay file scratch trong codebase/workspace.
- **Tổng hợp trong bộ nhớ:** Mọi phân tích, dossier, so sánh diff phải tổng hợp trong bộ nhớ và xuất trực tiếp ra chat.

---

## 🎯 RÀNG BUỘC PHẠM VI

- **CHỈ TƯ VẤN:** Skill này điều tra, map use-case/repo, tóm tắt yêu cầu, và đề xuất chia task. TUYỆT ĐỐI KHÔNG sửa file mã nguồn, ghi edit, tạo ticket/subtask trên Lark Base, hay commit — trừ khi developer yêu cầu triển khai ở prompt sau.
- **ĐỐI TƯỢNG:** Kỹ sư phần mềm / Developer đang prompt.
- **NGÔN NGỮ:** Khớp ngôn ngữ với prompt. Nếu developer prompt tiếng Việt, xuất dossier/phân tích/chia task bằng tiếng Việt (giữ code symbol, file path, cú pháp bằng tiếng Anh).

---

## 👥 Hợp đồng Stakeholder không phụ thuộc vai trò

KHÔNG giả định vai trò cố định như "BA", "QA", "PM". Dùng thuật ngữ tổng quát:

- **`Requester`**: Người báo ticket.
- **`Assignee` / `Developer`**: Kỹ sư đang điều tra/xử lý.
- **Tài liệu tham chiếu `PA`**: Bất kỳ link repo/doc do requester/product cung cấp được coi là **input cần xác minh**, không phải chân lý — luôn đối chiếu với những gì codebase thực sự làm.

---

## ⛔ QUY TẮC KHÔNG GIẢ ĐỊNH (bắt buộc cứng)

KHÔNG được mô tả, tóm tắt, hay tham chiếu nội dung của bất kỳ repo/tài liệu/"related" nào trừ khi đã **thực sự mở** nó bằng tool trong lần chạy này (read_file, grep_search, file_search, một lệnh đọc doc, một lệnh search+read Lark Docs/Wiki, hay một lệnh GitHub). Thấy một link/attachment tồn tại KHÔNG bằng việc đã đọc nó. Tương tự, **việc ticket không có link KHÔNG chứng minh không tồn tại tài liệu liên quan** — phải chủ động search trước khi kết luận "không có PRD/spec". Nếu không mở/tìm được, phải nói rõ trong dossier — và nếu lý do là chặn quyền/xác thực chứ không phải thực sự không tồn tại, cũng phải nói vậy kèm cách khắc phục.

---

## 🔎 Giao thức phát hiện Repo & Use-Case

Bước này chạy trước khi trace code, trả lời 3 câu hỏi: **repo nào liên quan, map vào use-case nào, và tài liệu PA (nếu có) có thực sự phản ánh trong code không?**

### 1. Thu thập mọi tham chiếu trên ticket

- **Text mô tả:** URL repo/PR, link doc use-case (Lark Doc/Wiki, Figma, Confluence).
- **Attachment record:** file upload trực tiếp lên record Bitable — tải và đọc, đừng đoán từ tên file, đừng cho là liên quan chỉ vì file tồn tại (xác minh bằng cách đọc).
- **Ngữ cảnh ngầm:** tên service/module nhắc trong `Affected Service` hoặc `Labels` dù không có link.

### 2. Chủ động search Lark Docs/Wiki (BẮT BUỘC — đừng bỏ qua vì ticket không có link)

1. Xây bộ keyword từ ticket: title, `Affected Service`, `Labels`, 2–3 danh từ khóa từ mô tả.
2. **Thử chính — keyword search:** chạy `lark-cli drive +search` (hoặc subcommand tương đương — xem `lark-cli drive --help` / `lark-cli wiki --help`).
3. **Nếu thử chính lỗi quyền/authorization** (vd `need_user_authorization`) — điều này bình thường khi app chỉ có bot/tenant token, vì search personal-space thường cần user token — thì KHÔNG dừng và KHÔNG báo "không tìm thấy". Chuyển sang fallback.
4. **Fallback — liệt kê shared space/folder:** nếu `config.json` có `wiki_space_id` và/hoặc `use_case_docs_folder_token`, liệt kê trực tiếp bằng `lark-cli wiki +list-nodes --space-id <id>` và/hoặc `lark-cli drive +list --folder-token <token>`. Mở và đọc mọi doc phù hợp keyword.
5. **Nếu cả hai đều không có/không trả về gì**, dossier KHÔNG được lặng lẽ kết luận "không có doc". Nói rõ search bị **chặn bởi quyền/cấu hình**, đề xuất một fix cụ thể (vd: "Thêm app bot vào Wiki space chứa tài liệu use-case, hoặc chạy `lark-cli auth login --user` một lần"). Chỉ khi search thực sự chạy và trả về 0 kết quả mới được ghi "không tìm thấy tài liệu use-case/spec liên quan".

### 3. Xác định repo đích — đừng giả định chỉ có một

1. **Local trước:** quét `workspaces.root_directory` tìm repo khớp affected service hoặc link repo.
2. **Mở rộng:** ticket có thể chạm nhiều repo. Dùng grep_search/file_search khắp các repo cho key term (tên service, tên field, chuỗi lỗi).
3. **Repo remote chưa mount:** dùng GitHub CLI (`gh search code/repos`) hoặc GitHub MCP với keyword từ ticket. Bắt buộc khi repo được nhắc nhưng không thấy local.
4. Mỗi repo trích dẫn trong dossier phải đã thực sự được mở ít nhất một file hoặc chạy một search thật trong phiên này.

### 4. Map vào use-case

- Từ (các) doc đã mở ở Bước 2, xác định use-case(s) ticket thuộc về.
- Nếu repo/doc PA mô tả use-case mà codebase không thực sự triển khai (hoặc khác đi), flag rõ mismatch này.
- Nếu sau cả keyword search và fallback vẫn không thấy doc use-case, nói thẳng thay vì bịa tên use-case.

---

## 📋 HỢP ĐỒNG OUTPUT (6 MỤC BẮT BUỘC, THỨ TỰ CỐ ĐỊNH)

Mọi báo cáo điều tra PHẢI có đúng 6 mục sau, đúng thứ tự, xuất trực tiếp ra chat — không thêm mục tùy tiện, không đổi tên:

### 1️⃣ Ticket Dossier (trích dẫn đầy đủ)

- **Ticket ID & Title**, **Requester & Timestamps** (author, Created At, `TTR Due At`), **Mô tả & Facts đầy đủ**, **Metadata Snapshot** (Type, Priority, Complexity, Risk).

### 2️⃣ Related Repos & Use Cases

- Liệt kê mọi repo đã thực sự mở (local hoặc qua GitHub), mỗi repo một dòng nêu nội dung + lý do liên quan.
- Liệt kê use-case(s) đã map, trích nguồn doc/spec tìm qua keyword search hoặc fallback.
- Ghi rõ 3 kết cục riêng biệt: (a) tìm thấy & liên quan, (b) tìm thấy & đã kiểm nhưng không liên quan, (c) **không thấy vì search bị chặn quyền** (khác với "không tồn tại", kèm fix cụ thể).
- Nếu use-case của repo/doc PA không khớp code, nêu ở đây.

### 3️⃣ Documentation & Spec Findings

- Log yêu cầu nghiệp vụ, acceptance criteria, ràng buộc kiến trúc thực sự đọc từ doc use-case/spec ở Mục 2 và attachment.
- Nếu không mở được doc nào, nói rõ do search thật không thấy hay do bị chặn quyền — nếu bị chặn, lặp lại fix cụ thể.

### 4️⃣ Codebase Investigation Log

- Với mỗi repo ở Mục 2, log file path (link `file:///...`), signature function/module, logic hiện tại thực sự tìm bằng grep_search / file_search / read_file hoặc GitHub.
- Trace luồng request/data liên quan qua các repo khi có nhiều hơn một (vd frontend → API → payment service).

### 5️⃣ Core Requirement Summary (Gap Analysis)

- Tóm tắt ngắn gọn **thực sự cần làm gì** — bản chất yêu cầu chắt lọc từ Mục 3 & 4.
- Đối chiếu **Expected/Requested** (từ doc/spec) vs **Current** (từ codebase): cái gì có, cái gì thiếu, và với bug — vì sao lỗi.
- Nếu Mục 3 bị chặn quyền, flag rằng gap analysis chỉ dựa trên mô tả ticket + quy ước chuẩn, cần xem lại khi doc truy cập được.

### 6️⃣ Proposed Task Breakdown & Estimation Guidance

- Chia ticket thành subtask nhỏ (tuần tự/song song). Mỗi subtask nêu: **Tên task nhỏ**, **Nội dung cần làm** (tham chiếu file/module cụ thể từ Mục 4), **Ước lượng độ phức tạp** (`Nhỏ`/`Trung bình`/`Lớn`), **Phụ thuộc (nếu có)**.
- Sắp xếp logic (vd backend contract trước frontend). Nếu có câu hỏi mở chặn triển khai, thêm subtask giải quyết trước.

---

## 🔄 QUY TRÌNH THỰC THI

### Bước 1: Nạp ticket

1. Đọc ticket từ Lark Base bằng `lark-cli base +record-get`.
2. Trích mọi metadata, mô tả đầy đủ, link đính kèm.

### Bước 2: Phát hiện & đọc Attachment, Docs (Active Search + Fallback), Repo

Theo **Giao thức phát hiện Repo & Use-Case** ở trên — không thỏa mãn bằng việc chỉ parse link trong mô tả:

1. Thu thập tham chiếu từ text, attachment, ngữ cảnh ngầm.
2. Tải & đọc mọi attachment.
3. Chạy keyword search Lark; nếu lỗi quyền, chạy fallback shared-space trước khi bỏ cuộc.
4. Xác định repo liên quan — quét local trước, rồi GitHub cho phần chưa mount.
5. Theo QUY TẮC KHÔNG GIẢ ĐỊNH: chỉ trích dẫn khi đã mở; chỉ kết luận "không thấy" sau khi search thật trả 0; nếu bị chặn quyền thì báo riêng kèm fix.

### Bước 3: Soi Codebase đa repo

1. Với mỗi repo, tìm/trace file bằng grep_search, file_search, read_file (hoặc GitHub cho repo chưa mount).
2. Ghi chỗ code hiện tại lệch/chưa phủ những gì doc use-case mô tả.

### Bước 4: Tổng hợp Dossier & chia task

1. Tổng hợp thành 6 mục Output Contract.
2. Đề xuất subtask kèm sizing/dependency (Mục 6).
3. Xuất dossier trực tiếp ra chat — không ghi ra file, Base, hay Doc.
