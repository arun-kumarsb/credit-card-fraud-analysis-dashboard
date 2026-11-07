import pandas as pd
import numpy as np

cards = pd.read_csv('data/raw/Cards_Data.csv')
cust = pd.read_csv('data/raw/Cusmtomer_data.csv')
merch = pd.read_csv('data/raw/merchant_table.csv')
txn = pd.read_csv('data/raw/Transaction_Data_250k.csv')

print('=== Referential Integrity ===')
cards_in_cust = cards['Customer_ID'].isin(cust['Customer_ID'])
print(f"Cards Customer_ID in Cust: {cards_in_cust.all()} ({cards_in_cust.mean()*100:.2f}%)")

txn_card_in_cards = txn['Card_ID'].isin(cards['Card_ID'])
print(f"Txn Card_ID in Cards: {txn_card_in_cards.all()} ({txn_card_in_cards.mean()*100:.2f}%)")

txn_cust_in_cust = txn['Customer_ID'].isin(cust['Customer_ID'])
print(f"Txn Customer_ID in Cust: {txn_cust_in_cust.all()} ({txn_cust_in_cust.mean()*100:.2f}%)")

txn_merch_in_merch = txn['Merchant_ID'].isin(merch['Merchant_ID'])
print(f"Txn Merchant_ID in Merch: {txn_merch_in_merch.all()} ({txn_merch_in_merch.mean()*100:.2f}%)")

card_cust_map = dict(zip(cards['Card_ID'], cards['Customer_ID']))
txn_card_cust = txn['Card_ID'].map(card_cust_map)
mismatch = (txn_card_cust != txn['Customer_ID']).sum()
print(f"Txn Card-Customer alignment mismatch: {mismatch:,} rows")

print('\n=== Fraud Flag vs Fraud Reason ===')
print('Fraud_Flag value counts:')
print(txn['Fraud_Flag'].value_counts())
print(f"Fraud Rate: {(txn['Fraud_Flag'].mean()*100):.3f}%")
print('\nFraud_Reason non-null count:', txn['Fraud_Reason'].notnull().sum())
mismatches = ((txn['Fraud_Flag'] == 1) != txn['Fraud_Reason'].notnull()).sum()
print(f"Mismatch between Fraud_Flag==1 and Fraud_Reason.notnull(): {mismatches}")
print('\nFraud_Reason distribution:')
print(txn['Fraud_Reason'].value_counts(dropna=False))

print('\n=== Date Ranges ===')
print('Txn Date:', txn['Transaction_Date'].min(), 'to', txn['Transaction_Date'].max())
print('Cust Since:', cust['Customer_Since'].min(), 'to', cust['Customer_Since'].max())
print('Cards Issue:', cards['Issue_Date'].min(), 'to', cards['Issue_Date'].max())
print('Cards Expiry:', cards['Expiry_Date'].min(), 'to', cards['Expiry_Date'].max())
print('Merch Since:', merch['Merchant_Since'].min(), 'to', merch['Merchant_Since'].max())

print('\n=== Transaction Amount Stats (All) ===')
print(txn['Transaction_Amount'].describe().apply(lambda x: f"{x:,.2f}"))

print('\n=== Fraud Transaction Amount Stats ===')
print(txn[txn['Fraud_Flag']==1]['Transaction_Amount'].describe().apply(lambda x: f"{x:,.2f}"))

print('\n=== Legitimate Transaction Amount Stats ===')
print(txn[txn['Fraud_Flag']==0]['Transaction_Amount'].describe().apply(lambda x: f"{x:,.2f}"))

print('\n=== Total Volume and Amounts ===')
total_vol = len(txn)
total_amt = txn['Transaction_Amount'].sum()
fraud_vol = (txn['Fraud_Flag'] == 1).sum()
fraud_amt = txn[txn['Fraud_Flag'] == 1]['Transaction_Amount'].sum()
legit_vol = (txn['Fraud_Flag'] == 0).sum()
legit_amt = txn[txn['Fraud_Flag'] == 0]['Transaction_Amount'].sum()

print(f"Total Transactions: {total_vol:,}")
print(f"Total Amount: ${total_amt:,.2f}")
print(f"Fraud Transactions: {fraud_vol:,} ({(fraud_vol/total_vol)*100:.3f}%)")
print(f"Fraud Amount: ${fraud_amt:,.2f} ({(fraud_amt/total_amt)*100:.3f}%)")
print(f"Legit Transactions: {legit_vol:,} ({(legit_vol/total_vol)*100:.3f}%)")
print(f"Legit Amount: ${legit_amt:,.2f} ({(legit_amt/total_amt)*100:.3f}%)")
