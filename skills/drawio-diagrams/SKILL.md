---
name: drawio-diagrams
description: >-
  Hướng dẫn tạo sơ đồ kiến trúc, sequence, ERD, flow và system diagram bằng draw.io MCP,
  xuất PNG Retina 2x qua drawio CLI, và nhúng link chỉnh sửa tương tác vào Markdown và Lark Docs.
  Dùng khi user yêu cầu vẽ sơ đồ, diagram, ERD, kiến trúc hệ thống, sequence flow.
---

# Draw.io Diagram Creation & Export Skill (Kiro)

Skill này hướng dẫn tạo, chỉnh sửa, xuất và nhúng sơ đồ kỹ thuật bằng **draw.io MCP** (server `drawio` đã cấu hình trong Kiro) và binary `drawio` CLI.

> Engine tự động hóa (`scripts/`, `package.json`) nằm ở gốc repo. Các lệnh `npm run ...` bên dưới được chạy từ **gốc repo**.

---

## 1. Nguyên tắc cốt lõi

1. **TUYỆT ĐỐI KHÔNG ASCII DIAGRAM**: KHÔNG BAO GIỜ vẽ sơ đồ bằng khối ASCII (`+---+`, `[A] -> [B]`). MỌI sơ đồ PHẢI được vẽ bằng draw.io MCP và lưu thành file `.drawio`.
2. **ĐỒNG BỘ TỰ ĐỘNG NGAY**: Ngay sau khi tạo/sửa bất kỳ sơ đồ nào, PHẢI biên dịch ảnh (`npm run export-diagrams`) và đồng bộ lên Lark Docs (`npm run sync`) — chạy từ gốc repo.
3. **Chính xác thực nghiệm (Zero Hallucination)**: Sơ đồ PHẢI dựa nghiêm ngặt trên codebase, schema database và tài liệu đã xác minh. KHÔNG bịa hoặc phỏng đoán thành phần. Đọc dữ liệu thật trước khi vẽ (xem Bước 1).
4. **Tích hợp công cụ**: Trong Kiro, gọi TRỰC TIẾP các tool của server `drawio` MCP (`open_drawio_xml`, `open_drawio_mermaid`, `open_drawio_csv`, `set_page`, `get_page`, `search_shapes`) để tạo định nghĩa sơ đồ. Không cần Gemini CLI hay subagent trung gian.
5. **Chuẩn định dạng file**:
   - File nguồn: `docs/diagrams/<name>.drawio`
   - PNG Retina 2x (cho Git repo & import vào Lark Docs): `docs/diagrams/<name>.png`

---

## 2. Quy trình 5 bước liên hoàn (Docs/Code → Diagram → Sync)

Quy trình tạo sơ đồ được chuẩn hóa qua **5 bước liên hoàn**, từ khâu phân tích thông tin đến khâu biên dịch và nhúng tài liệu. KHÔNG bỏ bước, KHÔNG đảo thứ tự.

### Bước 1 — Phân tích & Bóc tách Dữ liệu (Ingestion & Data Extraction)

Trước khi vẽ, Agent **không đoán mò** mà đọc chính xác dữ liệu từ tài liệu hoặc mã nguồn:

- **Đọc Specs/Codebase**: đọc các file tài liệu trong `docs/` (vd `01-prd.md`, `02-system-architecture.md`, `03-database-design.md`), model/schema của dự án (bất kể ORM/ngôn ngữ), và các Type/DTO/interface dùng chung.
- **Phân loại loại Sơ đồ (Diagram Type)** theo bản chất dữ liệu:
  - Dữ liệu cơ sở dữ liệu/schema → **ERD** (Entities, Fields, Data Types, PK/FK, quan hệ 1‑N / N‑N).
  - Luồng xử lý API/Webhook/realtime → **Sequence Diagram** (Actors, Service Components, trình tự bước 1 → 2 → 3).
  - Tổng quan kiến trúc → **System Architecture Diagram** (Client Layer, Backend Services, External APIs, Data Layer).
  - Vòng đời trạng thái → **State Diagram** (các state + điều kiện chuyển).

### Bước 2 — Lập ma trận Tọa độ & Phối màu (Spatial Layout & Styling)

Bước quyết định sơ đồ có đẹp và không bị chồng chéo hay không.

- **Tính toán ma trận Grid Tọa độ (X, Y)** — bắt buộc theo **Grid Matrix Rule** (mục 4). Chia mặt phẳng thành cột/hàng rõ ràng, giữ **hành lang 80–100px** giữa các khối để đường nối chạy qua mà không đè lên chữ.
- **Gán Style & Theme**: áp dụng mã màu Dark Mode theo vai trò thực thể (xem mục 5 và `aesthetic/references/diagram-theme.md`).
- **Cấu hình đường nối bắt buộc**: `edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;` (bẻ góc 90°, cấm đường cong Bezier).

### Bước 3 — Khởi tạo File Nguồn XML (`.drawio`)

Agent sinh cây XML `mxGraphModel` hoàn chỉnh (các `<mxCell>` vertex cho khối/bảng và edge cho đường nối) qua tool `drawio` MCP (`open_drawio_xml` / `open_drawio_mermaid`), rồi **lưu file nguồn**:

