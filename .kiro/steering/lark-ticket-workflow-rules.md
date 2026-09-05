---
inclusion: manual
---

# Zero-Artifact Littering Rule (Lark Suite)

## Chỉ thị vệ sinh workspace phổ quát

Mọi agent thực thi tác vụ (triage ticket, điều tra codebase, debug, refactor) PHẢI tuân thủ nghiêm ngặt quy tắc zero-artifact littering:

1. **Không dump scratch/tạm:** KHÔNG để lại script tạm (vd `temp_*.js`, `test_*.txt`, `comment.json`, `im_msg.txt`) trong workspace root hay thư mục repo.
2. **RAM trước (Stdin Streams):** Luôn ưu tiên truyền dữ liệu trong bộ nhớ (vd payload UTF-8 qua `stdin` với `--content -`).
3. **Dọn file tạm có kiểm soát:** Nếu buộc phải ghi ra đĩa, file PHẢI tạo trong thư mục tạm của OS (`os.tmpdir()` / `$env:TEMP`) và xóa ngay trong khối `finally`.
4. **Clean Exit:** Luôn để workspace ở trạng thái sạch sau các lệnh tool.
