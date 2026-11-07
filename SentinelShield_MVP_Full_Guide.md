# SentinelShield --- Complete MVP Build Guide

A step-by-step guide for building your Data Visualization Lab project
with **Python, Pandas, SQLite, FastAPI, React, TypeScript, and
Recharts**.

This guide is the single plan to follow. You do not need PostgreSQL,
Docker, a trained machine-learning model, or cloud deployment for this
MVP.

------------------------------------------------------------------------

## 1. What you are building

SentinelShield is a local fraud analytics and data visualization
application.

It takes your supplied raw dataset, profiles and cleans it with Pandas,
stores the processed data in SQLite, exposes it through FastAPI, and
displays interactive analytics in a React dashboard.

### Final architecture

``` text
Raw CSV / Excel dataset
          |
          v
Python + Pandas + NumPy
  - profiling
  - cleaning
  - transformation
  - EDA and aggregation
          |
          v
Processed data
          |
          v
SQLite database (sentinelshield.db)
          |
          v
FastAPI + SQLAlchemy REST API
          |
          v
React + TypeScript + Recharts
          |
          v
Interactive SentinelShield dashboard
```

### What the MVP includes

**Data processing** - Dataset inspection and profiling - Missing-value
and duplicate analysis - Data type correction - Data cleaning with
documented decisions - Outlier analysis without blindly deleting unusual
transactions - Feature engineering where appropriate - Exploratory data
analysis (EDA) - Data quality and processing reports

**Dashboard** - Executive fraud analytics overview - Transactions
explorer - Customer analytics, if supported by the data - Cards
portfolio, if supported by the data - Merchant ecosystem, if supported
by the data - Interactive charts, filters, KPIs, tables, and CSV export

**Not included in this MVP** - Machine-learning model training - Fraud
prediction or model inference - SHAP/model explainability - Real-time
fraud detection - Authentication or user management - Cloud deployment

------------------------------------------------------------------------

## 2. Prepare your project folder

Create a folder named `sentinelshield` and place your files inside it.

``` text
sentinelshield/
├── references/
│   └── dashboard_reference.zip
│
├── data/
│   └── raw/
│       └── your_dataset.csv
│
└── (the coding agent will create the application files)
```

Use the actual filename of your dataset. If you have multiple related
datasets, place all of them inside `data/raw/`.

Keep the original files unchanged. The preprocessing pipeline should
read from `data/raw/` and write cleaned outputs to `data/processed/`.

### Before starting

-   Confirm that the ZIP is present in `references/`.
-   Confirm that the dataset is present in `data/raw/`.
-   Make sure the coding agent can access both files.
-   Do not manually edit the raw dataset just to make it fit the
    dashboard.

------------------------------------------------------------------------

## 3. Technology choices

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Data processing         Python, Pandas, NumPy   Profile, clean,
                                                  transform, and
                                                  aggregate data

  EDA                     Matplotlib, Seaborn     Statistical exploration
                                                  and analysis charts

  Database                SQLite                  Store processed data
                                                  locally

  ORM                     SQLAlchemy              Database access from
                                                  Python

  Backend                 FastAPI, Pydantic       Provide REST APIs

  Frontend                React, TypeScript, Vite Build the dashboard

  Styling                 Tailwind CSS            Layout and visual
                                                  styling

  Dashboard charts        Recharts                Interactive charts

  Icons                   Lucide React            Interface icons
  -----------------------------------------------------------------------

**Why SQLite?** It stores the database in a local file named
`sentinelshield.db`. It does not require a separately installed database
server. Do not configure PostgreSQL or Docker for this MVP.

------------------------------------------------------------------------

## 4. Give the coding agent the project

1.  Open Antigravity.
2.  Open the `sentinelshield` folder as the project/workspace.
3.  Confirm that the reference ZIP and raw dataset are visible to the
    agent.
4.  Copy the complete master prompt in Section 5.
5.  Let the agent inspect the resources first.
6.  Review its dataset assessment before asking it to continue with
    implementation.

Do not ask the agent to invent missing fields or fill unsupported
dashboard screens with sample numbers.

