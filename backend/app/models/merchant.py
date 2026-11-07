"""
SentinelShield - Merchant Model
"""

from sqlalchemy import Column, String, Float, Integer
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Merchant(Base):
    __tablename__ = "merchants"

    merchant_id = Column(String(32), primary_key=True, index=True)
    merchant_name = Column(String(128), nullable=False)
    merchant_category = Column(String(64), nullable=False, index=True)
    state = Column(String(64), nullable=False, index=True)
    city = Column(String(64), nullable=False)
    merchant_risk_level = Column(String(16), nullable=False, index=True)
    merchant_rating = Column(Float, nullable=False, index=True)
    merchant_status = Column(String(16), nullable=False)
    merchant_since = Column(String(16), nullable=False)

    # Relationships
    transactions = relationship("Transaction", back_populates="merchant")
