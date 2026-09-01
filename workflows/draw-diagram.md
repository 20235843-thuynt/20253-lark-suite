---
description: Workflow for creating diagrams with Draw.io MCP and exporting SVG / PNG Retina 2x via drawio-cli.
---

# Workflow: Draw.io Diagram Creation, Export & Lark Sync

Follow this workflow to create, convert, and embed aesthetically pleasing diagrams into project documentation using Draw.io MCP tools and Lark CLI.

## Step 1: Draw & Style Diagram via Draw.io MCP (See `use-mcp.md`)
1. Analyze existing codebase, database schemas, or documentation to extract components, entities, or flows.
2. Call `drawio` MCP server tools (`open_drawio_mermaid`, `open_drawio_xml`, `set_page`, `search_shapes`):
   - **Direct MCP Call**: Execute eager/lazy tools from `drawio` MCP server.
   - **MCP Execution Strategy**: Refer to [`.agents/workflows/use-mcp.md`](use-mcp.md) for executing MCP operations via Gemini CLI or `mcp-manager` subagent to preserve context budget.
3. **Apply Aesthetic Design System**:
   - Add `classDef` styling to color-code architectural layers (Amber for Client, Indigo for Gateway, Teal for API, Emerald for Database, Rose for Workers).
   - Use rounded corners (`rx=10, ry=10`), clean sans-serif fonts, badges, icons, and soft drop shadows.
4. Save the source definition file to `docs/diagrams/<name>.drawio`.

## Step 2: Headless Export to SVG and PNG Retina 2x
Run the batch export script or `drawio-cli` commands:

```bash
# Recommended: Batch export all diagrams to SVG & PNG Retina 2x
npm run export-diagrams
# Or: node scripts/export-diagrams.js


# Single file export via drawio-cli:
npx -y drawio-cli -x -f svg -o docs/diagrams/<name>.drawio.svg docs/diagrams/<name>.drawio
npx -y drawio-cli -x -f png --scale 2 -o docs/diagrams/<name>.png docs/diagrams/<name>.drawio
```

## Step 3: Embed in Documentation & Immediate In-Place Lark Sync
1. In your Markdown document in `./docs/`, embed both the rendered PNG image and an interactive edit link:

```markdown
![<Diagram Title>](./diagrams/<name>.png)
[✏️ Edit Diagram in Draw.io](https://app.diagrams.net/?url=https://raw.githubusercontent.com/<org>/<repo>/main/docs/diagrams/<name>.drawio)
```

2. **IMMEDIATE AUTO SYNC**: Immediately run the Lark sync script to update the document and embed the visual image block **in-place at the exact section**:
```bash
npm run sync
```

---

## ⛔ Strict Constraints & Rules
- **NEVER DRAW DIAGRAMS USING ASCII TEXT BLOCKS** (`+---+`, `[User] -> [Server]`, etc.). ALL diagrams MUST be created via Draw.io MCP tools.
- **APPLY AESTHETIC DESIGN SYSTEM**: Color-code layers and use rounded shapes to ensure modern UI standards.
- **IMMEDIATELY EXECUTE SYNC** (`npm run export-diagrams && npm run sync`) right after creating or editing any `.drawio` diagram file.