------------------------------------------------------------------------

## 5. Master prompt for Antigravity

Copy everything inside the following prompt and send it to Antigravity.

------------------------------------------------------------------------

# MASTER PROMPT --- SENTINELSHIELD

## Role

Act as a senior full-stack developer, Python data analyst, data
engineer, database architect, and UI/UX designer.

Build a complete, functional MVP for my academic Data Visualization Lab
project:

**SentinelShield --- Fraud Analytics & Detection Dashboard**

I have provided: 1. A ZIP containing HTML files and PNG screenshots of
dashboard reference designs. 2. My actual raw dataset in the project
workspace.

Inspect these resources and build the application around the actual data
and supplied designs.

This is an MVP focused on data processing, data analytics, and
interactive visualization.

### Scope restrictions

-   Do not train or implement machine-learning models.
-   Do not build a fraud prediction engine.
-   Do not implement authentication or user management.
-   Do not implement cloud deployment.
-   Do not require PostgreSQL or Docker.
-   Do not build unnecessary enterprise infrastructure.
-   Focus on a working local application using the supplied data.

## A. Technology stack

Use:

-   Python, Pandas, NumPy, Matplotlib, Seaborn for data processing and
    EDA.
-   SQLite for the local database.
-   SQLAlchemy for database access.
-   FastAPI and Pydantic for REST APIs.
-   React, TypeScript, Vite, and Tailwind CSS for the frontend.
-   Recharts for interactive visualizations.
-   Lucide React for icons.

Architecture:

Raw dataset → Pandas cleaning and EDA → SQLite → FastAPI → React
dashboard.

Keep processing, database, backend, and frontend responsibilities
separate.

## B. First task: inspect the resources

Before implementing the application:

### Reference ZIP

-   Extract the entire ZIP.
-   Inspect every HTML file and PNG screenshot.
-   Inspect relevant CSS, design tokens, and supporting assets.
-   Understand the screen layouts, navigation, KPI cards, charts,
    tables, filters, colors, typography, and spacing.
-   Identify the common design system.
-   Rebuild the screens using reusable React components. Do not use
    static screenshots as the application.

### Dataset

Inspect all supplied datasets and report: - Row and column counts. -
Column names and data types. - Missing values and duplicates. - Unique
values and cardinality. - Numerical, categorical, date/time, and
identifier columns. - Potential outliers and invalid values. -
Fraud/legitimate labels, if present. - Customer, transaction, merchant,
and card identifiers, if present. - Relationships between files, but
only where verified.

Create `reports/dataset_assessment.md`. Map actual columns to dashboard
pages and identify unsupported metrics.

**Do not fabricate data or metrics. Do not assume customer, card,
merchant, geographic, or fraud-label data exists.**

## C. Python/Pandas preprocessing pipeline

Build reusable scripts for:

1.  Loading supplied CSV and Excel files.
2.  Schema and data profiling.
3.  Missing-value analysis and appropriate treatment.
4.  Duplicate detection and justified handling.
5.  Data type correction.
6.  Date/time parsing.
7.  Categorical normalization.
8.  Numerical validation.
9.  Invalid-record detection.
10. Outlier analysis.
11. Data integrity validation.
12. Feature engineering where justified.
13. EDA and statistical summaries.
14. Aggregation for dashboard analytics.

Do not blindly delete rows. Do not remove genuine high-value fraud
transactions merely because they are statistical outliers. Preserve raw
files and document every cleaning decision.

Generate: - Cleaned datasets in `data/processed/`. -
`reports/data_quality_report.json`. - A human-readable data quality
report. - `reports/eda_report.md`. - EDA chart images. - Processing
logs. - Dashboard-ready aggregates where useful.

The data quality report should include original and cleaned row counts,
duplicate counts, missing values by column, transformations, records
removed if any, and final validation results.

Make the pipeline repeatable and safe to run again.

## D. SQLite database

Use SQLite, not PostgreSQL.

Database file: `sentinelshield.db`

Use SQLAlchemy. A suitable database URL is:

`sqlite:///./sentinelshield.db`

