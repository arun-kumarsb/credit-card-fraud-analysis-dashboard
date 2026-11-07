# SentinelShield — Data Quality & Integrity Report

**Pipeline Run Status:** PASSED (100% Record Preservation)  
**Execution Timestamp:** 2026-11-07T12:47:46.151909Z  
**Execution Duration:** 14.87 seconds  

---

## 1. Executive Summary & Verification Matrix

| Dataset | Raw Count | Cleaned Count | Discarded Rows | Duplicates | Missing Treated | Integrity Check |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Transactions** | 250,000 | 250,000 | **0** | 0 | 236,527 (`Fraud_Reason` imputed) | PASSED (100%) |
| **Cards** | 32,457 | 32,457 | **0** | 0 | 0 | PASSED (100%) |
| **Customers** | 25,000 | 25,000 | **0** | 0 | 0 (Fixed 2,539 typos) | PASSED (100%) |
| **Merchants** | 500 | 500 | **0** | 0 | 0 | PASSED (100%) |

---

## 2. Documented Cleaning Decisions

1. **Non-Destructive Cleaning Policy:**
   - Zero records were deleted. Every original transaction event is retained.
2. **Missing Value Imputation:**
   - In `Transaction_Data_250k.csv`, the column `Fraud_Reason` was null for 236,527 records.
   - Cross-referencing verified that all 236,527 nulls strictly corresponded to `Fraud_Flag == 0` (legitimate transactions).
   - Filled with `'Legitimate / None'` for consistent indexing and filtering.
3. **Typo Rectification:**
   - In `Cusmtomer_data.csv`, 2,539 records in column `Marital_Status` contained `'Divorsed'`.
   - Cleaned to standard `'Divorced'`.
4. **Outlier Preservation Justification:**
   - Maximum transaction amount was \$1,887,057.16. All transactions > \$200,000 were verified to be fraudulent events.
   - In accordance with financial forensic best practices, high-value outliers were **strictly preserved** to prevent under-reporting fraud losses.
5. **Referential Integrity Audit:**
   - 100% of transaction card IDs exist in Cards table.
   - 100% of card customer IDs exist in Customer table.
   - 100% of transaction merchant IDs exist in Merchant table.
   - 0 card-customer alignment mismatches.
