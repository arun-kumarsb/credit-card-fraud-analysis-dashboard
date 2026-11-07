# SentinelShield — Dataset Assessment & Architectural Analysis

**Project:** SentinelShield — Fraud Analytics & Detection Dashboard  
**Phase:** Phase 1 — Comprehensive Inspection & Resource Analysis  
**Date:** November 2026  
**Status:** Completed & Ready for Review  

---

## 1. Executive Summary

This assessment provides an in-depth audit of the raw data files and UI/UX reference artifacts provided for the **SentinelShield Fraud Analytics & Detection Dashboard**. 

### Verified File Artifacts

| Resource Category | File Path | File Size | Description |
| :--- | :--- | :--- | :--- |
| **Raw Dataset (Txn)** | `data/raw/Transaction_Data_250k.csv` | 41.50 MB | Core transaction ledger containing 250,000 transaction events |
| **Raw Dataset (Cards)** | `data/raw/Cards_Data.csv` | 2.74 MB | Card portfolio ledger containing 32,457 card records |
| **Raw Dataset (Customers)** | `data/raw/Cusmtomer_data.csv` | 2.52 MB | Customer demographic registry containing 25,000 customers |
| **Raw Dataset (Merchants)** | `data/raw/merchant_table.csv` | 0.04 MB | Merchant directory containing 500 merchant profiles |
| **Design References** | `refrences/dashboard_reference.zip` | 2.45 MB | Archive containing HTML designs, CSS specs, and PNG screenshots |
| **Design Specifications** | `references_extracted/.../vigilance_sentinel/DESIGN.md` | 10.5 KB | Official Design System specification and token definitions |

---

## 2. In-Depth Dataset Profiling

### 2.1 Transaction Data (`Transaction_Data_250k.csv`)
- **Dimensions:** 250,000 rows × 20 columns
- **Duplicate Rows:** 0 (100% unique primary records)
- **Primary Key:** `Transaction_ID` (250,000 unique, e.g., `TXN1000001` to `TXN1250000`)
- **Date Range:** `2023-01-01` to `2026-08-18` (1,325 distinct transaction calendar dates)
- **Time Range:** `00:00:00` to `23:59:59` (81,562 distinct timestamps)

#### Column Catalog & Type Profiling