Configure SQLite appropriately, including `check_same_thread=False`
where required.

Requirements: - Initialize tables through a script. - Load cleaned data
after preprocessing. - Use appropriate data types, keys, and indexes. -
Define relationships only when verified. - Use bulk insertion for large
datasets. - Validate inserted record counts. - Make loading safe to
repeat without unintentionally duplicating records. - Keep database
configuration modular for possible future migration.

Create database initialization and loading scripts. Only create tables
justified by the actual dataset.

## E. FastAPI backend

Build a modular FastAPI application. Retrieve actual data from SQLite
using SQLAlchemy and return structured JSON.

Implement suitable endpoints, adapting them to the actual schema:

**Dashboard** - `GET /api/dashboard/overview` -
`GET /api/dashboard/trends` - `GET /api/dashboard/distributions`

**Transactions** - `GET /api/transactions` -
`GET /api/transactions/{transaction_id}`

The transactions endpoint should support pagination, search, sorting,
fraud status, date, amount, and category filters where those columns
exist.

**Optional analytics** - `GET /api/customers/analytics` -
`GET /api/cards/analytics` - `GET /api/merchants/analytics`

Implement these only if the dataset supports them.

**Data quality** - `GET /api/data-quality`

General requirements: - Pydantic response schemas. - Proper error
handling. - Correct SQLAlchemy session management. - CORS for the local
React frontend. - Modular routers, services, models, and schemas. -
Swagger/OpenAPI documentation. - Efficient SQL aggregation or
precomputed Pandas aggregates where appropriate. - No fake API
responses.

Do not repeatedly clean or process the entire dataset whenever a
dashboard page loads.

## F. React frontend and dashboard pages

Build a professional financial analytics dashboard based on the supplied
reference designs.

Use a consistent sidebar, header, navigation, KPI cards, chart cards,
filters, and tables.

### Page 1 --- Executive Fraud Analytics Overview

Potential KPIs: - Total transactions. - Total transaction value. - Fraud
transaction count. - Legitimate transaction count. - Fraud rate. - Total
fraud loss, if calculable. - Average transaction value.

Potential charts: - Transaction volume over time. - Fraud versus
legitimate distribution. - Fraud trends over time. - Transaction amount
distribution. - Fraud by category. - Fraud by hour/day. - Geographic
analysis, if location data exists.

Include meaningful observations derived from actual data.

### Page 2 --- Transactions Explorer

Implement: - Searchable transaction table. - Pagination and sorting. -
Date, amount, fraud-status, and category filters where supported. -
Transaction detail side panel. - CSV export of filtered results. -
Transaction volume and amount charts. - Fraud distribution and category
analysis.

### Page 3 --- Customer Analytics

If customer data exists, show suitable metrics and charts, such as: -
Unique customers. - Age and demographic distributions. - Customer
transaction volume. - Average transaction value. - Customer fraud
exposure. - Customer segmentation.

Avoid unnecessary exposure of personal information.

### Page 4 --- Cards Portfolio

If card data exists, show suitable metrics and charts, such as: - Total
cards. - Card type and network distribution. - Card status. - Fraud by
card type. - Card transaction volume and exposure.

### Page 5 --- Merchant Ecosystem

If merchant data exists, show: - Unique merchants. - Merchant
transaction volume. - Fraud rate and amount, if calculable. - Fraud by
merchant category. - Top merchants by fraud count. - Merchant risk
matrix or heatmap where supported.

If a page or metric is unsupported by the data, show a clear explanation
or omit it. Do not show fabricated values.

## G. Frontend functionality

Implement: - Functional sidebar navigation. - Real FastAPI
integration. - Interactive chart tooltips. - Search, sorting, and
pagination. - Date and dropdown filters. - KPI cards. - CSV export. -
Loading, empty, and error states. - Responsive layouts.

Filters should update the relevant charts, tables, and KPIs. Avoid
hardcoded statistics or placeholder chart data. If the API fails, show
an error state rather than silently showing sample results.

## H. Design system

Brand: **SentinelShield --- Fraud Analytics & Detection**

Follow the supplied references.

