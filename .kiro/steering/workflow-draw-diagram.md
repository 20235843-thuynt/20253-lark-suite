---
inclusion: manual
---

# Workflow: Tạo, xuất & đồng bộ sơ đồ Draw.io

Quy trình tạo, chuyển đổi, và nhúng sơ đồ thẩm mỹ vào tài liệu dự án bằng draw.io MCP và Lark CLI, theo **5 bước liên hoàn**. Chạy lệnh `npm run ...` từ **gốc repo**. Chi tiết đầy đủ: skill `drawio-diagrams` và `aesthetic/references/diagram-theme.md`.

## Bước 1: Phân tích & Bóc tách Dữ liệu (Ingestion & Data Extraction)

1. Đọc chính xác dữ liệu — KHÔNG đoán mò: tài liệu `docs/` (`01-prd.md`, `02-system-architecture.md`, `03-database-design.md`), model/schema của dự án, các Type/DTO/interface dùng chung.
2. Phân loại loại sơ đồ theo bản chất dữ liệu:
   - CSDL/schema → **ERD** (Entities, Fields, PK/FK, quan hệ 1‑N / N‑N).
   - Luồng API/Webhook/realtime → **Sequence Diagram** (Actors, Components, bước 1 → 2 → 3).
   - Tổng quan hệ thống → **System Architecture** (Client · Backend · External APIs · Data Layer).
   - Vòng đời trạng thái → **State Diagram**.

## Bước 2: Lập ma trận Tọa độ & Phối màu (Spatial Layout & Styling)

1. **Grid Matrix Rule (BẮT BUỘC)** — tính X,Y theo bước nhảy cố định (xem mục ⛔):
   - Cột (X): 40, 340, 640, 940, 1240... (bước 300px).
   - Hàng (Y): 40, 240, 440, 640... (bước 200px; tăng nếu khối cao > 150px).
   - Gutter tối thiểu 80–100px giữa các khối.
2. **Áp dụng Dark Mode Design System** (theo vai trò/tầng):
   - Nền `#0f172a` Slate900 · surface `#1e293b` Slate800.
   - Frontend/Client `#1e1b4b` Indigo950 · Backend/API/Data `#14532d` Emerald950 · External/accent `#701a75` Fuchsia950.
   - Stroke: Blue `#3b82f6`, Indigo `#6366f1`, Green `#22c55e`, Fuchsia `#d946ef`, Orange `#f97316`. Chữ `#f8fafc`.
3. **Edge bắt buộc orthogonal**: `edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;` (bẻ góc 90°, cấm Bezier). ERD dùng Crow's Foot `startArrow=ERmandOne;endArrow=ERmany;`.

## Bước 3: Khởi tạo File Nguồn XML (.drawio)

1. Gọi TRỰC TIẾP tool server `drawio` MCP (`open_drawio_xml`, `open_drawio_mermaid`, `set_page`, `search_shapes`). Trong Kiro KHÔNG cần Gemini CLI hay subagent.
2. Lưu file nguồn `docs/diagrams/<name>.drawio`. (Tool MCP trả URL để xem/kiểm tra, KHÔNG tự ghi file — phải ghi nội dung XML vào file.)

## Bước 4: Headless Export PNG Retina 2x

```bash
npm run export-diagrams                   # tất cả .drawio
npm run export-diagrams -- <name>         # chỉ 1 file
# Hoặc: node scripts/export-diagrams.js [<name>]

# Xuất từng file qua binary drawio (KHÔNG dùng npm 'drawio-cli' → 404). BẮT BUỘC --border để có lề:
drawio --export --format png --scale 2 --border 24 -o docs/diagrams/<name>.png docs/diagrams/<name>.drawio
```

## Bước 5: Nhúng vào tài liệu (PNG + link XML) & sync Lark in-place

Mô hình chuẩn: **ảnh PNG (xem) + link XML nhúng `#R` (chỉnh sửa)**. KHÔNG dùng `?url=...raw.githubusercontent...`, KHÔNG push `.drawio` lên GitHub — link `#R` tự chứa nội dung sơ đồ nên không phụ thuộc remote/branch.

1. Sinh link `#R` (từ gốc repo): `node scripts/drawio-link.js <name>`.
2. Trong Markdown ở `docs/`, nhúng ảnh PNG + link `#R`:
   ```markdown
   ![<Diagram Title>](./diagrams/<name>.png)
   [✏️ Edit Diagram in Draw.io](https://app.diagrams.net/#R<chuỗi-đã-encode>)
   ```
3. **AUTO SYNC ngay**: `npm run sync`. Thứ tự bắt buộc: overwrite Markdown TRƯỚC → set title SAU (nếu set title trước, H1 không-số của markdown sẽ ghi đè làm mất số thứ tự "01."/"02." trên title doc).

> Đánh đổi của `#R`: sửa trong draw.io Web KHÔNG lưu ngược về file `.drawio`. Muốn cập nhật: sửa `.drawio` trong repo → `npm run export-diagrams -- <name>` (làm mới PNG) → `drawio-link.js <name>` (sinh link mới) → thay link trong doc → `npm run sync`.

---

## Chống Model tính nhầm tọa độ (3 giải pháp)

- **A. Grid Matrix Rule**: ép tính X,Y theo bước nhảy cố định (cột 300px, hàng 200px, gutter ≥80px). Neo `exitX/exitY/entryX/entryY` cho mỗi edge; tách làn 0.25 vs 0.75; đường vòng thêm `<mxPoint>` waypoint.
- **B. Giảm tải khi khó**: nếu khó giữ tọa độ chính xác (sơ đồ nhiều khối), giảm số khối/độ phức tạp của mỗi canvas và bám Grid Matrix Rule chặt hơn thay vì dồn tất cả vào một sơ đồ.
- **C. Visual Inspection Loop (BẮT BUỘC)**: export PNG → ĐỌC LẠI ảnh (vision) → nếu khối đè nhau/đường cắt xuyên/chữ bị đè thì sửa X,Y trong XML rồi export lại. Không coi là xong nếu chưa nhìn ảnh.

## ⛔ Ràng buộc

- **KHÔNG vẽ sơ đồ bằng ASCII** (`+---+`, `[User] -> [Server]`). Mọi sơ đồ qua draw.io MCP.
- **Áp dụng Dark Mode Design System**: color-code theo tầng, edge orthogonal, chữ `#f8fafc`.
- **Tuân thủ Grid Matrix Rule** + chạy Visual Inspection Loop trước khi báo hoàn tất.
- **Export phải có `--border`** (mặc định 24px) để ảnh không bị crop sát mép.
- **Nhúng dạng PNG + link XML `#R`** (`drawio-link.js`); KHÔNG dùng `?url=` GitHub raw, KHÔNG cần push `.drawio`.
- **Sync đúng thứ tự**: overwrite content trước, set title sau (giữ đánh số title).
- **Sync ngay** (`npm run export-diagrams && npm run sync`) sau khi tạo/sửa `.drawio`.
