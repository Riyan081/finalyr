#!/usr/bin/env python3
"""
Generate a professional, beautiful PDF documentation for DigiStore Sample Calculator App.
Outputs: sample app/README.pdf
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print 'Page X of Y'."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6B7280"))
        # Header rule & title
        self.setStrokeColor(colors.HexColor("#E5E7EB"))
        self.setLineWidth(0.5)
        self.line(40, 755, 572, 755)
        self.drawString(40, 762, "DigiStore SDK — License Verification Sample App Guide")
        
        # Footer rule & page number
        self.line(40, 45, 572, 45)
        self.drawString(40, 32, "Confidential — DigiStore Software Licensing Documentation")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(572, 32, page_str)
        self.restoreState()


def build_pdf(filename: str):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=55,
        bottomMargin=55,
    )

    styles = getSampleStyleSheet()

    # Custom palette
    c_primary = colors.HexColor("#E11D48")      # DigiStore Rose/Pink
    c_dark = colors.HexColor("#0F172A")         # Slate 900
    c_body = colors.HexColor("#334155")         # Slate 700
    c_muted = colors.HexColor("#64748B")        # Slate 500
    c_card_bg = colors.HexColor("#F8FAFC")      # Slate 50
    c_card_border = colors.HexColor("#CBD5E1")  # Slate 300
    c_code_bg = colors.HexColor("#1E293B")      # Slate 800

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=c_dark,
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=c_muted,
        spaceAfter=14,
    )

    h1_style = ParagraphStyle(
        "Heading1_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=c_dark,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "Heading2_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "Body_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13.5,
        textColor=c_body,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        "Bullet_Custom",
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3,
    )

    code_style = ParagraphStyle(
        "Code_Custom",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#F1F5F9"),
        backColor=c_code_bg,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6,
    )

    box_text_style = ParagraphStyle(
        "BoxText",
        parent=body_style,
        fontSize=8.5,
        leading=12.5,
        textColor=c_dark,
    )

    story = []

    # Title block
    story.append(Paragraph("DigiStore License Verification", title_style))
    story.append(Paragraph("<b>Sample Python Tkinter Calculator Application — Developer & Testing Guide</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=0, spaceAfter=12))

    # Executive Summary Card
    summary_text = (
        "<b>Summary:</b> This sample application demonstrates end-to-end integration with the "
        "DigiStore Software Licensing API. It is packaged as a single, self-contained Python file "
        "(<code>calculator.py</code>) built with Tkinter. It demonstrates: key activation, seat limit "
        "enforcement (5/5 seats used), automatic local caching across app restarts, and an in-app "
        "<b>Reset App</b> workflow that deactivates the device seat on the server."
    )
    summary_table = Table([[Paragraph(summary_text, box_text_style)]], colWidths=[532])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FDF2F8")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#F43F5E")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 10))

    # Section 1: Key Requirements & Architecture
    story.append(Paragraph("1. Core Architectural Requirements", h1_style))
    reqs = [
        "<b>Single Python File:</b> The entire application lives inside <code>sample app/calculator.py</code> with zero external GUI dependencies (Tkinter is built into Python).",
        "<b>Gumroad-Style Drop-In Snippet:</b> Contains a self-contained <code>DigiStoreLicense</code> class highlighted with visual banners that developers can copy & paste into ANY software.",
        "<b>License Prompt on First Launch:</b> When an unactivated instance starts, the user is presented with a Software License Verification dialog.",
        "<b>Session Persistence (No Repeated Prompts):</b> Once verified, activation metadata is saved to <code>license_config.json</code>. Subsequent launches load the calculator immediately.",
        "<b>Reset App (Seat Release):</b> Clicking <b>Reset App</b> sends a deactivation request (<code>POST /api/licenses/decrement</code>) to the server, releases the seat, deletes the local cache, and returns to the license prompt.",
        "<b>5/5 Seat Limit Handling:</b> If all available activations are consumed, the app explicitly displays <b>'All keys used'</b> and blocks activation.",
    ]
    for r in reqs:
        story.append(Paragraph(f"• {r}", bullet_style))

    story.append(Spacer(1, 8))

    # Section 2: Gumroad-Style Copy-Paste Integration
    story.append(Paragraph("2. The Drop-in SDK Snippet (Copy-Paste Ready)", h1_style))
    story.append(Paragraph(
        "Just like Gumroad, protecting your own application takes only <b>3 lines of code</b> using the "
        "highlighted <code>DigiStoreLicense</code> class at the top of <code>calculator.py</code>:",
        body_style
    ))
    story.append(Paragraph(
        "# 1. Initialize licensing client<br/>"
        "lic = DigiStoreLicense(api_url=\"http://localhost:3002\")<br/><br/>"
        "# 2. Check if already activated (persisted across restarts)<br/>"
        "if lic.is_activated():<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;start_application()<br/>"
        "else:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;# 3. Prompt user and activate<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;res = lic.activate(\"DIGI-XXXX-XXXX-XXXX\")<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;if res[\"valid\"]: start_application()<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;elif res[\"all_keys_used\"]: show_error(\"All keys used!\")",
        code_style
    ))

    story.append(Spacer(1, 6))

    story.append(Spacer(1, 8))

    # Section 3: Quick Start Guide
    story.append(Paragraph("3. Quick Start Guide", h1_style))
    story.append(Paragraph("Ensure the DigiStore backend server is running, then launch the application from the terminal:", body_style))
    story.append(Paragraph("cd \"c:\\Coding\\CLG\\FY\\finalyr\\sample app\"<br/>python calculator.py", code_style))

    story.append(Paragraph("<b>Default Configuration:</b>", body_style))
    story.append(Paragraph("• <b>API Server:</b> <code>http://localhost:3002</code> (configurable directly in the activation UI)", bullet_style))
    story.append(Paragraph("• <b>License Cache:</b> <code>sample app/license_config.json</code> (created upon successful activation)", bullet_style))

    story.append(Spacer(1, 8))

    # Section 4: Step-by-Step Test Scenarios
    story.append(Paragraph("4. Step-by-Step Testing Scenarios", h1_style))

    # Scenario Table
    scenarios = [
        [
            Paragraph("<b>Scenario</b>", box_text_style),
            Paragraph("<b>Action</b>", box_text_style),
            Paragraph("<b>Expected Result</b>", box_text_style),
        ],
        [
            Paragraph("<b>1. First Launch</b>", body_style),
            Paragraph("Run <code>python calculator.py</code>", body_style),
            Paragraph("Prompts for license key. Calculator is locked.", body_style),
        ],
        [
            Paragraph("<b>2. Valid Key Activation</b>", body_style),
            Paragraph("Enter valid <code>DIGI-XXXX-XXXX-XXXX</code> and click Activate.", body_style),
            Paragraph("Calls <code>/api/licenses/verify</code>. Increments server seat count by 1. Stores <code>license_config.json</code>. Calculator opens.", body_style),
        ],
        [
            Paragraph("<b>3. App Restart (Persistence)</b>", body_style),
            Paragraph("Close window, then run <code>python calculator.py</code> again.", body_style),
            Paragraph("<b>Does NOT ask for key again.</b> Loads calculator instantly with active seat pill displayed.", body_style),
        ],
        [
            Paragraph("<b>4. Seat Limit (5/5 Used)</b>", body_style),
            Paragraph("Click <b>Reset App ↺</b> &rarr; choose <b>Simulate New Device</b>. Re-enter key until 5 activations are claimed.", body_style),
            Paragraph("Displays error: <b>'All keys used (5/5 activations reached)'</b>.", body_style),
        ],
        [
            Paragraph("<b>5. Free Seat / Reset</b>", body_style),
            Paragraph("Click <b>Reset App ↺</b> &rarr; choose <b>Release Seat on Server</b>.", body_style),
            Paragraph("Calls <code>/api/licenses/decrement</code> to free 1 seat on DigiStore, clears local config, and returns to key prompt.", body_style),
        ],
        [
            Paragraph("<b>6. Live Sync on Launch</b>", body_style),
            Paragraph("Restart app when server seats change.", body_style),
            Paragraph("Silently queries <code>incrementUses=false</code> to keep top bar keys counter in live sync.", body_style),
        ],
    ]

    t_scenarios = Table(scenarios, colWidths=[110, 190, 232])
    t_scenarios.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, c_card_border),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_scenarios)
    from reportlab.platypus import PageBreak
    story.append(PageBreak())

    # Section 5: Testing Keys Available in Your Database
    story.append(Paragraph("5. Ready-to-Test License Keys from Local Database", h1_style))
    story.append(Paragraph("The following real license keys are active in your local database for immediate testing:", body_style))

    keys_data = [
        [
            Paragraph("<b>License Key</b>", box_text_style),
            Paragraph("<b>Product Name</b>", box_text_style),
            Paragraph("<b>Initial Seats</b>", box_text_style),
            Paragraph("<b>Status</b>", box_text_style),
        ],
        [
            Paragraph("<code>DIGI-34A9-4601-6945</code>", body_style),
            Paragraph("Python Test App", body_style),
            Paragraph("1 / 5 Active", body_style),
            Paragraph("Ready to activate (4 seats free)", body_style),
        ],
        [
            Paragraph("<code>DIGI-7494-E793-DC67</code>", body_style),
            Paragraph("Python Test App", body_style),
            Paragraph("2 / 5 Active", body_style),
            Paragraph("Ready to activate (3 seats free)", body_style),
        ],
        [
            Paragraph("<code>DIGI-8D96-ABBA-74AF</code>", body_style),
            Paragraph("Bento Grid Layouts", body_style),
            Paragraph("0 / 5 Active", body_style),
            Paragraph("Fresh key (5 seats free)", body_style),
        ],
    ]
    t_keys = Table(keys_data, colWidths=[160, 160, 80, 132])
    t_keys.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, c_card_border),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_keys)
    story.append(Spacer(1, 10))

    # Section 6: API Specification
    story.append(Paragraph("6. DigiStore License API Reference", h1_style))

    story.append(Paragraph("Endpoint 1: <code>POST /api/licenses/verify</code>", h2_style))
    story.append(Paragraph("Verifies key validity and increments active seat count upon machine activation.", body_style))
    story.append(Paragraph(
        "<b>Request Body:</b><br/>"
        "<code>{\n"
        "  \"licenseKey\": \"DIGI-34A9-4601-6945\",\n"
        "  \"incrementUses\": true\n"
        "}</code>",
        code_style
    ))
    story.append(Paragraph(
        "<b>Success Response (HTTP 200):</b><br/>"
        "<code>{\n"
        "  \"success\": true,\n"
        "  \"valid\": true,\n"
        "  \"uses\": 2,\n"
        "  \"maxUses\": 5,\n"
        "  \"key\": \"DIGI-34A9-4601-6945\",\n"
        "  \"product\": { \"id\": \"...\", \"name\": \"Python Test App\" },\n"
        "  \"message\": \"License verified successfully (2/5 seats active)\"\n"
        "}</code>",
        code_style
    ))

    story.append(Paragraph(
        "<b>Limit Exceeded Response (HTTP 400 - 5/5 Seats):</b><br/>"
        "<code>{\n"
        "  \"success\": false,\n"
        "  \"valid\": false,\n"
        "  \"uses\": 5,\n"
        "  \"maxUses\": 5,\n"
        "  \"message\": \"Activation limit exceeded: 5 of 5 seats in use. Deactivate an existing device first.\"\n"
        "}</code>",
        code_style
    ))

    story.append(Paragraph("Endpoint 2: <code>POST /api/licenses/decrement</code>", h2_style))
    story.append(Paragraph("Invoked when a user uninstalls software or clicks <b>Reset App</b> to free a seat.", body_style))
    story.append(Paragraph(
        "<b>Request Body:</b><br/>"
        "<code>{ \"licenseKey\": \"DIGI-34A9-4601-6945\" }</code><br/><br/>"
        "<b>Success Response (HTTP 200):</b><br/>"
        "<code>{\n"
        "  \"success\": true,\n"
        "  \"uses\": 1,\n"
        "  \"maxUses\": 5,\n"
        "  \"message\": \"Device deactivated. Available seats: 4/5\"\n"
        "}</code>",
        code_style
    ))

    story.append(Spacer(1, 8))

    # Section 7: Local File Structure
    story.append(Paragraph("7. Local Storage Format (<code>license_config.json</code>)", h1_style))
    story.append(Paragraph(
        "Upon successful activation, <code>calculator.py</code> creates <code>license_config.json</code> in the same folder:<br/>"
        "<code>{\n"
        "  \"license_key\": \"DIGI-34A9-4601-6945\",\n"
        "  \"product_name\": \"Python Test App\",\n"
        "  \"product_id\": \"cmvi7trx70001h82k0t0rdt7j\",\n"
        "  \"uses\": 2,\n"
        "  \"max_uses\": 5,\n"
        "  \"api_url\": \"http://localhost:3002\",\n"
        "  \"activated_at\": \"2026-10-25T14:30:00Z\"\n"
        "}</code>",
        code_style
    ))
    story.append(Paragraph("When <b>Reset App</b> is clicked, this file is automatically deleted from disk.", body_style))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generated successfully at: {filename}")


if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    out_pdf = os.path.join(out_dir, "README.pdf")
    build_pdf(out_pdf)
