import os
import json
import pandas as pd
import numpy as np

AGG_DIR = "data/processed/aggregates"
os.makedirs(AGG_DIR, exist_ok=True)

txn = pd.read_csv("data/processed/cleaned_transactions.csv", low_memory=False)
cust = pd.read_csv("data/processed/cleaned_customers.csv", low_memory=False)
cards = pd.read_csv("data/processed/cleaned_cards.csv", low_memory=False)
merch = pd.read_csv("data/processed/cleaned_merchants.csv", low_memory=False)

txn.columns = [c.lower() for c in txn.columns]
cust.columns = [c.lower() for c in cust.columns]
cards.columns = [c.lower() for c in cards.columns]
merch.columns = [c.lower() for c in merch.columns]

print("Computing additional aggregates...")

# 1. Customer Income Tier Risk
merged_cust = txn.merge(cust, on='customer_id', how='left')
income_agg = merged_cust.groupby('income_tier').agg(
    customer_count=('customer_id', 'nunique'),
    total_txns=('transaction_id', 'count'),
    total_amount=('transaction_amount', 'sum'),
    fraud_txns=('fraud_flag', lambda x: (x == 1).sum()),
    fraud_amount=('transaction_amount', lambda x: merged_cust.loc[x.index][merged_cust.loc[x.index, 'fraud_flag'] == 1]['transaction_amount'].sum())
).reset_index()
income_agg['total_amount'] = income_agg['total_amount'].round(2)
income_agg['fraud_amount'] = income_agg['fraud_amount'].round(2)
income_agg['fraud_rate_pct'] = (income_agg['fraud_txns'] / income_agg['total_txns'] * 100).round(2)
with open(f"{AGG_DIR}/income_tier_risk.json", "w") as f:
    json.dump(income_agg.to_dict(orient='records'), f, indent=2)

# 2. Account Type Matrix
acct_agg = merged_cust.groupby('account_type').agg(
    customer_count=('customer_id', 'nunique'),
    total_txns=('transaction_id', 'count'),
    total_amount=('transaction_amount', 'sum'),
    fraud_txns=('fraud_flag', lambda x: (x == 1).sum()),
    fraud_amount=('transaction_amount', lambda x: merged_cust.loc[x.index][merged_cust.loc[x.index, 'fraud_flag'] == 1]['transaction_amount'].sum())
).reset_index()
acct_agg['total_amount'] = acct_agg['total_amount'].round(2)
acct_agg['fraud_amount'] = acct_agg['fraud_amount'].round(2)
acct_agg['fraud_rate_pct'] = (acct_agg['fraud_txns'] / acct_agg['total_txns'] * 100).round(2)
with open(f"{AGG_DIR}/account_type_matrix.json", "w") as f:
    json.dump(acct_agg.to_dict(orient='records'), f, indent=2)

# 3. Marital Status Risk
marital_agg = merged_cust.groupby('marital_status').agg(
    customer_count=('customer_id', 'nunique'),
    total_txns=('transaction_id', 'count'),
    total_amount=('transaction_amount', 'sum'),
    fraud_txns=('fraud_flag', lambda x: (x == 1).sum()),
    fraud_amount=('transaction_amount', lambda x: merged_cust.loc[x.index][merged_cust.loc[x.index, 'fraud_flag'] == 1]['transaction_amount'].sum())
).reset_index()
marital_agg['total_amount'] = marital_agg['total_amount'].round(2)
marital_agg['fraud_amount'] = marital_agg['fraud_amount'].round(2)
marital_agg['fraud_rate_pct'] = (marital_agg['fraud_txns'] / marital_agg['total_txns'] * 100).round(2)
with open(f"{AGG_DIR}/marital_status_risk.json", "w") as f:
    json.dump(marital_agg.to_dict(orient='records'), f, indent=2)

# 4. Card Limit Tier Risk
merged_cards = txn.merge(cards, on='card_id', how='left')
card_tier_agg = merged_cards.groupby('credit_limit_tier').agg(
    card_count=('card_id', 'nunique'),
    total_txns=('transaction_id', 'count'),
    total_amount=('transaction_amount', 'sum'),
    fraud_txns=('fraud_flag', lambda x: (x == 1).sum()),
    fraud_amount=('transaction_amount', lambda x: merged_cards.loc[x.index][merged_cards.loc[x.index, 'fraud_flag'] == 1]['transaction_amount'].sum())
).reset_index()
card_tier_agg['total_amount'] = card_tier_agg['total_amount'].round(2)
card_tier_agg['fraud_amount'] = card_tier_agg['fraud_amount'].round(2)
card_tier_agg['fraud_rate_pct'] = (card_tier_agg['fraud_txns'] / card_tier_agg['total_txns'] * 100).round(2)
with open(f"{AGG_DIR}/card_limit_tier_risk.json", "w") as f:
    json.dump(card_tier_agg.to_dict(orient='records'), f, indent=2)

# 5. Form factor & contactless
form_agg = cards['card_mode'].value_counts().reset_index()
form_agg.columns = ['form_factor', 'count']
form_agg['pct'] = (form_agg['count'] / len(cards) * 100).round(2)
with open(f"{AGG_DIR}/cards_form_factor.json", "w") as f:
    json.dump(form_agg.to_dict(orient='records'), f, indent=2)

contactless_agg = cards['contactless'].value_counts().reset_index()
contactless_agg.columns = ['contactless', 'count']
contactless_agg['pct'] = (contactless_agg['count'] / len(cards) * 100).round(2)
with open(f"{AGG_DIR}/cards_contactless.json", "w") as f:
    json.dump(contactless_agg.to_dict(orient='records'), f, indent=2)

# 6. Merchant Rating vs Fraud
merged_merch = txn.merge(merch, on='merchant_id', how='left')
rating_agg = merged_merch.groupby('merchant_rating').agg(
    merchant_count=('merchant_id', 'nunique'),
    total_txns=('transaction_id', 'count'),
    total_amount=('transaction_amount', 'sum'),
    fraud_txns=('fraud_flag', lambda x: (x == 1).sum()),
    fraud_amount=('transaction_amount', lambda x: merged_merch.loc[x.index][merged_merch.loc[x.index, 'fraud_flag'] == 1]['transaction_amount'].sum())
).reset_index()
rating_agg['total_amount'] = rating_agg['total_amount'].round(2)
rating_agg['fraud_amount'] = rating_agg['fraud_amount'].round(2)
rating_agg['fraud_rate_pct'] = (rating_agg['fraud_txns'] / rating_agg['total_txns'] * 100).round(2)
rating_agg = rating_agg.sort_values(by='merchant_rating')
with open(f"{AGG_DIR}/merchant_rating_vs_fraud.json", "w") as f:
    json.dump(rating_agg.to_dict(orient='records'), f, indent=2)

# 7. Merchant Risk Level Distribution
risk_agg = merch.groupby('merchant_risk_level').agg(
    count=('merchant_id', 'count'),
    avg_rating=('merchant_rating', 'mean')
).reset_index()
risk_agg['avg_rating'] = risk_agg['avg_rating'].round(2)
with open(f"{AGG_DIR}/merchant_risk_distribution.json", "w") as f:
    json.dump(risk_agg.to_dict(orient='records'), f, indent=2)

print("All additional aggregates generated successfully!")
