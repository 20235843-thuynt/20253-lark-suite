---
inclusion: manual
---

# Development & Execution Rules (Lark Suite)

## 1. Nguyên tắc Zero Hallucination

- Mọi tài liệu và sơ đồ PHẢI bám nghiêm ngặt vào bằng chứng thực nghiệm từ code, schema database đã xác minh, và asset thực của dự án.
- KHÔNG bịa thành phần kiến trúc, endpoint, hay bảng database không tồn tại.

## 2. Verify trước khi hoàn tất

- KHÔNG đánh dấu tác vụ tài liệu/đồng bộ là xong nếu chưa chạy lệnh verify.
- Kiểm tra format Markdown, header metadata (`Version`, `Last Updated`, `Lark Doc ID`), và đảm bảo `drawio-cli` export không lỗi.

## 3. Atomic Commit & Sync

- Khi cập nhật tài liệu: sửa file Markdown local trong `docs/` trước.
- Biên dịch lại sơ đồ (`.drawio` → PNG Retina 2x) trước khi sync lên Lark Docs.
- Luôn dùng `docs +update` cho tài liệu đã tồn tại để tránh tạo trùng trên Lark.