Design direction: - Modern enterprise financial analytics. -
Professional light theme. - White and subtle blue-gray backgrounds. -
Blue primary accents and cyan secondary accents. - Green for
legitimate/safe indicators. - Red for fraud/critical indicators. -
Rounded cards and subtle shadows. - Clean typography and consistent
spacing. - Professional charts and tables.

Use Plus Jakarta Sans or a comparable font. Create reusable components
for the sidebar, header, KPI cards, chart cards, filters, tables, status
badges, and loading skeletons.

Do not make the interface look like a generic admin template.

## I. Suggested project structure

``` text
sentinelshield/
├── references/
├── data/
│   ├── raw/
│   └── processed/
├── preprocessing/
│   ├── load_data.py
│   ├── data_cleaning.py
│   ├── eda.py
│   ├── feature_engineering.py
│   ├── generate_aggregates.py
│   └── pipeline.py
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   └── utils/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   └── package.json
├── database/
│   ├── init_db.py
│   └── load_data.py
├── reports/
│   ├── dataset_assessment.md
│   ├── data_quality_report.json
│   └── eda_report.md
├── .env.example
└── README.md
```

Adjust this structure when justified, but keep responsibilities separate
and avoid duplicated files.

## J. Implementation sequence

Follow this order:

**Phase 1 --- Inspection** - Inspect all reference files and datasets. -
Create the dataset assessment. - Map columns to dashboard pages. -
Identify limitations and design tokens.

**Phase 2 --- Data processing** - Build and run the Pandas pipeline. -
Perform cleaning, profiling, EDA, and justified feature engineering. -
Generate reports and aggregates. - Validate the outputs.

**Phase 3 --- SQLite** - Design and initialize the database. - Load
cleaned datasets. - Create indexes. - Validate inserted records and
queries.

**Phase 4 --- FastAPI** - Build the backend and endpoints. - Test
endpoints independently. - Validate calculations against SQLite.

**Phase 5 --- Frontend** - Build the dashboard shell and all supported
pages. - Connect APIs. - Implement charts, filters, tables, and
export. - Match the supplied references.

**Phase 6 --- Integration and testing** - Verify KPI calculations. -
Test filters, pagination, search, and CSV export. - Test missing-data
and empty states. - Fix runtime errors. - Verify all pages and local run
instructions.

## K. Out of scope

Do not implement: - ML training. - Fraud prediction or inference. - SHAP
explanations. - Real-time fraud detection. - Authentication. - User
management. - Cloud deployment. - Production monitoring.

Keep the Custom Transaction Fraud Predictor reference page disabled or
label it **Coming in Phase 2**. Do not fabricate prediction results.

## L. Final deliverables

Provide: 1. Functional React frontend. 2. Python/Pandas preprocessing
pipeline. 3. Cleaned datasets. 4. EDA and data quality reports. 5.
SQLite database and initialization/loading scripts. 6. FastAPI backend
and API documentation. 7. Integrated interactive dashboard. 8.
`README.md` with exact installation and run instructions. 9.
`.env.example`. 10. A clear explanation of the Data Visualization
concepts demonstrated.

## M. Data correctness rules

-   The supplied dataset is the source of truth.
-   Never use screenshot values as analytical results.
-   Never fabricate records, metrics, labels, or predictions.
-   Do not silently discard records.
-   Validate labels before calculating fraud metrics.
-   Avoid double-counting when joining datasets.
-   Validate relationships before joining.
-   Clearly identify unavailable metrics.
-   Ensure chart totals and KPI values match the underlying filtered
    data.
-   Define the denominator used for every percentage.
-   Handle nulls and empty datasets gracefully.

## Final instruction

First inspect the reference ZIP and actual dataset. Complete the dataset
assessment and present it before implementation. Then proceed through
the specified phases.

Validate the Pandas pipeline before loading data into SQLite. Validate
SQLite before building FastAPI. Test FastAPI before integrating React.

Do not stop after planning or creating a basic landing page. Implement
the complete MVP using the actual supplied data, to the extent supported
by that data.