- Đường dẫn lưu: `docs/diagrams/<ten-so-do>.drawio`.

> Lưu ý cơ chế Kiro: tool `open_drawio_xml` trả về URL editor để xem/kiểm tra, KHÔNG tự ghi file. Sau khi dựng và kiểm tra XML, GHI nội dung `.drawio` vào `docs/diagrams/<name>.drawio` bằng công cụ ghi file.

### Bước 4 — Biên dịch tự động ra PNG Retina 2x (Automated Export)

Chạy script export (từ gốc repo):

```bash
npm run export-diagrams                        # xuất tất cả .drawio
npm run export-diagrams -- <name>              # chỉ xuất 1 file (có/không đuôi .drawio đều được)
# Hoặc: node scripts/export-diagrams.js [<name>]
```

Hoặc xuất từng file qua `drawio` desktop CLI (đã cài, vd Homebrew `brew install --cask drawio`).
**BẮT BUỘC có `--border`** để chừa lề, tránh ảnh bị crop sát mép (mặc định drawio = 0 → xấu):

```bash
# Xuất PNG độ phân giải Retina 2x nét căng cho repo & Lark Docs (border 24px)
drawio --export --format png --scale 2 --border 24 -o docs/diagrams/<name>.png docs/diagrams/<name>.drawio
```

> ⚠️ KHÔNG dùng gói npm `drawio-cli` (không tồn tại trên registry → lỗi 404). Dùng binary `drawio` trên PATH. Script `scripts/export-diagrams.js` đọc binary qua biến `DRAWIO_BIN` (mặc định `drawio`) và lề qua `DRAWIO_BORDER` (mặc định `24`).

### Bước 5 — Nhúng vào Tài liệu & Đồng bộ (Embed & Sync Docs)

Mô hình chuẩn: **ảnh PNG (xem) + link XML nhúng `#R` (chỉnh sửa)**. KHÔNG dùng `?url=...raw.githubusercontent...` và KHÔNG cần push `.drawio` lên GitHub — vì link `#R` đã chứa toàn bộ nội dung sơ đồ (self-contained), mở là sửa được ngay, không phụ thuộc remote/branch.

- **Tạo link `#R`** từ file `.drawio` (từ gốc repo):

  ```bash
  node scripts/drawio-link.js <name>        # in ra link https://app.diagrams.net/#R... cho docs/diagrams/<name>.drawio
  ```

  Script nén XML đúng chuẩn draw.io (`deflateRaw` + base64 + `encodeURIComponent`) và tự round-trip verify. KHÔNG dán XML thô vào sau `#R` (URL sẽ hỏng → lỗi "Bad Request" từ edge server).

- **Cập nhật Markdown**: nhúng ảnh PNG + link `#R`:

  ```markdown
  ![<Diagram Title>](./diagrams/<name>.png)
  [✏️ Edit Diagram in Draw.io](https://app.diagrams.net/#R<chuỗi-đã-encode>)
  ```

- **Đồng bộ Lark Docs/Wiki**: chạy `npm run sync` (từ gốc repo) để upload PNG Retina 2x và nhúng in‑place.

> Vì sao dùng `#R` thay vì `?url=` GitHub raw: link `?url=` yêu cầu file `.drawio` phải được commit + push lên đúng branch remote, nếu không draw.io báo 404. Link `#R` mang theo nội dung sơ đồ trong chính URL nên bỏ được ràng buộc git. Đánh đổi: sửa trong draw.io Web sẽ **không lưu ngược** về file `.drawio` gốc — muốn cập nhật thì sửa file `.drawio` trong repo rồi chạy lại `drawio-link.js` để sinh link mới.
  - ⚠️ **Thứ tự bắt buộc trong sync**: ghi đè nội dung Markdown (`docs +update overwrite`) **TRƯỚC**, rồi mới đặt lại tiêu đề (`drive +update-title`) **SAU**. Lark lấy H1 đầu tiên của markdown làm title khi overwrite; nếu set title trước thì H1 (thường KHÔNG có tiền tố đánh số như "01.") sẽ ghi đè và làm **mất số thứ tự** trên title doc. Đặt title sau để giữ đúng "01. …", "02. …".

### Tóm tắt luồng 5 bước

`Docs / Codebase` → (1. bóc tách thực thể) → `Ma trận tọa độ X,Y + style rules` → (2. dựng mxGraph XML) → `docs/diagrams/<name>.drawio` → (3. export) → `<name>.png (Retina 2x)` → (4. nhúng vào `docs/*.md` + 5. sync lên Lark DocX/Wiki).

> Luồng trên chỉ mô tả quy trình bằng văn xuôi. KHÔNG dùng ASCII để vẽ sơ đồ sản phẩm — mọi sơ đồ đầu ra PHẢI vẽ bằng draw.io MCP.

---

## 3. Loại sơ đồ được hỗ trợ

