"""
SentinelShield - Data Loading Module
Loads raw CSV datasets safely with logging and schema inspection.
"""

import os
import logging
import pandas as pd
from typing import Dict, Tuple

logger = logging.getLogger("sentinelshield.load_data")

RAW_DATA_PATHS = {
    "transactions": "data/raw/Transaction_Data_250k.csv",
    "cards": "data/raw/Cards_Data.csv",
    "customers": "data/raw/Cusmtomer_data.csv",
    "merchants": "data/raw/merchant_table.csv",
}

def load_raw_dataset(name: str, path: str) -> pd.DataFrame:
    """Load a single raw dataset with file validation."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Raw dataset file not found: {path}")
    
    logger.info(f"Loading {name} from {path}...")
    df = pd.read_csv(path, low_memory=False)
    file_size_mb = os.path.getsize(path) / (1024 * 1024)
    logger.info(f"Loaded {name}: {len(df):,} rows, {len(df.columns)} columns ({file_size_mb:.2f} MB)")
    return df

def load_all_raw_data() -> Dict[str, pd.DataFrame]:
    """Loads all four raw datasets and returns a dictionary of DataFrames."""
    datasets = {}
    for name, path in RAW_DATA_PATHS.items():
        datasets[name] = load_raw_dataset(name, path)
    return datasets

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    data = load_all_raw_data()
    for k, v in data.items():
        print(f"{k}: shape={v.shape}")