The final result must be a locally runnable SentinelShield Fraud
Analytics and Data Visualization application using Python/Pandas,
SQLite, FastAPI, React, TypeScript, and Recharts.

------------------------------------------------------------------------

## 6. What to do after sending the prompt

The coding agent should first inspect your files and produce a dataset
assessment.

**Your first review checkpoint is not the UI.** Check that it correctly
understands your dataset.

Review these items:

-   [ ] It found the correct raw dataset.
-   [ ] It inspected the actual column names.
-   [ ] It reported row and column counts accurately.
-   [ ] It identified missing values and duplicates.
-   [ ] It did not assume unsupported customer/card/merchant fields.
-   [ ] It mapped available columns to the dashboard pages.
-   [ ] It inspected the supplied HTML and PNG references.

If the assessment is wrong, correct the agent before it proceeds.

------------------------------------------------------------------------

## 7. Validate each implementation stage

Do not try to debug the entire application at once. Check one layer at a
time.

### Checkpoint 1 --- Pandas

Confirm that: - The raw files remain unchanged. - The cleaned output is
generated. - Cleaning decisions are documented. - The data quality
report is generated. - EDA outputs are generated. - Row counts reconcile
and removals are explained.

### Checkpoint 2 --- SQLite

Confirm that: - `sentinelshield.db` is created. - Cleaned records are
loaded. - Inserted record counts match the intended processed data. -
Tables and indexes are created. - Queries return correct values.

### Checkpoint 3 --- FastAPI

Start the API and open:

`http://127.0.0.1:8000/docs`

Confirm that: - Swagger documentation loads. - Dashboard endpoints
return real values. - Transaction filters work. - Pagination works. -
Data quality endpoint returns the processing report.

### Checkpoint 4 --- React

Confirm that: - The dashboard opens. - All supported pages are
navigable. - Charts show API data. - KPIs match the backend. - Filters
update the displayed information. - Tables, pagination, and CSV export
work. - Loading and error states are handled.

### Checkpoint 5 --- Complete application

Confirm that the entire application works locally and that the README
explains how to start it.

------------------------------------------------------------------------

## 8. Running the application locally

The agent must provide commands matching its final project structure. A
typical setup is:

### Create and activate Python environment

Windows:

``` bash
python -m venv .venv
.venv\Scripts\activate
```

### Install backend dependencies

``` bash
pip install -r backend/requirements.txt
```

### Run data preprocessing

From the project root:

``` bash
python -m preprocessing.pipeline
```

### Initialize and load SQLite

``` bash
python -m database.init_db
python -m database.load_data
```

### Start FastAPI

``` bash
uvicorn backend.app.main:app --reload
```

API documentation:

`http://127.0.0.1:8000/docs`

### Start React

Open a second terminal:

``` bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

If the agent chooses different module paths or scripts, follow the
commands in its final README instead of assuming these examples are
exact.

------------------------------------------------------------------------

## 9. Final project checklist

Before considering the MVP complete:

-   [ ] Reference screens inspected and implemented.
-   [ ] Actual dataset inspected.
-   [ ] Dataset assessment created.
-   [ ] Pandas cleaning pipeline works.
-   [ ] EDA completed.
-   [ ] Data quality report generated.
-   [ ] Cleaned dataset saved.
-   [ ] SQLite database initialized.
-   [ ] Processed records loaded correctly.
-   [ ] FastAPI endpoints tested.
-   [ ] React dashboard connected to APIs.
-   [ ] Supported dashboard pages implemented.
-   [ ] KPIs validated against real data.
-   [ ] Charts and filters work.
-   [ ] CSV export works.
-   [ ] No fake metrics or prediction results.
-   [ ] README contains working local run instructions.

------------------------------------------------------------------------

## 10. Remember the project objective

Your project is not just a fraud dashboard.

It demonstrates an end-to-end Data Visualization workflow:

**Raw data → Data profiling → Data cleaning → Data transformation → EDA
→ Statistical analysis → Database → API → Interactive visualization →
Insights.**

Keep the scope focused on this workflow.

Do not add machine learning or unnecessary features until this MVP is
working correctly.
