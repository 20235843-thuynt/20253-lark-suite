---
name: ticket-to-code
version: 1.6.2
description: "Technical investigation companion for developers. Use whenever the user asks to phân tích ticket, điều tra ticket, investigate ticket, tìm nguyên nhân lỗi, soi code, xem file nào lỗi, hướng dẫn sửa ticket, chia task, or understand codebase impact. Ingests ticket, actively searches Lark Docs/Wiki (with a shared-space fallback when personal-doc search is blocked by permissions) and discovers related repos, reads PRDs/use-case docs, traces codebase, and outputs a technical dossier plus a proposed task breakdown, without mutating code."
metadata:
  requires:
    bins: ["lark-cli"]
---

# Ticket Investigation & Developer Companion Workflow

Interactive technical investigation workflow for software engineers. Acts as a deep-dive research and advisory companion that bridges Lark Base tickets, product/use-case documentation, and one or more local or remote repositories to prepare an actionable technical dossier — plus a proposed task breakdown — for the developer. Output is always displayed directly in the chat session; nothing is written back to code, Base, or Docs by this skill.

---

## 🧹 MANDATORY ZERO-LITTERING PROTOCOL (TUYỆT ĐỐI KHÔNG ĐỂ LẠI FILE RÁC)

- **Read-Only Investigation:** This skill is strictly investigative.
- **No Transient Dumps:** Never leave temporary search scripts, raw JSON dumps, or scratch files inside the target codebase or user workspace.
- **In-Memory Synthesis:** All analysis, dossier generation, and diff comparisons must be synthesized in memory and output directly into the active chat session.

---

## 🎯 SCOPE & BOUNDARY CONSTRAINTS

- **ADVISORY ONLY:** This skill performs investigation, use-case/repo mapping, requirement summarization, and task-breakdown proposals. It **MUST NOT** mutate source code files, write edits, create tickets/subtasks in Lark Base, or commit changes unless the developer explicitly asks to proceed with implementation in a subsequent prompt.
- **AUDIENCE:** Software Engineer / Developer currently prompting in the CLI.
- **LANGUAGE DIRECTIVE:** Match the response language to the user prompt. If the developer prompts in Vietnamese, provide the dossier, analysis, and task breakdown in Vietnamese (while keeping code symbols, file paths, and syntax in English).

---

## 👥 Role-Agnostic Stakeholder Contract

Do NOT assume fixed enterprise roles like "BA", "QA", "PM". Use universal role-agnostic terminology:
- **`Requester`**: The person who reported the ticket.
- **`Assignee` / `Developer`**: The engineer currently investigating or resolving the ticket.
- **`PA` reference material**: Any repo/doc link supplied by the requester or product/analysis side (e.g. a "use-case" repo or design doc) is treated as an **input to verify**, not as ground truth to repeat uncritically — always cross-check it against what the target codebase actually does.

---

## ⛔ NO-ASSUMPTION RULE (hard requirement)

You MUST NOT describe, summarize, or reference the content of any attached repository, attached document, or "related" repo/doc unless you **actually opened it** with a tool in this run (`view_file`, `grep_search`, `find_by_name`, a doc-read call, a Lark Docs/Wiki search+read call, or a GitHub MCP call). Noticing that a link or attachment *exists* is not the same as reading it. Likewise, **the absence of a link inside the ticket description is not proof that no relevant document exists** — you must actively search before concluding "no PRD/spec found" (see the Doc Discovery rule below). If something could not be opened or found, say so explicitly in the dossier — and if the reason is a permissions/authentication block rather than genuine non-existence, say that too, plus what would fix it (see the Doc Discovery Fallback rule).

---

## 🔎 Repo & Use-Case Discovery Protocol

This step runs before any code tracing and answers three questions: **which repos are involved, which use-case(s) do they map to, and is the PA-supplied reference (if any) actually reflected in the code?**

### 1. Collect every reference on the ticket
- **Description text:** explicit repo/PR URLs, use-case doc links (Lark Doc/Wiki, Figma, Confluence-style links).
- **Record attachments:** files uploaded directly onto the Bitable record (a Lark Base "Attachment" field) — download and read these; do not guess content from a filename, and do not assume relevance just because a file exists (verify by reading it — an attachment can be mistakenly uploaded and unrelated, e.g. an unrelated SOP file).
- **Implied context:** service/module names mentioned in `Affected Service` or `Labels` even without an explicit link.

### 2. Active Lark Docs/Wiki search (MANDATORY — do not skip because the ticket has no explicit doc link)
A ticket having no doc link in its description does **not** mean no relevant use-case/spec doc exists — PA teams often keep use-case docs in a personal library or a shared Wiki/Drive space without linking every ticket back to them. Therefore:

