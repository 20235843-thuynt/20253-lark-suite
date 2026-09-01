---
name: drawio-diagrams
description: >-
  Comprehensive guide and instructions for creating technical architecture, sequence, ERD, flow, and system diagrams using Draw.io MCP, exporting to SVG and PNG Retina 2x via drawio-cli, and embedding interactive edit links into Markdown and Lark Docs.
---

# Draw.io Diagram Creation & Export Skill Guide

This skill provides step-by-step instructions for creating, editing, exporting, and embedding technical diagrams using Draw.io MCP and `drawio-cli`.

---

## 1. Core Principles & Guidelines

1. **STRICT NO ASCII DIAGRAMS**: NEVER create diagrams using ASCII text blocks or code blocks (`+---+`, `[A] -> [B]`). EVERY diagram MUST be drawn using Draw.io MCP and saved as a `.drawio` file.
2. **IMMEDIATE AUTOMATED SYNC**: Immediately after creating or modifying any diagram, you MUST compile the images (`npm run export-diagrams`) and sync to Lark Docs (`npm run sync`) without waiting.
3. **Empirical Accuracy**: Diagrams MUST be strictly derived from verified codebase, database schemas, and documentation. **NEVER** invent or hallucinate unrelated components.
4. **Tooling Integration**: Always use the `drawio` MCP server (`open_drawio_xml`, `open_drawio_mermaid`, `open_drawio_csv`, `set_page`, `get_page`) to generate diagram definitions.
5. **Format Standard**:
   - Source definition file: `docs/diagrams/<name>.drawio`
   - Rendered SVG (for Git repository): `docs/diagrams/<name>.drawio.svg`
   - Rendered PNG Retina 2x (for Lark Docs import): `docs/diagrams/<name>.png`


---

## 2. Diagram Creation Workflow

### Step 1: Generate Source Diagram via Draw.io MCP
Use `drawio` MCP tools to create or update diagram definitions in XML format:
- Call `open_drawio_mermaid` or `open_drawio_xml` to construct the diagram tree.
- Save the resulting file as `docs/diagrams/<name>.drawio`.

### Step 2: Automated Batch Export (Recommended)
Run the automated script to compile all `.drawio` files to SVG and PNG Retina 2x:

```bash
npm run export-diagrams
# Or: node scripts/export-diagrams.js
```


### Alternative: Single File Export via `drawio-cli`
```bash
# 1. Export SVG for repository documentation
npx -y drawio-cli -x -f svg -o docs/diagrams/<name>.drawio.svg docs/diagrams/<name>.drawio

# 2. Export PNG Retina 2x for Lark Docs integration
npx -y drawio-cli -x -f png --scale 2 -o docs/diagrams/<name>.png docs/diagrams/<name>.drawio
```

### Step 3: Embed Diagram in Markdown & Lark Docs
In your Markdown file in `./docs/`, embed both the rendered image and an interactive edit link:

```markdown
![<Diagram Title>](./diagrams/<name>.png)
[✏️ Edit Diagram in Draw.io](https://app.diagrams.net/?url=https://raw.githubusercontent.com/<org>/<repo>/main/docs/diagrams/<name>.drawio)
```

---

## 3. Supported Diagram Types & References

| Diagram Type | Recommended Extension / Name | Target Document |
| :--- | :--- | :--- |
| **System Architecture & Container Diagram** | `docs/diagrams/system-architecture.drawio` | `docs/02-system-architecture.md` |
| **Entity Relationship Diagram (ERD)** | `docs/diagrams/database-erd.drawio` | `docs/03-database-design.md` |
| **Sequence & Data Flow Diagram** | `docs/diagrams/sequence-flow.drawio` | `docs/02-system-architecture.md` |
| **Use Case Diagram** | `docs/diagrams/use-case.drawio` | `docs/01-prd.md` |
| **CI/CD Pipeline & Deployment Diagram** | `docs/diagrams/deployment-pipeline.drawio` | `docs/07-testing-deployment.md` |
