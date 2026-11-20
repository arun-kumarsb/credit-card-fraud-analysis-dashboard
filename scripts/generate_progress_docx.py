"""
Generates the DV_Project_Week_Wise_Progress_SentinelShield.docx file
Strictly following the layout, headers, and 5-column structure of DV_Project_Week_Wise_Progress.pdf
"""

import os
import zipfile
import html

TEMPLATE_DOCX = r"N:\Projects\CreditCardFraudAnalyticsDashboard\docs\DV_lab_Detail_Report_Template.docx"
OUTPUT_DOCX = r"N:\Projects\CreditCardFraudAnalyticsDashboard\docs\DV_Project_Week_Wise_Progress_SentinelShield.docx"
DOWNLOADS_DOCX = r"C:\Users\iyurs\Downloads\DV_Project_Week_Wise_Progress_SentinelShield.docx"

# Structured Data for Weeks 1 to 10
WEEKS_DATA = [
    {
        "week": "Week 1\nIntroduction & Tool Exploration\n(Topic 1, Weeks 1–2)",
        "tool": "ChatGPT (primary)\nGemini (cross-check)",
        "prompt": [
            "Context shared: Credit card fraud analytics across 2,50,000 transactions; banking risk officers & forensic auditors audience; timeline trends, geographic maps, loss gauges, and 24×7 heatmaps needed.",
            "ChatGPT: \"Compare Dash/Plotly, Streamlit, and FastAPI + React/Tailwind for a high-performance banking fraud analytics dashboard. Score each against latency, custom SVG visuals, interactivity, and scalability.\"",
            "Gemini: Same prompt re-run to cross-check scores and find where the two AIs disagreed."
        ],
        "output": [
            "Scored matrix: Streamlit – fast prototyping, but server-side re-renders full UI on every filter click, sluggish on 250k rows; Dash – good charts but rigid styling; FastAPI + React/Tailwind – decoupled 3-tier architecture, client-side state, sub-20ms SQL aggregations, total UI control.",
            "ChatGPT recommended React + FastAPI for production speed and custom drawer forensics; Streamlit only for exploratory demos.",
            "Gemini scored FastAPI higher on async request concurrency and REST API documentation.",
            "Weekly work: studied banking fraud schema (customers, cards, merchants, transactions)."
        ],
        "justification": [
            "Added our own criteria: server-side pagination across 250k rows, composite SQL indexing, and Indian numbering system (₹, Lakhs, Crores).",
            "Rejected Streamlit: full-page reruns cause lag during forensic audits; cannot render slide-out drawer seamlessly.",
            "Planned a 30-minute hands-on trial per tool (load 250k SQLite rows, benchmark query latency and chart renders) to verify in Week 2."
        ]
    },
    {
        "week": "Week 2\nIntroduction & Tool Exploration\n(Topic 1, Weeks 1–2) – verification and final choice",
        "tool": "Claude",
        "prompt": [
            "Weekly work: ran 30-minute trial: loaded 250k transaction rows into SQLite; tested response times for date range queries and chart updates.",
            "Claude: \"Here are my trial results: SQLite + FastAPI returned aggregations in 18ms; React rendered UI without reloading. Draft a one-page Tool Selection Justification note: comparison table, verification notes and final choice with rationale.\""
        ],
        "output": [
            "Held up: FastAPI with async Uvicorn handled parallel API requests under 25ms; React 18 with Lucide & Tailwind delivered instant tab switching and smooth slide-out drawers.",
            "Differed: AI initially suggested Streamlit as the easiest path; in benchmark testing, React + Tailwind offered far superior forensic interactivity and custom SVG gauges.",
            "Draft justification note with comparison table, verification notes, and recommendation of FastAPI + SQLite + React 18 + Tailwind CSS."
        ],
        "justification": [
            "Disagreement flagged (mandatory safeguard): the AI kept Streamlit / Tableau as the easy option; we rejected them because 180° radial gauges, 24×7 heatmaps, and zero-row-loss data quality audits would not be transparent or testable there.",
            "Final choice: Python FastAPI backend + SQLite database + React 18 & TypeScript frontend + Tailwind CSS – open source, zero license costs, suited for academic lab.",
            "Rewrote the AI draft in our own words with observed trial results.",
            "Deliverable: one-page Tool Selection Justification."
        ]
    },
    {
        "week": "Week 3\nDataset Selection & Understanding\n(Topic 2, Week 3)",
        "tool": "Gemini\nChatGPT",
        "prompt": [
            "Weekly work: collected raw credit card fraud dataset (2,50,000 rows across 44 months, Jan 2023 – Aug 2026) and loaded into Pandas.",
            "Gemini: \"Profile this credit card dataset: structure, column types, missing values, class imbalance, and candidate analytical questions it could answer.\" (headers and sample rows pasted)",
            "ChatGPT: \"Brainstorm 5 candidate forensic questions for an executive fraud surveillance dashboard.\"",
            "Follow-up: asked ChatGPT to rank the five by how effectively visualizations could answer them."
        ],
        "output": [
            "Gemini profile: 2,50,000 rows × 22 columns; multi-entity structure (transactions, cards, customers, merchants); heavy class imbalance (5.39% fraud incidents, 25.34% financial loss); average fraud ₹78.1k vs legit ₹13.1k (~6× asymmetry); peak loss month in mid-2026.",
            "Five questions: Value asymmetry; off-peak attack hours; high-risk merchant categories; customer income/tier vulnerability; state-level concentration."
        ],
        "justification": [
            "Manual verification (read_csv, shape, info, isnull().sum(), duplicated().sum()): exactly 250,000 unique records; confirmed referential integrity across 25,000 customers and 32,457 cards.",
            "Enforced 100% Data Retention Policy: zero rows deleted; missing values imputed with domain fallback tags (no dropna to prevent survivor bias).",
            "Localized all financial metrics to Indian numbering (₹, Lakhs, Crores).",
            "Chosen 3 core questions: 5-to-25 value asymmetry; midnight attack surge (00:00–04:00); high-risk merchant categories."
        ]
    },
    {
        "week": "Week 4\nProject Proposal\n(Topic 3, Week 4)",
        "tool": "Claude (reviewer only)",
        "prompt": [
            "Weekly work: wrote Proposal v1 independently – aim, problem statement, objectives, tools, dataset, and planned 6 dashboard views.",
            "Claude: \"Act as a strict reviewer of this proposal. Find unclear objectives, chart-type mismatches, and scope that is too broad or too narrow. Do not rewrite it.\"",
            "Decisions log: recorded each critique, whether it was accepted or rejected, and why."
        ],
        "output": [
            "1. Separate descriptive forensic analytics from predictive machine learning.",
            "2. Add a dedicated Data Quality & Audit tab to verify zero-row-loss cleaning.",
            "3. Use a 180° radial gauge for loss ratio, a 24×7 heatmap for hours, and a dot-matrix map for geography.",
            "4. Scope is too broad to train real-time ML in Phase 1.",
            "5. Add real-time streaming data ingestion with Apache Kafka."
        ],
        "justification": [
            "Accepted 1–4: Proposal v2 created; designated ML Predictor as Phase 2 deployment; added Data Quality audit tab; selected 180° gauge, 24×7 heatmap, and Pan-India dot-matrix map.",
            "Rejected 5: Apache Kafka streaming rejected as unnecessary infrastructure overhead for an audited 250k static ledger; kept as future work.",
            "Submitted as Project Proposal artifact: Proposal v1, AI critique summary, Proposal v2, and decisions log."
        ]
    },
    {
        "week": "Week 5\nImplementation – Stage 1: Data Layer & Base Dashboard\n(Topic 4, Weeks 5–7)",
        "tool": "ChatGPT\nGemini (Antigravity IDE)",
        "prompt": [
            "Weekly work (Stage 1): built the baseline database and backend architecture.",
            "ChatGPT: \"Write an ingestion script with SQLAlchemy that creates indexed SQLite tables for transactions, cards, customers, merchants, and computes pre-aggregated KPIs.\"",
            "Gemini (Antigravity): \"Create FastAPI project structure with CORS, Pydantic v2 response schemas, and router endpoints for /api/dashboard/overview.\"",
            "Each prompt was entered in the running AI-usage log."
        ],
        "output": [
            "SQLAlchemy models with composite B-tree indexes on (transaction_datetime, fraud_flag) and (merchant_category, transaction_amount).",
            "FastAPI router returning top KPIs (gross volume, fraud loss, fraud rate, avg amounts).",
            "React skeleton with sidebar navigation and basic KPI cards.",
            "The first draft used float division without zero checks and default USD formatting ($)."
        ],
        "justification": [
            "Replaced float division with zero-division guards (total_txns > 0 ? fraud_txns / total_txns : 0).",
            "Built dedicated Indian currency formatter utility (formatCurrencyIN) displaying ₹, Lakhs, and Crores.",
            "Split code cleanly into routers, services, schemas, and models for modularity.",
            "Result: Data layer operational; aggregations benchmarked at 14ms; API returning HTTP 200; log updated."
        ]
    },
    {
        "week": "Week 6\nImplementation – Stage 2: Change Analysis & Forensic Analytics\n(Topic 4, Weeks 5–7)",
        "tool": "Claude\nGemini (Antigravity IDE)",
        "prompt": [
            "Weekly work (Stage 2): implemented core visual analytics algorithms and timeline curves.",
            "Claude: \"Write a SQL aggregation query for 24×7 temporal heatmap matrix (Day_of_Week × Hour) and 44 monthly volume vs loss trends.\"",
            "Gemini (Antigravity): \"Build React components for 3-Year Macro Volume spline with dynamic peak detection and a 180-degree semicircular loss gauge.\""
        ],
        "output": [
            "Heatmap query grouping 168 hourly cells (Day_of_Week, Hour, fraud count, total count).",
            "Recharts spline chart and custom SVG radial gauge component.",
            "Issues: Spline peak was hardcoded in first draft; tooltips displayed generic formatting."
        ],
        "justification": [
            "Dynamic peak crest: implemented mathematical max(fraud_amount) detector to place the red Elevated Threat Crest dynamically for any selected date range.",
            "Added slide-out inspection drawer for individual transactions in the ledger.",
            "Oral walkthrough checkpoint: verified that June 2026 peak (₹52.13 Cr) correctly highlights on full dataset.",
            "Usage-log entries added for this stage."
        ]
    },
    {
        "week": "Week 7\nImplementation – Stage 3: Statistics, Research Module & Testing\n(Topic 4, Weeks 5–7)",
        "tool": "ChatGPT\nClaude",
        "prompt": [
            "Weekly work (Stage 3): completed Customer Analytics, Cards Portfolio, Merchant Ecosystem, and Data Quality tabs; wrote integration tests.",
            "ChatGPT: \"Generate endpoints for customer age cohorts, income covariance, card network market share, and 15 merchant MCC categories.\"",
            "Claude: \"Write a verification suite checking mathematical consistency (gross = legit + fraud), date filtering boundary conditions, and Pydantic schema validation.\""
        ],
        "output": [
            "Endpoints for demographic risk curves, credit limit tiers, and merchant risk distributions.",
            "Test suite with 14 automated test cases covering date ranges, zero filters, and search queries.",
            "Issues: Fixed query alias mismatch in get_trends (total_txns vs total_transactions)."
        ],
        "justification": [
            "Hand-verified metrics: gross turnover ₹415.19 Cr, net fraud ₹105.22 Cr, legit ₹309.97 Cr, 13,473 fraud incidents.",
            "Validated that customer income covariance correctly captures affluent vulnerability (>₹25L accounts bear 64.2% of losses).",
            "Tests rewritten into 14 checks, all passing; CSV export functionality added.",
            "Deliverable: working multi-tab implementation, walkthrough and log entries."
        ]
    },
    {
        "week": "Week 8\nDashboard Creation – Interactive Views & First AI Critique\n(Topic 5, Weeks 8–9)",
        "tool": "Gemini (multimodal)",
        "prompt": [
            "Weekly work: connected global timeline selector and search; captured screenshots of Overview, Transactions, Customers, Cards, and Merchants.",
            "Gemini: \"Critique this credit card fraud dashboard for data-ink ratio, visual hierarchy, color accessibility, and risk clarity. List top fixes in priority order.\""
        ],
        "output": [
            "Remove heavy gridlines and redundant chart borders.",
            "Red / Green status badges are risky for color-blind users without supporting icons.",
            "Show active filter scope banner and record count when filtered.",
            "Add contextual observation cards summarizing peak attack windows and top states.",
            "Also suggested a 3-D donut chart for segment loss and extra decorative widgets."
        ],
        "justification": [
            "Accepted: lighter gridlines, card-first hierarchy, visible filter state banner, Lucide shield/alert icons next to all status badges, hover tooltips and INR units on every chart.",
            "Six views: Executive Overview, Transactions Explorer, Customer Analytics, Cards Portfolio, Merchant Ecosystem, Data Quality; global date range selector (All Time, 2023, 2024, 2025, 2026, Last 12M).",
            "Rejected: 3-D donut (distorts comparison, 2D flat donut maintained) and extra widgets (clutter)."
        ]
    },
    {
        "week": "Week 9\nDashboard Creation – Iteration, Accessibility & Final Dashboard\n(Topic 5, Weeks 8–9)",
        "tool": "Gemini (multimodal)\nClaude",
        "prompt": [
            "Weekly work: integrated Google Gemini 1.5 Flash API for live per-graph forensic intelligence; added graph purpose & output deliverables below every chart.",
            "Gemini: \"Help design a compact prompt that takes 5-8 summary metrics per chart and generates purpose, output, observation, risk vector, and countermeasure in under 120 words.\"",
            "Claude: \"Implement zero-lag deterministic fallback synthesis so the dashboard functions seamlessly even without an external API key.\""
        ],
        "output": [
            "ChartInsightBox component embedded below all graphs across the application.",
            "Backend /api/insights/generate endpoint connecting to Gemini 1.5 Flash with fallback engine.",
            "Added Gemini AI settings modal in header for user API key configuration.",
            "Suggested sending full transaction JSON dumps to Gemini."
        ],
        "justification": [
            "Strict payload optimization: rejected sending raw records or large datasets to Gemini; enforced compact synthesis of 5–8 metrics (~100 tokens per chart).",
            "Verified live reactivity: changing timeline filter immediately recalculates summary metrics and re-generates AI insights.",
            "Checked all figures: 2,50,000 transactions, ₹415.19 Cr gross, ₹105.22 Cr loss, 13,473 fraud events. Rejected live external API dependency (local engine fallback guarantee).",
            "Deliverable: final dashboard, before/after screenshots, critique log."
        ]
    },
    {
        "week": "Week 10\nFinal Project Presentation & Mock-Viva Preparation\n(Topic 6, Week 10)",
        "tool": "ChatGPT (rehearsal only)",
        "prompt": [
            "Weekly work: prepared the final presentation, Guide Defense Script, and NotebookLM sourcebook.",
            "ChatGPT: \"Here is my project summary (SentinelShield aim, 2.5L dataset, FastAPI + SQLite + React architecture, results, limitations). Ask 8–10 probing questions an evaluator might realistically ask on design choices, data limitations and alternative chart types.\"",
            "Rehearsed our answers in advance; the live presentation and viva remain unaided."
        ],
        "output": [
            "Ten questions: 1 Why FastAPI + SQLite over Streamlit? 2 Explain 5-to-25 asymmetry. 3 Why 180° semicircular gauge? 4 What does Elevated Threat Crest flag? 5 Why 100% data retention? 6 Why midnight surge (00:00–04:00)? 7 Why Platinum cards target? 8 Why travel/hotels vulnerable? 9 How sub-80ms queries achieved? 10 How will Phase 2 ML handle class imbalance?"
        ],
        "justification": [
            "Answers written from our verified project report: ₹415.19 Cr gross, ₹105.22 Cr loss (25.34%); 13,473 incidents (5.39%); avg fraud ₹78.1k vs legit ₹13.1k (~6×); June 2026 peak (₹52.13 Cr); 100% data retention (0 dropped rows).",
            "Limitations stated honestly: descriptive Phase 1 baseline; ML classification scheduled for Phase 2.",
            "Packaged deliverables: Guide_Presentation_and_Viva_Defense_Script.md and NotebookLM_Presentation_Graph_Insights.md.",
            "Deliverable: mock-viva preparation sheet and complete project portfolio."
        ]
    }
]

