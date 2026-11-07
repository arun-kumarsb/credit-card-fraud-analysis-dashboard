"""
SentinelShield - Aggregate Generator Module
Precomputes optimized, dashboard-ready aggregations and saves them
as JSON / CSV artifacts in data/processed/aggregates/ to ensure instant API responses.
"""

import os
import json
import logging
import pandas as pd
import numpy as np
from typing import Dict, Any

logger = logging.getLogger("sentinelshield.generate_aggregates")

AGGREGATES_DIR = "data/processed/aggregates"

def generate_dashboard_aggregates(enriched_data: Dict[str, pd.DataFrame]) -> Dict[str, Any]:
    """Computes all analytical summaries required by the dashboard screens."""
    os.makedirs(AGGREGATES_DIR, exist_ok=True)
    
    df_txn = enriched_data['transactions']
    df_cust = enriched_data['customers']
    df_cards = enriched_data['cards']
    df_merch = enriched_data['merchants']
    
    # 1. Executive KPI Summary
    total_txns = len(df_txn)
    total_amount = round(float(df_txn['Transaction_Amount'].sum()), 2)
    fraud_txns = int((df_txn['Fraud_Flag'] == 1).sum())
    fraud_amount = round(float(df_txn[df_txn['Fraud_Flag'] == 1]['Transaction_Amount'].sum()), 2)
    legit_txns = total_txns - fraud_txns
    legit_amount = round(total_amount - fraud_amount, 2)
    
    executive_kpis = {
        "total_transactions": total_txns,
        "total_volume_amount": total_amount,
        "fraud_transactions": fraud_txns,
        "fraud_volume_amount": fraud_amount,
        "legit_transactions": legit_txns,
        "legit_volume_amount": legit_amount,
        "fraud_rate_pct": round((fraud_txns / total_txns) * 100, 3),
        "fraud_value_rate_pct": round((fraud_amount / total_amount) * 100, 3),
        "avg_transaction_amount": round(float(df_txn['Transaction_Amount'].mean()), 2),
        "avg_fraud_amount": round(float(df_txn[df_txn['Fraud_Flag'] == 1]['Transaction_Amount'].mean()), 2),
        "avg_legit_amount": round(float(df_txn[df_txn['Fraud_Flag'] == 0]['Transaction_Amount'].mean()), 2),
        "max_fraud_amount": round(float(df_txn[df_txn['Fraud_Flag'] == 1]['Transaction_Amount'].max()), 2),
    }
    
    # 2. Monthly Trend (Gross Volume vs Fraud Loss)
    monthly = df_txn.groupby('Year_Month').agg(
        total_txns=('Transaction_ID', 'count'),
        total_amount=('Transaction_Amount', 'sum'),
        fraud_txns=('Fraud_Flag', lambda x: (x == 1).sum()),
        fraud_amount=('Transaction_Amount', lambda x: df_txn.loc[x.index][df_txn.loc[x.index, 'Fraud_Flag'] == 1]['Transaction_Amount'].sum())
    ).reset_index()
    monthly['total_amount'] = monthly['total_amount'].round(2)
    monthly['fraud_amount'] = monthly['fraud_amount'].round(2)
    monthly['fraud_rate_pct'] = (monthly['fraud_txns'] / monthly['total_txns'] * 100).round(2)
    monthly_data = monthly.to_dict(orient='records')
    
    # 3. Temporal Anomaly Heatmap (Day of Week x Hour)
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    heatmap = df_txn.groupby(['Day_of_Week', 'Hour']).agg(
        total_txns=('Transaction_ID', 'count'),
        fraud_txns=('Fraud_Flag', lambda x: (x == 1).sum()),
        total_amount=('Transaction_Amount', 'sum'),
        fraud_amount=('Transaction_Amount', lambda x: df_txn.loc[x.index][df_txn.loc[x.index, 'Fraud_Flag'] == 1]['Transaction_Amount'].sum())
    ).reset_index()
    heatmap['fraud_rate_pct'] = (heatmap['fraud_txns'] / heatmap['total_txns'] * 100).round(2)
    heatmap['fraud_amount'] = heatmap['fraud_amount'].round(2)
    heatmap_data = heatmap.to_dict(orient='records')
    
    # 4. Fraud Reasons Pareto Distribution
    reasons = df_txn[df_txn['Fraud_Flag'] == 1].groupby('Fraud_Reason').agg(
        fraud_count=('Transaction_ID', 'count'),
        fraud_amount=('Transaction_Amount', 'sum'),
        avg_amount=('Transaction_Amount', 'mean')
    ).reset_index()
    reasons['fraud_amount'] = reasons['fraud_amount'].round(2)
    reasons['avg_amount'] = reasons['avg_amount'].round(2)
    reasons['pct_of_total_fraud'] = (reasons['fraud_count'] / fraud_txns * 100).round(2)
    reasons = reasons.sort_values(by='fraud_count', ascending=False)
    reasons_data = reasons.to_dict(orient='records')
    
    # 5. Merchant Category Risk Summary
    categories = df_txn.groupby('Merchant_Category').agg(
        total_txns=('Transaction_ID', 'count'),
        total_amount=('Transaction_Amount', 'sum'),
        fraud_txns=('Fraud_Flag', lambda x: (x == 1).sum()),
        fraud_amount=('Transaction_Amount', lambda x: df_txn.loc[x.index][df_txn.loc[x.index, 'Fraud_Flag'] == 1]['Transaction_Amount'].sum())
    ).reset_index()
    categories['total_amount'] = categories['total_amount'].round(2)
    categories['fraud_amount'] = categories['fraud_amount'].round(2)
    categories['fraud_rate_pct'] = (categories['fraud_txns'] / categories['total_txns'] * 100).round(2)
    categories = categories.sort_values(by='fraud_amount', ascending=False)
    categories_data = categories.to_dict(orient='records')
    
    # 6. Customer State Density
    states = df_txn.groupby('Customer_State').agg(
        total_txns=('Transaction_ID', 'count'),
        total_amount=('Transaction_Amount', 'sum'),
        fraud_txns=('Fraud_Flag', lambda x: (x == 1).sum()),
        fraud_amount=('Transaction_Amount', lambda x: df_txn.loc[x.index][df_txn.loc[x.index, 'Fraud_Flag'] == 1]['Transaction_Amount'].sum())
    ).reset_index()
    states['total_amount'] = states['total_amount'].round(2)
    states['fraud_amount'] = states['fraud_amount'].round(2)
    states['fraud_rate_pct'] = (states['fraud_txns'] / states['total_txns'] * 100).round(2)
    states = states.sort_values(by='fraud_amount', ascending=False)
    states_data = states.to_dict(orient='records')
    
    # 7. Payment Rail Breakdown
    payment_rails = df_txn.groupby('Payment_Method').agg(
        total_txns=('Transaction_ID', 'count'),
        total_amount=('Transaction_Amount', 'sum'),
        fraud_txns=('Fraud_Flag', lambda x: (x == 1).sum()),
        fraud_amount=('Transaction_Amount', lambda x: df_txn.loc[x.index][df_txn.loc[x.index, 'Fraud_Flag'] == 1]['Transaction_Amount'].sum())
    ).reset_index()
    payment_rails['total_amount'] = payment_rails['total_amount'].round(2)
    payment_rails['fraud_amount'] = payment_rails['fraud_amount'].round(2)
    payment_rails['fraud_rate_pct'] = (payment_rails['fraud_txns'] / payment_rails['total_txns'] * 100).round(2)
    payment_rails_data = payment_rails.to_dict(orient='records')
    
    # 8. Customer Demographics Analytics (Merged Txn + Customer)
    # Join on Customer_ID to examine Age_Group, Occupation, Segment, Account_Type
    df_merged_cust = df_txn[['Customer_ID', 'Transaction_Amount', 'Fraud_Flag']].merge(
        df_cust[['Customer_ID', 'Customer_Segment', 'Age_Group', 'Income_Tier', 'Occupation', 'Account_Type', 'Marital_Status']],
        on='Customer_ID',
        how='left'
    )
    
    # Customer Segment
    segment_stats = df_merged_cust.groupby('Customer_Segment').agg(
        total_txns=('Customer_ID', 'count'),
        total_amount=('Transaction_Amount', 'sum'),
        fraud_txns=('Fraud_Flag', lambda x: (x == 1).sum()),
        fraud_amount=('Transaction_Amount', lambda x: df_merged_cust.loc[x.index][df_merged_cust.loc[x.index, 'Fraud_Flag'] == 1]['Transaction_Amount'].sum())
    ).reset_index()
    segment_stats['fraud_rate_pct'] = (segment_stats['fraud_txns'] / segment_stats['total_txns'] * 100).round(2)
    segment_stats['total_amount'] = segment_stats['total_amount'].round(2)
    segment_stats['fraud_amount'] = segment_stats['fraud_amount'].round(2)
    
    # Age Group
    age_stats = df_merged_cust.groupby('Age_Group').agg(
        total_txns=('Customer_ID', 'count'),
        total_amount=('Transaction_Amount', 'sum'),
        fraud_txns=('Fraud_Flag', lambda x: (x == 1).sum()),
        fraud_amount=('Transaction_Amount', lambda x: df_merged_cust.loc[x.index][df_merged_cust.loc[x.index, 'Fraud_Flag'] == 1]['Transaction_Amount'].sum())
    ).reset_index()
    age_stats['fraud_rate_pct'] = (age_stats['fraud_txns'] / age_stats['total_txns'] * 100).round(2)
    
    # Occupation
    occ_stats = df_merged_cust.groupby('Occupation').agg(
        total_txns=('Customer_ID', 'count'),
        total_amount=('Transaction_Amount', 'sum'),
        fraud_txns=('Fraud_Flag', lambda x: (x == 1).sum()),
        fraud_amount=('Transaction_Amount', lambda x: df_merged_cust.loc[x.index][df_merged_cust.loc[x.index, 'Fraud_Flag'] == 1]['Transaction_Amount'].sum())
    ).reset_index()
    occ_stats['fraud_rate_pct'] = (occ_stats['fraud_txns'] / occ_stats['total_txns'] * 100).round(2)
    occ_stats = occ_stats.sort_values(by='fraud_amount', ascending=False)
    
    # 9. Cards Portfolio Aggregates
    card_network = df_cards['Card_Network'].value_counts().reset_index()
    card_network.columns = ['network', 'count']
    card_network['pct'] = (card_network['count'] / len(df_cards) * 100).round(2)
    
    card_type = df_cards['Card_Type'].value_counts().reset_index()
    card_type.columns = ['tier', 'count']
    card_type['pct'] = (card_type['count'] / len(df_cards) * 100).round(2)
    
    card_status = df_cards['Card_Status'].value_counts().reset_index()
    card_status.columns = ['status', 'count']
    card_status['pct'] = (card_status['count'] / len(df_cards) * 100).round(2)
    
    # 10. Top Risky Merchants Watchlist
    merch_txn_stats = df_txn.groupby('Merchant_ID').agg(
        total_txns=('Transaction_ID', 'count'),
        total_amount=('Transaction_Amount', 'sum'),
        fraud_txns=('Fraud_Flag', lambda x: (x == 1).sum()),
        fraud_amount=('Transaction_Amount', lambda x: df_txn.loc[x.index][df_txn.loc[x.index, 'Fraud_Flag'] == 1]['Transaction_Amount'].sum())
    ).reset_index()
    
    merch_joined = df_merch.merge(merch_txn_stats, on='Merchant_ID', how='left').fillna(0)
    merch_joined['fraud_rate_pct'] = np.where(
        merch_joined['total_txns'] > 0,
        (merch_joined['fraud_txns'] / merch_joined['total_txns'] * 100).round(2),
        0.0
    )
    merch_watchlist = merch_joined.sort_values(by=['fraud_txns', 'fraud_amount'], ascending=False).head(25)
    
    # Save individual aggregate files
    all_aggregates = {
        "executive_kpis": executive_kpis,
        "monthly_trends": monthly_data,
        "heatmap": heatmap_data,
        "fraud_reasons": reasons_data,
        "categories": categories_data,
        "states": states_data,
        "payment_rails": payment_rails_data,
        "customer_segments": segment_stats.to_dict(orient='records'),
        "age_groups": age_stats.to_dict(orient='records'),
        "occupations": occ_stats.to_dict(orient='records'),
        "cards_network": card_network.to_dict(orient='records'),
        "cards_tier": card_type.to_dict(orient='records'),
        "cards_status": card_status.to_dict(orient='records'),
        "top_merchants_watchlist": merch_watchlist[[
            'Merchant_ID', 'Merchant_Name', 'Merchant_Category', 'State', 'City', 
            'Merchant_Risk_Level', 'Merchant_Rating', 'Merchant_Status',
            'total_txns', 'total_amount', 'fraud_txns', 'fraud_amount', 'fraud_rate_pct'
        ]].to_dict(orient='records')
    }
    
    for key, val in all_aggregates.items():
        out_path = os.path.join(AGGREGATES_DIR, f"{key}.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(val, f, indent=2)
            
    logger.info(f"Generated and saved {len(all_aggregates)} aggregate JSON datasets in {AGGREGATES_DIR}")
    return all_aggregates
