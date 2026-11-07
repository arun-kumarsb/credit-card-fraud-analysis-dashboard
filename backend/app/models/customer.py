"""
SentinelShield - Customer Model
"""

from sqlalchemy import Column, String, Integer, Date
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String(32), primary_key=True, index=True)
    customer_name = Column(String(128), nullable=False)
    gender = Column(String(16), nullable=False)
    age = Column(Integer, nullable=False, index=True)
    marital_status = Column(String(32), nullable=False)
    occupation = Column(String(64), nullable=False, index=True)
    annual_income = Column(Integer, nullable=False, index=True)
    customer_segment = Column(String(32), nullable=False, index=True)
    state = Column(String(64), nullable=False, index=True)
    city = Column(String(64), nullable=False)
    account_type = Column(String(32), nullable=False, index=True)
    customer_since = Column(String(16), nullable=False)
    age_group = Column(String(16), nullable=False, index=True)
    income_tier = Column(String(32), nullable=False, index=True)

    # Relationships
    cards = relationship("Card", back_populates="customer", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="customer")
