"""
SentinelShield - Data Loading Script
Loads cleaned datasets from data/processed/ into SQLite (sentinelshield.db)
using optimized bulk streaming and validating record counts and financial reconciliation.
Safe to run repeatedly.
"""

import os
import sys
import time
import logging
import pandas as pd
from sqlalchemy import text
from backend.app.database import engine
from database.init_db import init_db

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger("sentinelshield.load_data")

PROCESSED_FILES = {
    "customers": ("data/processed/cleaned_customers.csv", "customers", 25000),
    "cards": ("data/processed/cleaned_cards.csv", "cards", 32457),
    "merchants": ("data/processed/cleaned_merchants.csv", "merchants", 500),
    "transactions": ("data/processed/cleaned_transactions.csv", "transactions", 250000),
}

def load_data(reload_all: bool = False):
    """Loads all cleaned datasets into SQLite with bulk insertion and reconciliation."""
    start_time = time.time()
    
    # 1. Initialize tables if not exist
    init_db(drop_existing=False)
    
    with engine.begin() as conn:
        # Check existing transaction count
        existing_txns = conn.execute(text("SELECT COUNT(*) FROM transactions;")).scalar()
        if existing_txns > 0 and not reload_all:
            logger.info(f"Database already populated ({existing_txns:,} transactions found).")
            logger.info("Use --reload to wipe and re-load data.")
            return

        if reload_all and existing_txns > 0:
            logger.warning("Wiping existing records for reload...")
            conn.execute(text("DELETE FROM transactions;"))
            conn.execute(text("DELETE FROM cards;"))
            conn.execute(text("DELETE FROM merchants;"))
            conn.execute(text("DELETE FROM customers;"))
            logger.info("Existing records cleared.")

        # 2. Insert tables in foreign-key dependency order
        load_order = ["customers", "cards", "merchants", "transactions"]
        
        for entity in load_order:
            filepath, table_name, expected_count = PROCESSED_FILES[entity]
            if not os.path.exists(filepath):
                raise FileNotFoundError(f"Cleaned dataset not found: {filepath}. Run preprocessing pipeline first!")

            logger.info(f"Loading {entity} from {filepath} into table '{table_name}'...")
            df = pd.read_csv(filepath, low_memory=False)
            
            # Standardize column names to lower_case matching model attributes
            df.columns = [c.lower() for c in df.columns]

            # method=None uses executemany under the hood, perfectly avoiding SQLite variable limits
            df.to_sql(
                table_name,
                con=conn,
                if_exists="append",
                index=False,
                chunksize=10000,
                method=None
            )
            logger.info(f"Loaded {len(df):,} records into '{table_name}'.")

    # 3. Post-load validation and reconciliation
    logger.info("================================================================================")
    logger.info("Running Database Integrity & Financial Reconciliation Queries...")
    logger.info("================================================================================")

    with engine.connect() as conn:
        for entity in load_order:
            _, table_name, expected_count = PROCESSED_FILES[entity]
            actual_count = conn.execute(text(f"SELECT COUNT(*) FROM {table_name};")).scalar()
            status = "PASSED" if actual_count == expected_count else "FAILED"
            logger.info(f"Table '{table_name}': {actual_count:,} / {expected_count:,} records [{status}]")
            assert actual_count == expected_count, f"Row count mismatch in {table_name}!"

        # Financial reconciliation
        recon_sql = text("""
            SELECT 
                COUNT(*) as total_txns,
                ROUND(SUM(transaction_amount), 2) as total_volume,
                SUM(CASE WHEN fraud_flag = 1 THEN 1 ELSE 0 END) as fraud_count,
                ROUND(SUM(CASE WHEN fraud_flag = 1 THEN transaction_amount ELSE 0 END), 2) as fraud_loss,
                ROUND(AVG(transaction_amount), 2) as avg_amount
            FROM transactions;
        """)
        row = conn.execute(recon_sql).mappings().one()
        logger.info(f"Reconciled Metrics from SQLite:")
        logger.info(f"  - Total Transactions: {row['total_txns']:,}")
        logger.info(f"  - Total Gross Volume: ${row['total_volume']:,.2f}")
        logger.info(f"  - Fraud Transactions: {row['fraud_count']:,} ({row['fraud_count']/row['total_txns']*100:.3f}%)")
        logger.info(f"  - Total Fraud Loss:   ${row['fraud_loss']:,.2f} ({row['fraud_loss']/row['total_volume']*100:.3f}%)")
        logger.info(f"  - Avg Txn Amount:     ${row['avg_amount']:,.2f}")

    elapsed = time.time() - start_time
    logger.info("================================================================================")
    logger.info(f"Database population & validation completed in {elapsed:.2f} seconds!")
    logger.info("================================================================================")

if __name__ == "__main__":
    reload = "--reload" in sys.argv
    load_data(reload_all=reload)
