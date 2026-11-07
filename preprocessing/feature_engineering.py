"""
SentinelShield - Feature Engineering Module
Derives justified temporal, behavioral, demographic, and risk features
to power dashboard analytics, drill-downs, and exploratory data analysis.
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict

logger = logging.getLogger("sentinelshield.feature_engineering")

def engineer_customer_features(df_cust: pd.DataFrame) -> pd.DataFrame:
    """Add demographic grouping and income tier features."""
    df = df_cust.copy()
    
    # Age Groups
    bins_age = [0, 25, 35, 50, 65, 120]
    labels_age = ['<25', '25-34', '35-49', '50-64', '65+']
    df['Age_Group'] = pd.cut(df['Age'], bins=bins_age, labels=labels_age, right=False).astype(str)
    
    # Income Tiers (in INR / standard units)
    bins_income = [0, 500000, 1000000, 2500000, 5000000, float('inf')]
    labels_income = ['<500k', '500k-1M', '1M-2.5M', '2.5M-5M', '>5M']
    df['Income_Tier'] = pd.cut(df['Annual_Income'], bins=bins_income, labels=labels_income, right=False).astype(str)
    
    logger.info(f"Engineered customer features: Age_Group, Income_Tier")
    return df

def engineer_card_features(df_cards: pd.DataFrame) -> pd.DataFrame:
    """Add credit limit tier and lifecycle features."""
    df = df_cards.copy()
    
    # Credit Limit Tiers
    bins_limit = [0, 100000, 250000, 500000, 1000000, float('inf')]
    labels_limit = ['<100k', '100k-250k', '250k-500k', '500k-1M', '>1M']
    df['Credit_Limit_Tier'] = pd.cut(df['Credit_Limit'], bins=bins_limit, labels=labels_limit, right=False).astype(str)
    
    logger.info(f"Engineered card features: Credit_Limit_Tier")
    return df

def engineer_transaction_features(df_txn: pd.DataFrame, df_cards: pd.DataFrame) -> pd.DataFrame:
    """Add temporal, velocity, and exposure features to transactions."""
    df = df_txn.copy()
    
    # 1. Temporal breakdown
    dt = pd.to_datetime(df['Transaction_DateTime'])
    df['Year'] = dt.dt.year.astype(int)
    df['Month'] = dt.dt.month.astype(int)
    df['Year_Month'] = dt.dt.strftime('%Y-%m')
    df['Day_of_Week'] = dt.dt.day_name()
    df['Day_of_Week_Num'] = dt.dt.dayofweek.astype(int)
    df['Hour'] = dt.dt.hour.astype(int)
    
    # 2. Time of day categories
    def get_time_period(hour: int) -> str:
        if 0 <= hour < 6:
            return 'Late Night (00-06)'
        elif 6 <= hour < 12:
            return 'Morning (06-12)'
        elif 12 <= hour < 18:
            return 'Afternoon (12-18)'
        else:
            return 'Evening (18-24)'
            
    df['Time_Period'] = df['Hour'].apply(get_time_period)
    df['Is_Night'] = df['Hour'].apply(lambda h: 1 if h in [23, 0, 1, 2, 3, 4, 5] else 0)
    df['Is_Weekend'] = df['Day_of_Week_Num'].apply(lambda d: 1 if d in [5, 6] else 0)
    
    # 3. Behavioral / Exposure metrics
    # Map Card Credit_Limit for exposure ratio
    card_limit_map = dict(zip(df_cards['Card_ID'], df_cards['Credit_Limit']))
    df['Card_Credit_Limit'] = df['Card_ID'].map(card_limit_map).fillna(0).astype(int)
    df['Amount_to_Limit_Ratio'] = np.where(
        df['Card_Credit_Limit'] > 0,
        (df['Transaction_Amount'] / df['Card_Credit_Limit']).round(4),
        0.0
    )
    df['Is_High_Value'] = (df['Transaction_Amount'] > 50000).astype(int)
    
    logger.info(f"Engineered transaction features: Year, Month, Year_Month, Day_of_Week, Hour, Time_Period, Is_Night, Is_Weekend, Amount_to_Limit_Ratio")
    return df

def engineer_all_features(cleaned_data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
    """Applies feature engineering across all datasets."""
    enriched = {}
    enriched['customers'] = engineer_customer_features(cleaned_data['customers'])
    enriched['cards'] = engineer_card_features(cleaned_data['cards'])
    enriched['merchants'] = cleaned_data['merchants'].copy()
    enriched['transactions'] = engineer_transaction_features(cleaned_data['transactions'], enriched['cards'])
    return enriched