| Column Name | Inferred Type | Null Count | Null % | Unique Values | Sample Value / Distribution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Transaction_ID` | String (Identifier) | 0 | 0.00% | 250,000 | `TXN1000001` |
| `Customer_ID` | String (Foreign Key) | 0 | 0.00% | 24,902 | `CUST100660` (98 customers have 0 txns) |
| `Card_ID` | String (Foreign Key) | 0 | 0.00% | 32,292 | `CARD500875` (165 cards have 0 txns) |
| `Merchant_ID` | String (Foreign Key) | 0 | 0.00% | 500 | `MER100380` (100% of merchants active) |
| `Transaction_Date` | String (ISO Date) | 0 | 0.00% | 1,325 | `2024-03-03` |
| `Transaction_Time` | String (HH:MM:SS) | 0 | 0.00% | 81,562 | `05:50:10` |
| `Transaction_Amount` | Float64 (Currency) | 0 | 0.00% | 178,189 | Mean: \$16,607.53, Min: \$100.00, Max: \$1,887,057.16 |
| `Payment_Method` | Categorical | 0 | 0.00% | 4 | Debit Card (127k), Credit Card (88k), UPI (28k), Net Banking (6k) |
| `Transaction_Channel` | Categorical | 0 | 0.00% | 4 | POS (120k), Mobile App (65k), ATM (40k), Online Web (25k) |
| `Device_Type` | Categorical | 0 | 0.00% | 6 | POS Terminal (120k), ATM (40k), iOS (39k), Android (39k), Mac (6k), Windows (6k) |
| `Transaction_Status` | Categorical | 0 | 0.00% | 3 | Successful (227,821), Declined (12,010), Failed (10,169) |
| `Is_International` | Binary Flag (0/1) | 0 | 0.00% | 2 | Domestic: 237,428 (95.0%), International: 12,572 (5.0%) |
| `Fraud_Flag` | Binary Target (0/1) | 0 | 0.00% | 2 | Legitimate: 236,527 (94.61%), Fraud: 13,473 (5.39%) |
| `Fraud_Reason` | Categorical / Reason | 236,527 | 94.61% | 8 (non-null) | 8 distinct rules (non-null strictly matches Fraud_Flag == 1) |
| `Merchant_Risk_Level`| Categorical | 0 | 0.00% | 3 | Low (154,896), Medium (64,366), High (30,738) |
| `Merchant_Category` | Categorical (MCC) | 0 | 0.00% | 15 | Hotel, Fashion, Fuel, Travel, Airline, Hospital, etc. |
| `Customer_State` | Categorical (State) | 0 | 0.00% | 15 | 15 Indian States (Kerala, Karnataka, UP, WB, etc.) |
| `Customer_City` | Categorical (City) | 0 | 0.00% | 85 | 85 Indian Cities |
| `Merchant_State` | Categorical (State) | 0 | 0.00% | 15 | 15 Indian States |
| `Merchant_City` | Categorical (City) | 0 | 0.00% | 85 | 85 Indian Cities |

#### Fraud Vector Distribution Breakdown

| Fraud Vector / Trigger Reason | Fraud Events | % of Total Fraud | Mean Txn Amount | Total Fraud Value |
| :--- | :--- | :--- | :--- | :--- |
| **Transaction Attempt on Expired Card** | 2,470 | 18.33% | \$77,931.25 | \$192,490,192.35 |
| **High Risk Merchant Category Spike** | 1,758 | 13.05% | \$77,293.40 | \$135,881,798.11 |
| **Unusual Cross-Border / International Transaction** | 1,721 | 12.77% | \$77,159.96 | \$132,792,284.14 |
| **Unusual High Transaction Amount vs Credit Limit** | 1,707 | 12.67% | \$81,399.72 | \$138,949,328.76 |
| **Rapid Velocity & Multiple Failed Auth Attempts** | 1,702 | 12.63% | \$78,088.38 | \$132,906,423.86 |
| **Late Night Geographical & Velocity Anomaly** | 1,676 | 12.44% | \$79,271.18 | \$132,858,491.13 |
| **Transaction Attempt on Blocked Card** | 1,591 | 11.81% | \$78,924.96 | \$125,569,615.42 |
| **Transaction Attempt on Lost Card** | 848 | 6.29% | \$72,822.45 | \$61,752,840.47 |
| **TOTAL FRAUDULENT TRANSACTIONS** | **13,473** | **100.00%** | **\$78,097.01** | **\$1,052,200,974.24** |

---

### 2.2 Cards Data (`Cards_Data.csv`)
- **Dimensions:** 32,457 rows × 10 columns
- **Duplicate Rows:** 0
- **Primary Key:** `Card_ID` (32,457 unique, `CARD500001` to `CARD532457`)
- **Foreign Key:** `Customer_ID` (references `Cusmtomer_data.csv`, 100% matched)
- **Credit Limit Range:** \$50,002 to \$1,499,927 (Mean: \$444,777.54)
- **Issue Date Range:** `2018-07-20` to `2026-07-19`
- **Expiry Date Range:** `2023-07-20` to `2031-07-19`

#### Card Attributes Breakdown

| Attribute | Categories / Value Breakdown |
| :--- | :--- |
| **Card_Type** | Gold (9,973; 30.7%), Silver (9,054; 27.9%), Classic (7,348; 22.6%), Platinum (6,082; 18.7%) |
| **Card_Network** | American Express (8,276; 25.5%), RuPay (8,141; 25.1%), Visa (8,101; 25.0%), Mastercard (7,939; 24.5%) |
| **Card_Status** | Active (30,463; 93.9%), Expired (1,007; 3.1%), Blocked (646; 2.0%), Lost (341; 1.1%) |
| **Contactless** | Yes (27,632; 85.1%), No (4,825; 14.9%) |
| **Card_Mode** | Physical (26,008; 80.1%), Virtual (6,449; 19.9%) |

---

### 2.3 Customer Demographics (`Cusmtomer_data.csv`)
- **Dimensions:** 25,000 rows × 12 columns
- **Duplicate Rows:** 0
- **Primary Key:** `Customer_ID` (25,000 unique, `CUST100001` to `CUST125000` — Note typo in filename `Cusmtomer_data.csv`)
- **Age Distribution:** 18 to 70 years (Mean: 41.81 years)
- **Annual Income:** \$2 to \$9,999,931 (Mean: \$1,611,153.23)
- **Customer Tenure (`Customer_Since`):** `2016-07-19` to `2026-07-19` (10-year span)

#### Demographic Breakdown

| Demographic Dimension | Distribution Summary |
| :--- | :--- |
| **Gender** | Female (12,522; 50.1%), Male (12,478; 49.9%) |
| **Marital Status** | Married (17,671; 70.7%), Single (4,790; 19.2%), Divorsed [sic] (2,539; 10.2%) |
| **Customer Segment** | Platinum (8,347; 33.4%), Gold (8,069; 32.3%), Standard (6,189; 24.8%), Basic (2,395; 9.6%) |
| **Account Type** | Savings (11,407; 45.6%), Salary (10,503; 42.0%), Student (2,046; 8.2%), Current (1,044; 4.2%) |
| **Occupations (12)** | Data Analyst, Lawyer, Govt Employee, Teacher, Farmer, Police, Business, Nurse, CA, Student, Software Engineer, Doctor |
| **Geographic Spread** | 15 States, 85 Cities across India (balanced across major states) |

---

### 2.4 Merchant Directory (`merchant_table.csv`)
- **Dimensions:** 500 rows × 9 columns
- **Duplicate Rows:** 0
- **Primary Key:** `Merchant_ID` (`MER100001` to `MER100500`)
- **Unique Merchant Brands:** 80 unique brand names (e.g., Paytm Utilities, Coursera, Reliance Fresh, MakeMyTrip)
- **Categories:** 15 Merchant Categories (Hotel, Travel, Fuel, Fashion, Airline, Hospital, Ecommerce, etc.)
- **Risk Level:** Low (310; 62.0%), Medium (128; 25.6%), High (62; 12.4%)
- **Ratings:** 3.5 to 5.0 (Mean: 4.29)
- **Status:** Active (487; 97.4%), Inactive (13; 2.6%)
- **Merchant Since:** `2006-07-22` to `2026-07-18`

---

## 3. Relational Integrity & Cross-Table Verification

A 100% relational integrity check was executed programmatically across all datasets:

```
[Customer_data (25,000)]
         ▲
         │ (1:N, 100% matched)
 [Cards_Data (32,457)]
         ▲
         │ (1:N, 100% matched)
