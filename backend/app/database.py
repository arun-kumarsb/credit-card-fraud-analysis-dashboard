"""
SentinelShield - Database Configuration & Connection
Provides SQLAlchemy engine, session maker, and declarative base for SQLite.
Configured with check_same_thread=False for FastAPI concurrency.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sentinelshield.db")

# SQLite connection arguments for concurrency
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    future=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True
)

Base = declarative_base()

def get_db():
    """FastAPI Dependency for database sessions with automatic closing."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