def make_run(text, bold=False, italic=False, font_size=16):
    rPr = f"<w:rPr><w:rFonts w:ascii=\"Arial\" w:hAnsi=\"Arial\"/><w:sz w:val=\"{font_size}\"/>"
    if bold:
        rPr += "<w:b/>"
    if italic:
        rPr += "<w:i/>"
    rPr += "</w:rPr>"
    escaped_text = html.escape(text)
    return f"<w:r>{rPr}<w:t xml:space=\"preserve\">{escaped_text}</w:t></w:r>"

def make_p(runs, align="left", space_after=60, bullet=False):
    pPr = f"<w:pPr><w:jc w:val=\"{align}\"/><w:spacing w:after=\"{space_after}\" w:line=\"240\" w:lineRule=\"auto\"/>"
    if bullet:
        pPr += "<w:ind w:left=\"240\" w:hanging=\"240\"/>"
    pPr += "</w:pPr>"
    return f"<w:p>{pPr}{''.join(runs)}</w:p>"

def make_cell(content_paragraphs, width=2000, shading=None, bold_border=False):
    tcPr = f"<w:tcPr><w:tcW w:w=\"{width}\" w:type=\"dxa\"/><w:tcMar><w:top w:w=\"100\" w:type=\"dxa\"/><w:bottom w:w=\"100\" w:type=\"dxa\"/><w:left w:w=\"120\" w:type=\"dxa\"/><w:right w:w=\"120\" w:type=\"dxa\"/></w:tcMar>"
    if shading:
        tcPr += f"<w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"{shading}\"/>"
    tcPr += "</w:tcPr>"
    return f"<w:tc>{tcPr}{''.join(content_paragraphs)}</w:tc>"