[Transaction_Data_250k (250,000)] ────► [merchant_table (500)]
                               (1:N, 100% matched)
```

1. **Card-to-Customer Link:** Every single `Customer_ID` in `Cards_Data.csv` exists in `Cusmtomer_data.csv` (100.00%).
2. **Transaction-to-Card Link:** Every `Card_ID` in `Transaction_Data_250k.csv` exists in `Cards_Data.csv` (100.00%).
3. **Transaction-to-Customer Link:** Every `Customer_ID` in `Transaction_Data_250k.csv` matches `Cusmtomer_data.csv` (100.00%).
4. **Card-Customer Alignment:** The `Customer_ID` on a transaction record matches the cardholder `Customer_ID` in `Cards_Data` with **0 mismatches across all 250,000 rows**.
5. **Transaction-to-Merchant Link:** Every `Merchant_ID` in transactions exists in `merchant_table.csv` (100.00%).

---

## 4. Design System & Reference Artifact Analysis

Analysis of `references_extracted/stitch_fraudlens_analytics_dashboard/` and `vigilance_sentinel/DESIGN.md`:

### 4.1 Visual Design Tokens
- **Design Philosophy:** "Vigilance Sentinel" — Surgical, fintech-grade situational awareness, high-contrast metric callouts, soft ambient elevation.
- **Palette:**
  - Background Canvas: `#FAF8FF` / `#F8FAFC`
  - Card Containers: `#FFFFFF` with 1px border `#E2E8F0` / `#DAE2FD`
  - Primary Accent: `#004AC6` / `#2563EB` (Electric Blue)
  - Secondary Accent: `#00668A` / `#38BDF8` (Sky Blue)
  - Safe / Legitimate / Success: `#006242` / `#10B981` (Emerald Green)
  - Fraud / High Risk / Alert: `#BA1A1A` / `#EF4444` (Crimson Red)
  - Dark Headings / Text: `#131B2E` / `#0F172A`
  - Body & Secondary Text: `#434655` / `#334155`
  - Subtle Borders: `#E2E8F0` / `#C3C6D7`
- **Typography:** Plus Jakarta Sans (400, 500, 600, 700) with tabular numeric displays (`tabular-nums`) for jitter-free data updates.
- **Elevation:** Rounded cards (`rounded-2xl` / `16px`), soft multi-stop box shadows (`0 4px 20px -2px rgba(15,23,42,0.04)`).

---

## 5. Column-to-Dashboard Mapping

### Page 1: Executive Fraud Analytics Overview
*Reference: `executive_fraud_analytics_overview/code.html` & `screen.png`*

