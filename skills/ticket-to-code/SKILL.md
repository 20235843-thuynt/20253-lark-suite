---
name: ticket-to-code
version: 1.5.0
description: "Technical investigation companion for developers. Use whenever the user asks to phân tích ticket, điều tra ticket, investigate ticket, tìm nguyên nhân lỗi, soi code, xem file nào lỗi, hướng dẫn sửa ticket, or understand codebase impact. Ingests ticket, reads PRDs, traces codebase, and outputs 5-section technical dossier without mutating code."
metadata:
  requires:
    bins: ["lark-cli"]
---

# Ticket Investigation & Developer Companion Workflow

Interactive technical investigation workflow for software engineers. Acts as a deep-dive research and advisory companion that bridges Lark Base tickets, product documentation, and local repositories to prepare an actionable technical dossier for the developer.

---

## 🧹 MANDATORY ZERO-LITTERING PROTOCOL (TUYỆT ĐỐI KHÔNG ĐỂ LẠI FILE RÁC)

- **Read-Only Investigation:** This skill is strictly investigative.
- **No Transient Dumps:** Never leave temporary search scripts, raw JSON dumps, or scratch files inside the target codebase or user workspace.
- **In-Memory Synthesis:** All analysis, dossier generation, and diff comparisons must be synthesized in memory and output directly into the active chat session.

---

## 🎯 SCOPE & BOUNDARY CONSTRAINTS

- **ADVISORY ONLY:** This skill performs investigation, root-cause diagnosis, and technical solution design. It **MUST NOT** mutate source code files, write edits, or commit changes unless the developer explicitly asks to proceed with implementation in a subsequent prompt.
- **AUDIENCE:** Software Engineer / Developer currently prompting in the CLI.
- **LANGUAGE DIRECTIVE:** Match the response language to the user prompt. If the developer prompts in Vietnamese, provide the dossier, analysis, and recommendations in Vietnamese (while keeping code symbols, file paths, and syntax in English).

---

## 👥 Role-Agnostic Stakeholder Contract

Do NOT assume fixed enterprise roles like "BA", "QA", "PM". Use universal role-agnostic terminology:
- **`Requester`**: The person who reported the ticket.
- **`Assignee` / `Developer`**: The engineer currently investigating or resolving the ticket.

---

## 📋 DEVELOPER OUTPUT CONTRACT (5 MANDATORY SECTIONS)

Every investigation report MUST be structured with the following 5 distinct sections:

### 1️⃣ Section 1: Ticket Dossier (Full Ticket Citation)
Cite complete, unadulterated information from the ticket:
- **Ticket ID & Title:** Exact ID and title.
- **Requester & Timestamps:** Author name, Created At, and current Target SLA (`TTR Due At`).
- **Full Description & Facts:** Complete problem statement and reported reproduction steps.
- **Metadata Snapshot:** Current Type, Priority, Complexity, and Risk.

### 2️⃣ Section 2: Documentation & Spec Ingestion (Doc Findings)
Read and log all referenced documentation:
- Extract all Lark Doc / Wiki / PRD / Figma links from the ticket.
- Ingest documents using `lark-doc` or related tools.
- Log key business requirements, architectural constraints, and expected behavior defined by the product spec.

### 3️⃣ Section 3: Codebase Investigation Log (Code Findings)
Inspect and log the relevant codebase in the workspace:
- Identify the target repository via zero-config multirepo discovery.
- Trace the request/data flow related to the ticket.
- Log relevant file paths (using clickable links `file:///...`), function signatures, and current implementation logic.

### 4️⃣ Section 4: Root Cause Diagnosis
Diagnose the exact failure mechanism based on evidence from Sections 2 & 3:
- Contrast **Expected Behavior (from PRD)** vs. **Actual Behavior (from Codebase)**.
- Highlight the offending code lines and explain *why* the bug occurs or what architectural gap exists.

### 5️⃣ Section 5: Technical Recommendations & Action Plan
Provide concrete, actionable engineering guidance for the developer:
- **Recommended Code Changes:** Provide suggested code snippets (Before vs. After diff) for the developer to review.
- **Edge Cases & Risks:** Highlight backward-compatibility considerations and corner cases.
- **Testing & Verification Strategy:** List unit test cases, integration scenarios, or reproduction test commands.

---

## 🔄 EXECUTION WORKFLOW

### Step 1: Ingest Ticket Details
1. Read ticket details from Lark Base using `lark-cli base +record-get`.
2. Extract all metadata, full description, and attached links.

### Step 2: Spec Ingestion & Multi-Doc Reading
1. Scan description for Lark Doc/Wiki URLs (`/docx/` or `/wiki/`).
2. Read referenced documents and synthesize technical constraints.

### Step 3: Multirepo Discovery & Target Codebase Inspection
1. Scan workspace subdirectories in `workspaces.root_directory` to identify matching repository.
2. Search and trace source files using `grep_search`, `find_by_name`, and `view_file`.

### Step 4: Synthesize Dossier & Present to Developer
Synthesize findings into the 5-Section Developer Output Contract and output directly in the chat session.
