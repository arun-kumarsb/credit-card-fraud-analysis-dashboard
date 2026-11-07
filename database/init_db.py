"""
SentinelShield - Database Initialization Script
Creates tables, relationships, and performance pragmas in SQLite (sentinelshield.db).
Safe to run repeatedly.
"""

import os
import sys
import logging
from sqlalchemy import text
from backend.app.database import engine, Base
import backend.app.models  # Ensure models are registered with Base.metadata

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger("sentinelshield.init_db")

def init_db(drop_existing: bool = False):
    """Initializes tables in the SQLite database."""
    logger.info("Connecting to database: " + str(engine.url))
    
    with engine.connect() as conn:
        # SQLite performance & concurrency PRAGMAs
        conn.execute(text("PRAGMA journal_mode = WAL;"))
        conn.execute(text("PRAGMA synchronous = NORMAL;"))
        conn.execute(text("PRAGMA cache_size = 10000;"))
        conn.execute(text("PRAGMA foreign_keys = ON;"))
        conn.commit()
        logger.info("Configured SQLite PRAGMAs: WAL mode, synchronous=NORMAL, foreign_keys=ON")

    if drop_existing:
        logger.warning("Dropping existing tables...")
        Base.metadata.drop_all(bind=engine)

    logger.info("Creating tables according to SQLAlchemy schema...")
    Base.metadata.create_all(bind=engine)
    
    # Verify tables
    with engine.connect() as conn:
        result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = [row[0] for row in result if not row[0].startswith("sqlite_")]
        logger.info(f"Initialized {len(tables)} tables: {', '.join(tables)}")

if __name__ == "__main__":
    drop = "--drop" in sys.argv
    init_db(drop_existing=drop)