| Reference UI Component | Data Source & Underlying Column | Status |
| :--- | :--- | :--- |
| **Gross Volume Metric** | `Transaction_Data_250k.Transaction_Amount.sum()` (\$4.15B) | Supported |
| **Fraud Loss Metric** | `Transaction_Data_250k[Fraud_Flag==1].Transaction_Amount.sum()` (\$1.05B) | Supported |
| **Overall Fraud Rate** | `Fraud_Flag.mean() * 100` (5.39% by count, 25.34% by value) | Supported |
| **High-Risk Flags Count** | `count(Fraud_Flag == 1)` (13,473 transactions) | Supported |
| **Fraud Loss Share Gauge** | Ratio: \$1.05B (25.34%) Fraud vs \$3.10B (74.66%) Legit | Supported |
| **3-Year Volume vs Loss Trend** | `Transaction_Date` aggregated monthly (2023–2026) vs Amount | Supported |
| **Temporal Anomaly Heatmap** | `Transaction_Time` (Hour 0-23) × `Transaction_Date` (Day of Week) | Supported |
| **Customer Segment Exposure** | Join Txn on Customer: `Customer_Segment` (Platinum, Gold, Standard, Basic) | Supported |
| **State Fraud Density** | `Customer_State` / `Merchant_State` aggregation vs Fraud Volume & Loss | Supported |

### Page 2: Transactions Explorer (250k Ledger Stream)
*Reference: `transactions_explorer_250k_ledger_stream/code.html` & `screen.png`*

| Reference UI Component | Data Source & Underlying Column | Status |
| :--- | :--- | :--- |
| **KPI Strip** | 250,000 Total, 13,473 Flagged, \$1.05B Fraud Volume, \$16.6k Avg Txn | Supported |
| **Fraud Vector Pareto Analysis** | Group by `Fraud_Reason` (8 distinct reasons) count & amount | Supported |
| **Payment Rail Breakdown** | Group by `Payment_Method` (Debit, Credit, UPI, Net Banking) | Supported |
| **Ledger Table** | `Transaction_ID`, `Transaction_Date`, `Transaction_Time`, `Customer_ID`, `Card_ID`, `Merchant_Category`, `Transaction_Amount`, `Fraud_Flag`, `Fraud_Reason` | Supported |
| **Filters & Search** | Full-text ID search, Date Range, Category filter, Fraud Status filter, Min/Max Amount | Supported |
| **Transaction Detail Drawer** | Complete 20-field detail for selected transaction | Supported |
| **CSV Export** | Client-side / API filtered record stream export | Supported |

### Page 3: Customer Demographics & Portfolio
*Reference: `customer_demographics_portfolio_25_000_customers/code.html` & `screen.png`*

| Reference UI Component | Data Source & Underlying Column | Status |
| :--- | :--- | :--- |
| **Customer KPIs** | 25,000 Customers, \$1.61M Avg Income, High Risk Demographics, Segments | Supported |
| **Age Demographics** | `Age` cohorts (<25, 26-35, 36-50, 51-65, 65+) vs Fraud Exposure | Supported |
| **Income vs Loss Covariance** | `Annual_Income` tiers vs Total Fraud Loss | Supported |
| **Targeted Occupations** | 12 Occupations (Police, CA, Software Eng, etc.) vs Fraud Incident Rate | Supported |
| **Banking Relationship Matrix** | `Account_Type` (Savings, Salary, Student, Current) vs Fraud Rate & Loss | Supported |
| **Marital Status & Household Risk**| `Marital_Status` (Married, Single, Divorced) vs Fraud Exposure | Supported |

### Page 4: Cards Portfolio & Lifecycle
*Reference: `cards_portfolio_lifecycle_32_457_cards/code.html` & `screen.png`*

| Reference UI Component | Data Source & Underlying Column | Status |
| :--- | :--- | :--- |
| **Cards KPIs** | 32,457 Cards, \$14.44B Total Credit Limit, \$444.8k Avg Limit, 93.9% Active | Supported |
| **Credit Limit Distribution** | `Credit_Limit` tiers (<100k, 100k-250k, 250k-500k, 500k-1M, >1M) | Supported |
| **Card Operational Status** | `Card_Status` (Active: 30,463; Expired: 1,007; Blocked: 646; Lost: 341) | Supported |
| **Network Share & Fraud Ratio** | `Card_Network` (Amex, RuPay, Visa, Mastercard) vs Fraud Rate | Supported |
| **Form Factor & Contactless** | `Card_Mode` (Physical vs Virtual) & `Contactless` (Yes vs No) | Supported |

### Page 5: Merchant Ecosystem & Risk Matrix
*Reference: `merchant_ecosystem_risk_matrix_500_merchants/code.html`*