1. Build a keyword set from the ticket: title, `Affected Service`, `Labels`, and 2–3 key nouns from the description (e.g. for #00262: "VietQR", "hóa đơn", "đối soát", "Napas").
2. **Primary attempt — keyword search:** run `lark-cli drive +search` (or the equivalent search subcommand — check `lark-cli drive --help` / `lark-cli wiki --help` if unsure) with those keywords.
3. **If the primary attempt fails with a permission/authorization error** (e.g. `need_user_authorization`) — this is expected when the app only has a bot/tenant token, since Lark's personal-space search generally requires a user-level token — do **NOT** stop here and do **NOT** report "no doc found". Instead, attempt the fallback below.
4. **Fallback — shared space/folder listing:** if `config.json` defines a `wiki_space_id` and/or `use_case_docs_folder_token` for use-case documentation, list its contents directly with `lark-cli wiki +list-nodes --space-id <id>` and/or `lark-cli drive +list --folder-token <token>` (exact subcommand names may vary — verify with `--help`). Listing a specific space/folder that the bot app has been added to as a member typically works with a tenant/bot token alone, unlike a free-text personal search. Open and read every doc returned that plausibly matches the ticket's keywords.
5. **If both the keyword search and the fallback are unavailable or return nothing** (no `wiki_space_id`/`use_case_docs_folder_token` configured, or the fallback also fails), the dossier MUST NOT quietly conclude "no doc found" as if it were a content gap. State plainly that the search was **blocked by permissions/configuration**, and recommend one concrete fix for the developer, e.g.: "Thêm app bot vào Wiki space chứa tài liệu use-case (để đọc bằng tenant token, không cần OAuth), hoặc chạy `lark-cli auth login --user` một lần để cấp user token cho phiên làm việc này." Only when a search genuinely ran (keyword or fallback) and returned zero relevant matches may the dossier state "không tìm thấy tài liệu use-case/spec liên quan".

### 3. Identify the target repo(s) — do not assume there is only one
1. **Local first:** scan `workspaces.root_directory` for a repo whose name/README/module structure matches the ticket's affected service or any explicitly linked repo.
2. **Broaden the search:** a ticket can touch more than one repo (e.g. a backend payment service + a frontend billing UI + a shared library). Use `grep_search`/`find_by_name` across all mounted repos in the workspace for the ticket's key terms (service name, field names, error strings) to surface repos you might otherwise miss.
3. **Remote repos not mounted locally:** call the connected **GitHub MCP tool** (repo/code search) using keywords from the ticket to check whether a relevant repo exists remotely even if it isn't open in the current workspace. This is mandatory whenever a repo is referenced but not found locally — do not skip it just because nothing is currently mounted.
4. For every repo you end up citing in the dossier, you must have actually opened at least one file or run at least one real search inside it in this session.

### 4. Map to use-case(s)
- Using whatever doc(s) were opened in Step 2, identify which named use-case(s) the ticket falls under (e.g. "UC-12: Cư dân thanh toán hóa đơn qua VietQR").
- If the PA-supplied repo/doc describes a use-case that the identified codebase does not actually implement (or implements differently), flag this mismatch explicitly — do not smooth it over.
- If, after both the keyword search and the fallback in Step 2 were genuinely attempted, no use-case doc can be found, state that plainly rather than inventing a use-case name.

---

## 📋 DEVELOPER OUTPUT CONTRACT (6 MANDATORY SECTIONS, FIXED ORDER)

Every investigation report MUST be structured with exactly the following 6 sections, in this order, output directly in the chat — do not add extra ad-hoc sections or rename these:

### 1️⃣ Section 1: Ticket Dossier (Full Ticket Citation)
- **Ticket ID & Title:** Exact ID and title.
- **Requester & Timestamps:** Author name, Created At, and current Target SLA (`TTR Due At`).
- **Full Description & Facts:** Complete problem/requirement statement and any reported reproduction steps.
- **Metadata Snapshot:** Current Type, Priority, Complexity, and Risk.

### 2️⃣ Section 2: Related Repos & Use Cases
- List every repo actually opened this session (local or via GitHub MCP), with one line on what each contains and why it's relevant.
- List the mapped use-case(s), citing the doc/spec source found via the keyword search or the shared-space fallback — not only docs that happened to be linked directly on the ticket.
- Note explicitly, as three distinct outcomes, which repos/docs/attachments were: (a) found and relevant, (b) found and checked but irrelevant (e.g. a misattached SOP file), or (c) **not found because the search was blocked by permissions** — this third case is different from "does not exist" and must say so, plus the concrete fix (see Step 2.5 above).
- If a PA-supplied repo/doc's described use-case does not match what the codebase actually implements, call this out here.

### 3️⃣ Section 3: Documentation & Spec Findings
- Log key business requirements, acceptance criteria, and architectural constraints actually read from the use-case/spec doc(s) surfaced in Section 2 (whether linked directly on the ticket, found via keyword search, or found via the shared-space fallback) and any attachments.
- If no relevant document could be opened, state clearly whether that's because a genuine search found nothing, or because the search itself was blocked by permissions — and if blocked, repeat the concrete fix from Section 2 here so the developer sees it in context.

### 4️⃣ Section 4: Codebase Investigation Log (Code Findings)
- For each related repo from Section 2, log the relevant file paths (clickable links `file:///...`), function/module signatures, and current implementation logic actually found via `grep_search` / `find_by_name` / `view_file` or GitHub MCP.
- Trace the request/data flow relevant to the ticket across repos when more than one is involved (e.g. frontend → API → payment service).

### 5️⃣ Section 5: Core Requirement Summary (Gap Analysis)
- In plain, concise language, summarize **what actually needs to be done** — the essential requirement distilled from Sections 3 and 4, not a restatement of the whole ticket.
- Contrast **Expected/Requested Behavior** (from the use-case doc/spec) vs. **Current Behavior** (from the codebase): what exists today, what's missing, and — for bug tickets — why the defect occurs.
- If Section 3 was blocked by permissions rather than a genuine absence of docs, flag that this gap analysis is based only on the ticket description plus public/standard conventions, and may need revisiting once the doc becomes accessible.
- Keep this section short enough that a developer can read it in under a minute and know exactly what problem they're solving.

### 6️⃣ Section 6: Proposed Task Breakdown & Estimation Guidance
- Split the ticket into **smaller, sequential or parallel subtasks** — do not leave it as one large undifferentiated block of work.
- For **each subtask**, provide:
  - **Tên task nhỏ:** a short, concrete title.
  - **Nội dung cần làm:** what specifically has to be implemented/changed, referencing the exact files/modules from Section 4 where applicable.
  - **Ước lượng độ phức tạp:** `Nhỏ` / `Trung bình` / `Lớn` (or a rough hour/day range if the ticket's history in this repo makes that estimable) — this is a sizing aid for the developer to do their own estimate, not a binding commitment.
  - **Phụ thuộc (nếu có):** which other subtask(s) must be done first.
- Order the subtasks logically (e.g. backend contract before frontend consumption, or investigation/config confirmation before implementation when open questions remain from Section 3).
- If Section 3/5 surfaced open questions that block implementation (e.g. "chưa rõ ngân hàng thụ hưởng", or "doc use-case chưa đọc được do quyền truy cập"), list a subtask for resolving that first rather than estimating around an assumption.

---

## 🔄 EXECUTION WORKFLOW

### Step 1: Ingest Ticket Details
1. Read ticket details from Lark Base using `lark-cli base +record-get`.
2. Extract all metadata, full description, and attached links.

### Step 2: Discover & Read Attachments, Docs (Active Search + Fallback), and Referenced Repos
Follow the **🔎 Repo & Use-Case Discovery Protocol** above — this step is not satisfied by only parsing links present in the description:
1. Collect references from description text, record attachments, and implied context.
2. Download and read every attachment found.
3. **Run the active Lark Docs/Wiki keyword search.** If it fails due to a permissions/authorization error, **run the shared-space/folder fallback** (`wiki_space_id` / `use_case_docs_folder_token` from `config.json`) before giving up. Open and read every plausible match from whichever attempt succeeds.
4. Identify all related repos — local scan first, then GitHub MCP for anything not mounted locally.
5. Per the **NO-ASSUMPTION RULE**: only cite a repo/doc/use-case once it has actually been opened; only conclude "not found" after a genuine search returned nothing; if blocked by permissions instead, report that distinctly along with the concrete fix.

### Step 3: Multi-Repo Codebase Inspection
1. For each repo identified in Step 2, search and trace source files using `grep_search`, `find_by_name`, and `view_file` (or the equivalent GitHub MCP search/read functions for repos not mounted locally).
2. Note where the current implementation diverges from, or does not yet cover, what the use-case doc describes.

### Step 4: Synthesize Dossier & Task Breakdown
1. Synthesize findings into the 6-Section Developer Output Contract above.
2. Propose the subtask breakdown with sizing/dependency notes per Section 6.
3. Output the complete dossier directly in the chat session — do not write it to a file, Base record, or Doc.