| Loại sơ đồ                          | Tên file đề xuất                           | Tài liệu đích                    |
| :---------------------------------- | :----------------------------------------- | :------------------------------- |
| **System Architecture & Container** | `docs/diagrams/system-architecture.drawio` | `docs/02-system-architecture.md` |
| **Entity Relationship (ERD)**       | `docs/diagrams/database-erd.drawio`        | `docs/03-database-design.md`     |
| **Sequence & Data Flow**            | `docs/diagrams/sequence-flow.drawio`       | `docs/02-system-architecture.md` |
| **State / Lifecycle**               | `docs/diagrams/<entity>-state.drawio`      | `docs/02-system-architecture.md` |
| **Use Case**                        | `docs/diagrams/use-case.drawio`            | `docs/01-prd.md`                 |
| **CI/CD Pipeline & Deployment**     | `docs/diagrams/deployment-pipeline.drawio` | `docs/07-testing-deployment.md`  |

---

## 4. Chống Model tính nhầm tọa độ (3 giải pháp bắt buộc)

Để tránh việc Model tính nhầm tọa độ gây chồng chéo, repo áp dụng **3 giải pháp**:

### A. Ép Model dùng "Công thức ma trận Lưới" (Grid Matrix Rule)

KHÔNG để Model tự nghĩ tọa độ ngẫu nhiên — bắt buộc tính theo bước nhảy cố định (step size):

- **Cột (X-axis):** `Col0 = 40`, `Col1 = 340`, `Col2 = 640`, `Col3 = 940`, `Col4 = 1240`... (mỗi cột cách nhau **300px**; bảng rộng ~220–320px luôn dư ≥80px lề).
- **Hàng (Y-axis):** `Row0 = 40`, `Row1 = 240`, `Row2 = 440`, `Row3 = 640`... (mỗi hàng cách nhau **200px**). Nếu bảng cao hơn ~150px, tăng bước hàng tương ứng (vd 240→280px) để giữ gutter ≥80px.
- **Gutter tối thiểu 80px** giữa các khối để đường nối có hành lang chạy qua mà không đè chữ.
- Với sơ đồ nhiều thực thể (ERD ≥8 bảng): giãn rộng hơn (bước cột 400–500px, bước hàng 250–500px) — chấp nhận canvas lớn, ưu tiên KHÔNG chồng chéo.

**Neo điểm ra/vào + waypoint (chống đường cắt xuyên):**

- Neo cạnh ra/vào cho mỗi edge: `exitX=..;exitY=..;entryX=..;entryY=..` (giá trị 0 / 0.25 / 0.5 / 0.75 / 1).
- Khi 2 đường cùng vào/ra một khối, dùng exitX/entryX khác nhau (0.25 vs 0.75) để tách làn.
- Đường đi xa/vòng: thêm `<Array as="points"><mxPoint x=".." y=".."/></Array>` để định tuyến qua hành lang trống.

### B. Giảm độ phức tạp mỗi canvas khi khó giữ tọa độ

Khi sơ đồ có nhiều thực thể và khó theo dõi tọa độ chính xác, chia nhỏ thành nhiều sơ đồ đơn giản hơn, giảm số khối trên mỗi canvas, và bám sát Grid Matrix Rule chặt hơn thay vì dồn tất cả vào một canvas dày đặc.

### C. Vòng lặp kiểm tra thị giác (Visual Inspection Loop) — BẮT BUỘC

Sau khi export PNG, **ĐỌC LẠI ảnh** (multimodal / vision) để kiểm tra: có chữ bị đè, đường nối cắt ngang khối, node chồng nhau không. Nếu có → tự động sửa lại `X, Y` trong XML rồi export lại. **Không coi là xong nếu chưa nhìn ảnh.**

---

## 5. Phối màu Dark Mode & Style chuẩn

Áp dụng mã màu theo vai trò thực thể/tầng (chi tiết đầy đủ: `aesthetic/references/diagram-theme.md`):

| Vai trò / Tầng             | fillColor               | strokeColor       |
| :------------------------- | :---------------------- | :---------------- |
| Nền chung / container      | `#0f172a` (Slate 900)   | —                 |
| Khối phụ / surface         | `#1e293b` (Slate 800)   | `#3b82f6` Blue    |
| Frontend / Client          | `#1e1b4b` (Indigo 950)  | `#3b82f6` Blue    |
| Backend / API / Data-store | `#14532d` (Emerald 950) | `#22c55e` Green   |
| Gateway / phân loại        | —                       | `#6366f1` Indigo  |
| External / nhấn mạnh       | `#701a75` (Fuchsia 950) | `#d946ef` Fuchsia |
| Actor / urgency            | `#701a75`               | `#f97316` Orange  |

- **Chữ:** `fontColor=#f8fafc` (Slate 50) — tương phản cao trên nền tối.
- **Node chuẩn:** `rounded=1;whiteSpace=wrap;html=1;fillColor=<fill>;strokeColor=<stroke>;fontColor=#f8fafc;`
- **Edge chuẩn:** `edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=<stroke>;fontColor=#f8fafc;labelBackgroundColor=#0f172a;`
- **ERD Crow's Foot:** `startArrow=ERmandOne;endArrow=ERmany;`