| Reference UI Component | Data Source & Underlying Column | Status |
| :--- | :--- | :--- |
| **Merchant KPIs** | 500 Merchants, 62 High-Risk, 4.29 Avg Rating, 15 Categories | Supported |
| **Merchant Risk Exposure** | `Merchant_Risk_Level` (Low: 310, Medium: 128, High: 62) | Supported |
| **15 Categories: Volume vs Fraud** | Group by `Merchant_Category` vs Volume & Fraud Loss | Supported |
| **Merchant Rating vs Fraud Rate** | Scatter plot of `Merchant_Rating` vs calculated Fraud Rate | Supported |
| **Top At-Risk Merchant Watchlist**| Ranked table of top merchants by fraud count and risk rate | Supported |

### Page 6: Custom Transaction Fraud Predictor (ML Inference)
*Reference: `custom_transaction_fraud_predictor_ml_model_inference/code.html`*

| Component / Feature | Project Policy / Handling Strategy |
| :--- | :--- |
| **ML Inference & Prediction Engine** | **OUT OF SCOPE** as strictly instructed in lab requirements |
| **SHAP Feature Importance Graphs** | **OUT OF SCOPE** (No fake/fabricated machine learning) |
| **UI Implementation** | Dedicated placeholder screen clearly marked **"Predictive Engine — Coming in Phase 2"**, explaining the architectural boundary between historical analytics and future model inference. |

---

## 6. Key Data Quality Findings & Cleaning Directives

1. **Missing Values:**
   - Only `Fraud_Reason` contains nulls (236,527 nulls; 94.61%). This is expected and structurally valid because legitimate transactions (`Fraud_Flag == 0`) do not have a fraud reason.
   - For presentation and database indexing, `Fraud_Reason` should be imputed as `'None'` or `'Legitimate'` for non-fraud records.
2. **Spelling Anomalies:**
   - In `Cusmtomer_data.csv`, `Marital_Status` includes the value `'Divorsed'`. The cleaning pipeline will normalize this to `'Divorced'`.
   - The file name itself has a typo (`Cusmtomer_data.csv`). The pipeline will gracefully load this filename while standardizing the entity to `customers`.
3. **Extreme Low Incomes:**
   - `Annual_Income` has values as low as \$2. These will be profiled as potential data anomalies or test artifacts and handled cleanly in visualizations without deleting records.
4. **Outlier Policy:**
   - High transaction amounts in `Transaction_Amount` (up to \$1,887,057.16) are predominantly fraudulent events (Mean fraud amount is \$78,097 vs \$13,104 for legitimate).
   - **Crucial Rule:** Statistical outliers among fraudulent records represent real fraud loss and **must not be trimmed or deleted**.
5. **Date Normalization:**
   - `Transaction_Date` (`YYYY-MM-DD`) and `Transaction_Time` (`HH:MM:SS`) will be parsed into ISO datetime timestamps and supplemented with engineered temporal features (`Hour`, `Day_of_Week`, `Month`, `Year_Month`).

---

## 7. Recommended Technical Architecture

```
                    ┌────────────────────────┐
                    │ Raw CSV Data (4 Files) │
                    └───────────┬────────────┘
                                │
                                ▼
            ┌────────────────────────────────────────┐
            │      Phase 2: Preprocessing Pipeline   │
            │  (Pandas profiling, cleaning, EDA,     │
            │   feature engineering, aggregates)     │
            └───────────────────┬────────────────────┘
                                │
                                ▼
            ┌────────────────────────────────────────┐
            │   Phase 3: SQLite (sentinelshield.db)  │
            │  (Indexed tables, precomputed views,   │
            │   SQLAlchemy models & migrations)      │
            └───────────────────┬────────────────────┘
                                │
                                ▼
            ┌────────────────────────────────────────┐
            │       Phase 4: FastAPI REST API        │
            │  (Pydantic schemas, modular routers,   │
            │   filtering, pagination, CSV stream)   │
            └───────────────────┬────────────────────┘
                                │
                                ▼
            ┌────────────────────────────────────────┐
            │   Phase 5: React + TypeScript UI       │
            │  (Vite, Tailwind, Recharts, Lucide)    │
            └────────────────────────────────────────┘
```

---

## 8. Verification Checklist

- [x] Identified and accessed all 4 raw datasets in `data/raw/`.
- [x] Accurately cataloged row counts, column types, and cardinalities.
- [x] Verified 100% referential integrity across Customer, Card, Merchant, and Transaction tables.
- [x] Analyzed fraud label counts (13,473 fraud, 236,527 legit) and 8 fraud vectors.
- [x] Inspected all HTML and PNG reference designs in `references_extracted/`.
- [x] Extracted design tokens and typography rules from `DESIGN.md`.
- [x] Mapped every dataset column to corresponding dashboard screens.
- [x] Verified out-of-scope boundaries (no fake ML, no Docker/Postgres).
- [x] Generated `reports/dataset_assessment.md`.
