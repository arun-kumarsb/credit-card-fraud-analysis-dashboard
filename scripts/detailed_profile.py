import pandas as pd
import numpy as np

cards = pd.read_csv('data/raw/Cards_Data.csv')
cust = pd.read_csv('data/raw/Cusmtomer_data.csv')
merch = pd.read_csv('data/raw/merchant_table.csv')
txn = pd.read_csv('data/raw/Transaction_Data_250k.csv')

def summarize_df(name, df):
    print(f"================ {name} ================")
    print(f"Shape: {df.shape}")
    print(f"Duplicates: {df.duplicated().sum()}")
    for col in df.columns:
        nulls = df[col].isnull().sum()
        nunq = df[col].nunique()
        dtype = df[col].dtype
        val_counts = ""
        if nunq <= 15:
            val_counts = f" -> Values: {dict(df[col].value_counts(dropna=False))}"
        elif dtype in ['int64', 'float64']:
            val_counts = f" -> Min: {df[col].min()}, Max: {df[col].max()}, Mean: {df[col].mean():.2f}"
        print(f"  {col} ({dtype}): {nulls} nulls, {nunq} unique{val_counts}")
    print()

summarize_df('Cards_Data', cards)
summarize_df('Cusmtomer_data', cust)
summarize_df('merchant_table', merch)
summarize_df('Transaction_Data_250k', txn)