def build_document_xml():
    xml_parts = []
    xml_parts.append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
    xml_parts.append('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">')
    xml_parts.append('<w:body>')

    # Title
    xml_parts.append(make_p([make_run("DV Project Week Wise Progress", bold=True, font_size=28)], align="center", space_after=100))

    # Header Meta Info
    meta_runs_1 = [
        make_run("Project Title: ", bold=True, font_size=18),
        make_run("SentinelShield: Credit Card Fraud Analytics & Surveillance Dashboard", font_size=18)
    ]
    xml_parts.append(make_p(meta_runs_1, space_after=40))

    meta_runs_2 = [
        make_run("Group Number: ", bold=True, font_size=18),
        make_run("1", font_size=18)
    ]
    xml_parts.append(make_p(meta_runs_2, space_after=40))

    meta_runs_3 = [
        make_run("Group Members: ", bold=True, font_size=18),
        make_run("Abhishek G P, Chiranth Simha M M", font_size=18),
        make_run("                              USN: ", bold=True, font_size=18),
        make_run("4NI24IS004, 4NI24IS038", font_size=18)
    ]
    xml_parts.append(make_p(meta_runs_3, space_after=120))

    # Table Definition: 5 Columns Landscape
    # Total width ~ 15200 dxa (Page is 16838 dxa with 720 dxa margins = 15398 dxa usable)
    col_widths = [2000, 1600, 4000, 4000, 3800]

    xml_parts.append('<w:tbl>')
    xml_parts.append('<w:tblPr>')
    xml_parts.append('<w:tblW w:w="15400" w:type="dxa"/>')
    xml_parts.append('<w:tblBorders>')
    xml_parts.append('<w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>')
    xml_parts.append('<w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>')
    xml_parts.append('<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>')
    xml_parts.append('<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>')
    xml_parts.append('<w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>')
    xml_parts.append('<w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>')
    xml_parts.append('</w:tblBorders>')
    xml_parts.append('</w:tblPr>')

    # Table Grid
    xml_parts.append('<w:tblGrid>')
    for w in col_widths:
        xml_parts.append(f'<w:gridCol w:w="{w}"/>')
    xml_parts.append('</w:tblGrid>')

    # Table Header Row
    headers = [
        "Week / Topic",
        "AI Tool\nUsed",
        "Prompt (Summary)",
        "Output (Summary)",
        "Modification & Justification"
    ]
    xml_parts.append('<w:tr>')
    xml_parts.append('<w:trPr><w:tblHeader/></w:trPr>')
    for i, h in enumerate(headers):
        lines = h.split("\n")
        cell_p = [make_p([make_run(line, bold=True, font_size=16)], align="center", space_after=20) for line in lines]
        xml_parts.append(make_cell(cell_p, width=col_widths[i], shading="F2F2F2"))
    xml_parts.append('</w:tr>')

    # Data Rows (Weeks 1 to 10)
    for row in WEEKS_DATA:
        xml_parts.append('<w:tr>')

        # Col 1: Week / Topic
        w_lines = row["week"].split("\n")
        w_p = []
        for j, line in enumerate(w_lines):
            is_bold = (j == 0)
            is_italic = (j > 0 and "(" in line)
            w_p.append(make_p([make_run(line, bold=is_bold, italic=is_italic, font_size=15)], space_after=30))
        xml_parts.append(make_cell(w_p, width=col_widths[0]))

        # Col 2: AI Tool Used
        t_lines = row["tool"].split("\n")
        t_p = [make_p([make_run(line, font_size=15)], space_after=30) for line in t_lines]
        xml_parts.append(make_cell(t_p, width=col_widths[1]))

        # Col 3: Prompt (Summary)
        p_p = []
        for item in row["prompt"]:
            p_p.append(make_p([make_run("• ", bold=True, font_size=14), make_run(item, font_size=14)], space_after=40, bullet=True))
        xml_parts.append(make_cell(p_p, width=col_widths[2]))

        # Col 4: Output (Summary)
        o_p = []
        for item in row["output"]:
            o_p.append(make_p([make_run("• ", bold=True, font_size=14), make_run(item, font_size=14)], space_after=40, bullet=True))
        xml_parts.append(make_cell(o_p, width=col_widths[3]))

        # Col 5: Modification & Justification
        m_p = []
        for item in row["justification"]:
            m_p.append(make_p([make_run("• ", bold=True, font_size=14), make_run(item, font_size=14)], space_after=40, bullet=True))
        xml_parts.append(make_cell(m_p, width=col_widths[4]))

        xml_parts.append('</w:tr>')

    xml_parts.append('</w:tbl>')

    # Section Properties (A4 Landscape, 0.5 in margins)
    xml_parts.append('<w:sectPr>')
    xml_parts.append('<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>')
    xml_parts.append('<w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="720" w:footer="720" w:gutter="0"/>')
    xml_parts.append('</w:sectPr>')

    xml_parts.append('</w:body>')
    xml_parts.append('</w:document>')

    return "".join(xml_parts)

def generate_docx():
    doc_xml_str = build_document_xml()

    # Create new docx by copying template and replacing word/document.xml
    with zipfile.ZipFile(TEMPLATE_DOCX, 'r') as zin:
        with zipfile.ZipFile(OUTPUT_DOCX, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename == 'word/document.xml':
                    zout.writestr(item.filename, doc_xml_str.encode('utf-8'))
                else:
                    zout.writestr(item.filename, zin.read(item.filename))

    print(f"Generated DOCX: {OUTPUT_DOCX} ({os.path.getsize(OUTPUT_DOCX)} bytes)")

    # Also copy to Downloads folder
    try:
        import shutil
        shutil.copy2(OUTPUT_DOCX, DOWNLOADS_DOCX)
        print(f"Copied to Downloads: {DOWNLOADS_DOCX}")
    except Exception as e:
        print(f"Notice: could not copy directly to Downloads: {e}")

if __name__ == "__main__":
    generate_docx()
