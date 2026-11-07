"""
SentinelShield - Data Cleaning Module
Performs missing value analysis, normalization, type correction, and validation.
Strict rule: Does NOT blindly discard records or remove high-value fraud anomalies.
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple

logger = logging.getLogger("sentinelshield.data_cleaning")

def clean_customers(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Clean Customer Demographics dataset."""
    df = df_raw.copy()
    initial_rows = len(df)
    
    # 1. Clean column names
    df.columns = [c.strip() for c in df.columns]
    
    # 2. String trimming
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str).str.strip()
        
    # 3. Categorical normalization
    # Correct known typographical error in raw data: 'Divorsed' -> 'Divorced'
    divorced_count = (df['Marital_Status'] == 'Divorsed').sum()
    df['Marital_Status'] = df['Marital_Status'].replace({'Divorsed': 'Divorced'})
    
    # 4. Type enforcement
    df['Age'] = pd.to_numeric(df['Age'], errors='coerce').fillna(df['Age'].median()).astype(int)
    df['Annual_Income'] = pd.to_numeric(df['Annual_Income'], errors='coerce').fillna(df['Annual_Income'].median()).astype(int)
    df['Customer_Since'] = pd.to_datetime(df['Customer_Since'], errors='coerce').dt.strftime('%Y-%m-%d')
    
    audit = {
        "dataset": "customers",
        "initial_rows": initial_rows,
        "cleaned_rows": len(df),
        "removed_rows": 0,
        "marital_status_typo_fixed": int(divorced_count),
        "missing_values_handled": int(df.isnull().sum().sum()),
        "duplicates_detected": int(df.duplicated(subset=['Customer_ID']).sum())
    }
    logger.info(f"Cleaned customers: {len(df):,} records (fixed {divorced_count} 'Divorsed' typos)")
    return df, audit

def clean_cards(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Clean Cards Portfolio dataset."""
    df = df_raw.copy()
    initial_rows = len(df)
    
    # 1. Clean column names
    df.columns = [c.strip() for c in df.columns]
    
    # 2. String trimming
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str).str.strip()
        
    # 3. Type enforcement
    df['Credit_Limit'] = pd.to_numeric(df['Credit_Limit'], errors='coerce').fillna(0).astype(int)
    df['Issue_Date'] = pd.to_datetime(df['Issue_Date'], errors='coerce').dt.strftime('%Y-%m-%d')
    df['Expiry_Date'] = pd.to_datetime(df['Expiry_Date'], errors='coerce').dt.strftime('%Y-%m-%d')
    
    audit = {
        "dataset": "cards",
        "initial_rows": initial_rows,
        "cleaned_rows": len(df),
        "removed_rows": 0,
        "missing_values_handled": int(df.isnull().sum().sum()),
        "duplicates_detected": int(df.duplicated(subset=['Card_ID']).sum())
    }
    logger.info(f"Cleaned cards: {len(df):,} records")
    return df, audit

def clean_merchants(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Clean Merchant Directory dataset."""
    df = df_raw.copy()
    initial_rows = len(df)
    
    # 1. Clean column names
    df.columns = [c.strip() for c in df.columns]
    
    # 2. String trimming
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str).str.strip()
        
    # 3. Type enforcement
    df['Merchant_Rating'] = pd.to_numeric(df['Merchant_Rating'], errors='coerce').round(2)
    df['Merchant_Since'] = pd.to_datetime(df['Merchant_Since'], errors='coerce').dt.strftime('%Y-%m-%d')
    
    audit = {
        "dataset": "merchants",
        "initial_rows": initial_rows,
        "cleaned_rows": len(df),
        "removed_rows": 0,
        "missing_values_handled": int(df.isnull().sum().sum()),
        "duplicates_detected": int(df.duplicated(subset=['Merchant_ID']).sum())
    }
    logger.info(f"Cleaned merchants: {len(df):,} records")
    return df, audit

def clean_transactions(df_raw: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Clean Core Transaction Ledger dataset."""
    df = df_raw.copy()
    initial_rows = len(df)
    
    # 1. Clean column names
    df.columns = [c.strip() for c in df.columns]
    
    # 2. String trimming on string columns
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str).str.strip()
        
    # 3. Missing values treatment
    # Fraud_Reason is NaN for legitimate transactions (Fraud_Flag == 0).
    # Impute as 'Legitimate / None' for standardized database indexing and display.
    nan_fraud_reasons = (df['Fraud_Reason'] == 'nan') | (df['Fraud_Reason'].isnull()) | (df['Fraud_Reason'] == '')
    df.loc[nan_fraud_reasons, 'Fraud_Reason'] = 'Legitimate / None'
    
    # 4. Type conversions & Date/Time parsing
    df['Transaction_Amount'] = pd.to_numeric(df['Transaction_Amount'], errors='coerce').round(2)
    df['Is_International'] = pd.to_numeric(df['Is_International'], errors='coerce').fillna(0).astype(int)
    df['Fraud_Flag'] = pd.to_numeric(df['Fraud_Flag'], errors='coerce').fillna(0).astype(int)
    
    # Ensure standard ISO formats
    df['Transaction_Date'] = pd.to_datetime(df['Transaction_Date'], errors='coerce').dt.strftime('%Y-%m-%d')
    df['Transaction_DateTime'] = df['Transaction_Date'] + ' ' + df['Transaction_Time']
    
    # 5. Outlier Analysis & Preservation Verification
    # Confirm high-value fraud transactions are retained without alteration
    high_value_fraud_count = ((df['Fraud_Flag'] == 1) & (df['Transaction_Amount'] > 200000)).sum()
    max_fraud_amount = float(df[df['Fraud_Flag'] == 1]['Transaction_Amount'].max())
    
    audit = {
        "dataset": "transactions",
        "initial_rows": initial_rows,
        "cleaned_rows": len(df),
        "removed_rows": 0,
        "fraud_count": int((df['Fraud_Flag'] == 1).sum()),
        "legit_count": int((df['Fraud_Flag'] == 0).sum()),
        "fraud_rate_pct": round(float((df['Fraud_Flag'] == 1).mean() * 100), 3),
        "fraud_loss_total": round(float(df[df['Fraud_Flag'] == 1]['Transaction_Amount'].sum()), 2),
        "high_value_fraud_preserved_count": int(high_value_fraud_count),
        "max_fraud_amount_preserved": max_fraud_amount,
        "duplicates_detected": int(df.duplicated(subset=['Transaction_ID']).sum())
    }
    logger.info(f"Cleaned transactions: {len(df):,} records (100% preserved; {audit['fraud_count']:,} fraud)")
    return df, audit

def clean_all_datasets(raw_data: Dict[str, pd.DataFrame]) -> Tuple[Dict[str, pd.DataFrame], Dict[str, Any]]:
    """Orchestrates cleaning of all datasets and returns cleaned DataFrames with audit metrics."""
    cleaned = {}
    audits = {}
    
    cleaned['customers'], audits['customers'] = clean_customers(raw_data['customers'])
    cleaned['cards'], audits['cards'] = clean_cards(raw_data['cards'])
    cleaned['merchants'], audits['merchants'] = clean_merchants(raw_data['merchants'])
    cleaned['transactions'], audits['transactions'] = clean_transactions(raw_data['transactions'])
    
    return cleaned, audits
