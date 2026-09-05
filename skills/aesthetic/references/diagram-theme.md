# Diagram Design System — Dark Theme (draw.io)

Bộ quy chuẩn BẮT BUỘC cho mọi sơ đồ `.drawio` trong dự án. Áp dụng cho ERD, architecture, sequence, flow, state, deployment. Mục tiêu: sơ đồ dark-mode nhất quán, tương phản cao, không chồng chéo.

## 1. Phối màu — Dark Mode (Tailwind palette)

**Nền khối (fillColor) theo tầng:**
| Tầng | fillColor | Tên |
| :--- | :--- | :--- |
| Nền chung / container | `#0f172a` | Slate 900 |
| Khối phụ / surface | `#1e293b` | Slate 800 |
| Frontend / Client | `#1e1b4b` | Indigo 950 |
| Backend / API / Data-store | `#14532d` | Emerald 950 |
| External / nhấn mạnh | `#701a75` | Fuchsia 950 |

**Viền & đường nối (strokeColor):**
| Vai trò | strokeColor | Tên |
| :--- | :--- | :--- |
| Mặc định / frontend | `#3b82f6` | Blue |
| Gateway / Indigo | `#6366f1` | Indigo |
| Backend / success | `#22c55e` | Green |
| External / accent | `#d946ef` | Fuchsia |
| Actor / urgency | `#f97316` | Orange |

**Chữ:** `fontColor=#f8fafc` (Slate 50) — tương phản cao trên nền tối.

## 2. Đường nối (Edge Routing)

BẮT BUỘC orthogonal, bẻ góc 90°, cấm đường cong Bezier:

```
edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=<màu viền>;fontColor=#f8fafc;
```

## 3. Ký hiệu quan hệ ERD (Crow's Foot)

```
startArrow=ERmandOne;endArrow=ERmany;
```

## 4. Ma trận Lưới Tọa độ (Grid Matrix Rule — BẮT BUỘC)

KHÔNG đặt tọa độ ngẫu nhiên. Tính X,Y theo bước nhảy cố định để tránh Model tính nhầm gây chồng lấn:

- **Cột (X):** Col0=40, Col1=340, Col2=640, Col3=940, Col4=1240... (bước nhảy **300px**). Bảng rộng ~220–320px luôn dư ≥80px lề.
- **Hàng (Y):** Row0=40, Row1=240, Row2=440, Row3=640... (bước nhảy **200px**). Nếu bảng cao hơn 150px, tăng bước hàng tương ứng (vd 240→280px) để giữ gutter ≥80px.
- **Gutter tối thiểu 80px** giữa các bảng để đường nối có hành lang chạy qua mà không đè chữ.
- Với sơ đồ nhiều thực thể (ERD ≥8 bảng): giãn rộng hơn (bước cột 400–500px, bước hàng 250–500px) — chấp nhận canvas lớn, ưu tiên KHÔNG chồng chéo.

### Neo điểm ra/vào + waypoint (chống đường cắt xuyên)

- Neo cạnh ra/vào cho mỗi edge để đường không cắt qua box khác: `exitX=..;exitY=..;entryX=..;entryY=..` (giá trị 0/0.25/0.5/0.75/1).
- Khi 2 đường cùng đi vào/ra một bảng, dùng exitX/entryX khác nhau (0.25 vs 0.75) để tách làn.
- Đường đi xa/vòng: thêm `<Array as="points"><mxPoint x=".." y=".."/></Array>` để định tuyến qua hành lang trống.
- Căn nội dung bảng: `spacingLeft=12;align=left;` cho từng row; header `fontStyle=1;align=center;`.

## 5. Style node chuẩn (ví dụ)

```
rounded=1;whiteSpace=wrap;html=1;fillColor=#1e1b4b;strokeColor=#6366f1;fontColor=#f8fafc;
```

## 6. Xuất ảnh

**BẮT BUỘC thêm `--border` (vd 24px)** để chừa lề, tránh ảnh bị crop sát mép (mặc định drawio = 0):

- SVG (repo): `drawio --export --format svg --border 24 -o docs/diagrams/<name>.drawio.svg docs/diagrams/<name>.drawio`
- PNG Retina 2x (Lark): `drawio --export --format png --scale 2 --border 24 -o docs/diagrams/<name>.png docs/diagrams/<name>.drawio`
- Nền tối khi export: thêm `--theme dark` nếu muốn khung nền tối; hoặc set fillColor nền trong sơ đồ.
- Dùng binary `drawio` (Homebrew/desktop) trên PATH — KHÔNG dùng gói npm `drawio-cli` (không tồn tại → 404).

## 7. Vòng lặp kiểm tra thị giác (bắt buộc)

Sau khi export PNG, ĐỌC LẠI ảnh (multimodal) để kiểm tra: có chữ bị đè, đường nối cắt ngang bảng, node chồng nhau không. Nếu có → điều chỉnh tọa độ X,Y hoặc tăng gutter rồi export lại. Không coi là xong nếu chưa nhìn ảnh.
