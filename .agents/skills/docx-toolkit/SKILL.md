---
name: docx-toolkit
description: Comprehensive toolkit to read, parse, create, format, and edit Word (.docx) documents with typography, tables, callout boxes, and Markdown-to-DOCX conversion.
origin: custom
---

# DOCX Toolkit

This skill equips the agent with complete, robust capabilities to **read, create, and edit Microsoft Word (`.docx`) documents** directly in the project environment using Python and `python-docx`.

---

## When to Use

Activate this skill when:
- Reading or extracting content, tables, and outlines from an existing `.docx` file.
- Converting Markdown documents or notes into executive-ready, polished `.docx` reports.
- Performing targeted find-and-replace in `.docx` templates without breaking formatting runs.
- Appending sections, tables, or callouts to existing `.docx` documents.
- Generating formal academic reports, technical specs, invoices, or project documentation in Word format.

---

## Bundled Helper Scripts

The skill includes three CLI scripts located in `.agents/skills/docx-toolkit/scripts/`:

### 1. `read_docx.py` — Inspect and Extract
Extracts headings, paragraphs, bullet lists, tables, and structure into clean Markdown or JSON.

```bash
# Print document as Markdown to stdout
python .agents/skills/docx-toolkit/scripts/read_docx.py path/to/document.docx

# Save extraction directly to a markdown file
python .agents/skills/docx-toolkit/scripts/read_docx.py path/to/document.docx -o extracted.md

# Inspect document structure as JSON (paragraphs, tables, styles)
python .agents/skills/docx-toolkit/scripts/read_docx.py path/to/document.docx --json
```

---

### 2. `create_docx.py` — Markdown to Polished DOCX
Converts any Markdown file into a styled `.docx` document complete with:
- Deep Navy/Cyan accent headings (`#`, `##`, `###`).
- Formatted tables with colored header rows and alternating row shading.
- Blockquote callouts (`> note`) styled with accent left borders.
- Monospace inline code (`code`) and syntax blocks.
- Bold (`**`), italic (`*`), and bullet/numbered lists.

```bash
# Generate DOCX from Markdown file
python .agents/skills/docx-toolkit/scripts/create_docx.py \
  --input report.md \
  --output final_report.docx \
  --title "Final Year Project Documentation" \
  --author "Project Team"
```

---

### 3. `edit_docx.py` — Find/Replace & Append
Performs non-destructive text replacement across runs, body paragraphs, tables, and headers/footers.

```bash
# Find and replace text in-place
python .agents/skills/docx-toolkit/scripts/edit_docx.py \
  --file document.docx \
  --replace "DRAFT" "FINAL APPROVED"

# Find and replace and save to a new file
python .agents/skills/docx-toolkit/scripts/edit_docx.py \
  --file template.docx \
  --replace "{{CUSTOMER_NAME}}" "Acme Corp" \
  --output invoice_acme.docx

# Append a heading and paragraph
python .agents/skills/docx-toolkit/scripts/edit_docx.py \
  --file document.docx \
  --heading "Appendix A" \
  --append-paragraph "Detailed metrics log."
```

---

## Direct Python Code Snippets

When complex or custom manipulations are needed, execute inline Python with `python -c` or write a quick runner script:

### A. Reading Specific Tables
```python
import docx

doc = docx.Document("document.docx")
for idx, table in enumerate(doc.tables):
    print(f"Table {idx}:")
    for row in table.rows:
        print([cell.text.strip() for cell in row.cells])
```

### B. Appending a Custom Styled Table
```python
import docx
from docx.shared import Pt, RGBColor
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

doc = docx.Document("document.docx")
table = doc.add_table(rows=3, cols=2)

headers = ["Metric", "Value"]
for col_idx, h_text in enumerate(headers):
    cell = table.cell(0, col_idx)
    cell.text = h_text
    # Add background shading to header
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="1E40AF"/>'))
    for p in cell.paragraphs:
        for r in p.runs:
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.bold = True

doc.save("document_updated.docx")
```

### C. Replacing Text Safely Across Runs
```python
def replace_in_doc(doc, old_text, new_text):
    for p in doc.paragraphs:
        if old_text in p.text:
            p.text = p.text.replace(old_text, new_text)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    if old_text in p.text:
                        p.text = p.text.replace(old_text, new_text)
```

---

## Best Practices & Style Guidelines

1. **Font Hierarchy**: Default to clean modern fonts (`Segoe UI`, `Calibri`, or `Aptos`) instead of default raw Times New Roman.
2. **Spacing**: Add explicit `space_before` and `space_after` to headings (e.g. 14pt before, 4pt after) to ensure documents look published rather than congested.
3. **Tables**:
   - Always set table alignment to `CENTER`.
   - Shade the header row (`#F1F5F9` or primary brand color).
   - Set cell padding / margins (minimum 100–140 dxa) so text does not stick to table borders.
4. **Callout Boxes**: Represent important notes or quotes as a 1x1 table with a prominent left border (`#2563EB`) and subtle background shading (`#F8FAFC`).
