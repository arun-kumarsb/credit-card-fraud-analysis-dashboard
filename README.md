# SentinelShield — Fraud Analytics & Detection Dashboard

**Academic Data Visualization Lab Project**  
*An end-to-end financial forensic analytics platform built with Python, Pandas, SQLite, FastAPI, React, TypeScript, and Recharts.*

---

## 1. Project Architecture & Workflow

```
Raw CSV Datasets (data/raw/)
       │
       ▼
Python + Pandas Data Pipeline (preprocessing/)
  - Profiling & Quality Validation
  - Non-destructive Cleaning (100% Record Retention)
  - Feature Engineering (Temporal, Behavioral, Demographic Tiers)
  - Analytical Aggregations & Seaborn EDA Reports
       │
       ▼
Cleaned Datasets (data/processed/) & SQLite (sentinelshield.db)
  - Indexed Schema (46 Secondary Indexes)
  - WAL Mode & Concurrency Pragmas
  - 100% Referential Integrity (Customers, Cards, Merchants, Transactions)
       │
       ▼
FastAPI REST API (backend/)
  - Modular Routers & Pydantic Validation
  - Filterable, Paginated 250k Ledger Queries
  - CSV Streaming Endpoint
       │
       ▼
React + TypeScript + Vite + Tailwind Frontend (frontend/)
  - Vigilance Sentinel Design System
  - Interactive Recharts Visualizations
  - Multi-attribute Dynamic Filtering & Audit Drawer
```

---

## 2. Key Analytical Ground Truth Metrics

- **Total Transaction Events:** `250,000` (100% validated)
- **Total Gross Transaction Volume:** `$4,151,881,350.42` ($4.15 Billion)
- **Total Fraud Losses:** `$1,052,200,974.24` ($1.05 Billion)
- **Attack Event Rate:** `5.389%` (13,473 fraud incidents)
- **Financial Damage Rate:** `25.343%` of all capital lost to fraud
- **Outlier Asymmetry:** Average fraud transaction is **$78,097.01** (6× higher than legitimate $13,104.97)
- **Max Fraud Event:** `$1,887,057.16` (High-value fraud strictly preserved without distortion)

---

## 3. Supported Dashboard Pages

| Page | Route / Nav | Description & Features |
| :--- | :--- | :--- |
| **1. Executive Overview** | `Executive Overview` | Gross volume, fraud loss, loss share donut, 3-year timeline (2023–2026), temporal anomaly matrix, customer segment exposure, top targeted categories. |
| **2. Transactions Explorer** | `Transactions Explorer` | Filterable 250k ledger stream, search, category/rail/status filters, 8 Pareto fraud vectors, payment rail breakdown, slide-out transaction audit drawer, CSV export. |
| **3. Customer Analytics** | `Customer Analytics` | Demographic cohorts (<25 to 65+), income covariance, 12 occupations vulnerability ranking, banking relationship matrix (savings/salary), privacy compliance. |
| **4. Cards Portfolio** | `Cards Portfolio` | 32,457 cards, credit limit tiers (<$100k to >$1M), operational status (active, expired, blocked, lost), network market shares (Amex, RuPay, Visa, MC), contactless adoption. |
| **5. Merchant Ecosystem** | `Merchant Ecosystem` | 500 merchants directory, 15 MCC categories volume vs loss, risk level distribution, rating vs fraud rate correlation, top 25 at-risk merchant watchlist table. |
| **6. ML Fraud Predictor** | `ML Fraud Predictor` | **Phase 2 Scope Boundary** — Outlines proposed XGBoost / Isolation Forest inference pipeline without fabricating synthetic predictions. |
| **7. Data Quality & Audit** | `Data Quality & Audit` | Pipeline verification, typo corrections, missing-value resolutions, non-destructive cleaning audit trails, and execution benchmarks. |

---

## 4. Local Installation & Run Instructions

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ (Tested on Node.js v24)
- Git / PowerShell

### Step 1: Environment Setup & Dependencies
```powershell
# Create and activate Python virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### Step 2: Run Preprocessing Pipeline
Executes profiling, non-destructive cleaning, feature engineering, and generates reports and aggregates in `data/processed/`:
```powershell
python -m preprocessing.pipeline
```

### Step 3: Initialize and Populate SQLite Database
Loads all cleaned datasets into `sentinelshield.db` with indexed schemas and runs reconciliation:
```powershell
python -m database.init_db
python -m database.load_data --reload
```

### Step 4: Start FastAPI Backend Server
```powershell
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- API Health Status: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### Step 5: Start React Frontend
In a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```
- Open dashboard: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 5. Data Visualization Concepts Demonstrated

1. **Pareto Frequency Analysis:** Ranked distribution of 8 distinct fraud attack vectors isolating the vital few (e.g. Expired Card Attempts driving 18.3% of fraud).
2. **Temporal Anomaly Matrices:** Day-of-week × Hour-of-day attack clustering revealing pre-dawn velocity spikes (00:00–05:00).
3. **Financial Asymmetry Visualization:** Dual-ring loss share donut highlighting that 5.39% of transactions cause 25.34% of monetary damage.
4. **Covariance & Stratified Risk:** Customer income and credit limit tiering illustrating how affluent cardholders endure the majority of financial loss.
5. **Interactive Ledger Telemetry:** Server-side indexed pagination, multi-attribute filtering, and real-time CSV streaming.

---

## 6. Project Directory Map

```
CreditCardFraudAnalyticsDashboard/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point & CORS
│   │   ├── database.py          # SQLite engine & session management
│   │   ├── models/              # SQLAlchemy models (Customer, Card, Merchant, Transaction)
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── routers/             # API routers (dashboard, txns, customers, cards, merchants, data_quality)
│   │   └── services/            # Analytics queries and precomputed aggregate retrieval
│   └── requirements.txt
├── database/
│   ├── init_db.py               # Table creation & SQLite PRAGMAs
│   └── load_data.py             # Bulk data insertion & reconciliation
├── data/
│   ├── raw/                     # Original CSV files (Untouched)
│   └── processed/               # Cleaned CSVs and precomputed aggregates
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI (Sidebar, Header, KPICard, ChartCard, StatusBadge, Drawer)
│   │   ├── pages/               # 7 interactive dashboard pages
│   │   ├── services/            # Typed API client
│   │   └── types/               # TypeScript interfaces
│   ├── package.json
│   └── tailwind.config.js       # Vigilance Sentinel design tokens
├── preprocessing/
│   ├── load_data.py             # Data loading
│   ├── data_cleaning.py         # Missing-value & normalization logic
│   ├── feature_engineering.py   # Temporal & exposure features
│   ├── generate_aggregates.py   # Dashboard caching aggregates
│   ├── eda.py                   # Seaborn / Matplotlib figures
│   └── pipeline.py              # Master pipeline runner
├── reports/
│   ├── dataset_assessment.md    # Initial dataset audit
│   ├── data_quality_report.json # JSON audit report
│   ├── data_quality_report.md   # Markdown data quality report
│   ├── eda_report.md            # Statistical EDA report
│   └── eda_figures/             # 5 High-res chart PNGs
├── .env.example
└── README.md
```
