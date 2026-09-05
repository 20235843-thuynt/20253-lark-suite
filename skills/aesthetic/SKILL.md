---
name: aesthetic
description: >-
  Tạo giao diện và sơ đồ có tính thẩm mỹ cao theo các nguyên tắc thiết kế đã được kiểm chứng.
  Dùng khi xây dựng UI/UX, phân tích thiết kế từ trang inspiration, triển khai visual hierarchy và color theory,
  thêm micro-interactions, hoặc tạo tài liệu design system. Áp dụng khung BEAUTIFUL / RIGHT / SATISFYING / PEAK.
---

# Aesthetic

Tạo giao diện đẹp, chuẩn thẩm mỹ bằng cách tuân theo các nguyên tắc thiết kế đã kiểm chứng và quy trình có hệ thống.

## Khi nào dùng skill này

Dùng khi:

- Xây dựng hoặc thiết kế giao diện người dùng
- Phân tích thiết kế từ các trang inspiration (Dribbble, Mobbin, Behance)
- Triển khai visual hierarchy, typography, color theory
- Thêm micro-interactions và animation
- Tạo tài liệu thiết kế và style guide
- Cần hướng dẫn về accessibility và design system
- Áp dụng chuẩn thẩm mỹ cho sơ đồ draw.io (phối màu theo tầng kiến trúc, bo góc, typography rõ ràng)

## Khung 4 giai đoạn

### 1. BEAUTIFUL: Hiểu về thẩm mỹ

Nghiên cứu các thiết kế sẵn có, nhận diện pattern, rút ra nguyên tắc. AI không có "gu" thẩm mỹ bẩm sinh — chuẩn mực phải đến từ việc phân tích các ví dụ chất lượng cao và bám thị hiếu thị trường.

**Tham khảo**: [`references/design-principles.md`](references/design-principles.md) — visual hierarchy, typography, color theory, white space.

### 2. RIGHT: Đảm bảo chức năng

Đẹp mà không dùng được thì vô giá trị. Nghiên cứu design system, kiến trúc component, yêu cầu accessibility.

**Tham khảo**: [`references/design-principles.md`](references/design-principles.md) — design systems, component libraries, chuẩn WCAG.

### 3. SATISFYING: Micro-Interactions

Thêm animation tinh tế với timing phù hợp (150-300ms), easing curve (ease-out cho entry, ease-in cho exit), delay tuần tự.

**Tham khảo**: [`references/micro-interactions.md`](references/micro-interactions.md) — duration, easing, tối ưu hiệu năng.

### 4. PEAK: Kể chuyện qua thiết kế

Nâng tầm bằng yếu tố tường thuật — parallax, particle, nhất quán chủ đề. Dùng có chừng mực: "quá nhiều thứ gì cũng không tốt".

**Tham khảo**: [`references/storytelling-design.md`](references/storytelling-design.md) — narrative elements, scroll storytelling.

## Quy trình

### Workflow 1: Thu thập & phân tích inspiration

1. Duyệt các trang inspiration (Dribbble, Mobbin, Behance, Awwwards).
2. Chụp screenshot full-screen (không phải full page).
3. Phân tích screenshot để rút ra:
   - Phong cách (Minimalism, Glassmorphism, Neo-brutalism...)
   - Layout & grid system
   - Hệ typography & hierarchy (dự đoán tên font Google Fonts + cỡ chữ, đừng mặc định Inter/Poppins)
   - Bảng màu kèm mã hex
   - Kỹ thuật visual hierarchy
   - Pattern component & styling
   - Micro-interactions
   - Cân nhắc accessibility
   - Chấm điểm thẩm mỹ tổng thể (1-10)
4. Ghi lại phát hiện vào design guideline theo template.

### Workflow 2: Tạo & lặp lại design image

1. Định nghĩa prompt: style, màu, typography, đối tượng, animation.
2. Tạo design image.
3. Phân tích ảnh output, chấm điểm thẩm mỹ.
4. Nếu điểm < 7/10: xác định điểm yếu (màu, typography, layout, spacing, hierarchy), tinh chỉnh prompt, tạo lại.
5. Lặp đến khi đạt chuẩn (≥ 7/10).
6. Ghi lại quyết định thiết kế cuối cùng theo template.

## Tài liệu thiết kế

### Tạo Design Guidelines

Dùng [`assets/design-guideline-template.md`](assets/design-guideline-template.md) để ghi: bảng màu & tâm lý màu, hệ typography, nguyên tắc layout & spacing, chuẩn styling component, accessibility, điểm nhấn thiết kế và lý do.

Lưu tại `docs/design-guideline.md`.

### Tạo Design Story

Dùng [`assets/design-story-template.md`](assets/design-story-template.md) để ghi: yếu tố tường thuật & chủ đề, hành trình cảm xúc, user journey & peak moment, lý do quyết định thiết kế.

Lưu tại `docs/design-story.md`.

## Tài nguyên & tích hợp

**Tham khảo**: [`references/design-resources.md`](references/design-resources.md) — nền tảng inspiration, design system, công cụ AI, chiến lược phát triển.

### ⭐ Diagram Design System (BẮT BUỘC cho mọi sơ đồ .drawio)

**Tham khảo**: [`references/diagram-theme.md`](references/diagram-theme.md) — dark theme Tailwind (Slate/Indigo/Emerald/Fuchsia), orthogonal edge, Crow's Foot ERD, grid/gutter 80–100px, chữ Slate-50 tương phản cao, và vòng lặp kiểm tra thị giác. Khi vẽ diagram, LUÔN áp bộ quy chuẩn này.

> Lưu ý: Bản gốc của skill này tham chiếu tới các skill ngoài (`ai-multimodal`, `chrome-devtools`, `media-processing`, `ui-styling`, `web-frameworks`) vốn thuộc hệ Antigravity/Claude. Chúng KHÔNG có trong bộ này. Trong Kiro, hãy dùng công cụ/MCP tương đương đang sẵn có (ví dụ để chụp/tạo/phân tích ảnh) hoặc thao tác thủ công; đừng giả định các skill đó tồn tại.

## Nguyên tắc chính

1. Chuẩn thẩm mỹ đến từ con người, không từ AI — hãy nghiên cứu ví dụ chất lượng.
2. Lặp lại dựa trên phân tích — đừng chấp nhận output đầu tiên.
3. Cân bằng cái đẹp với chức năng và accessibility.
4. Ghi lại quyết định để nhất quán xuyên suốt phát triển.
5. Dùng progressive disclosure — hé lộ độ phức tạp dần dần.
6. Luôn đánh giá thẩm mỹ khách quan (điểm ≥ 7/10).
