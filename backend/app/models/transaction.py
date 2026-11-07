"""
SentinelShield - Transaction Model
"""

from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(String(32), primary_key=True, index=True)
    customer_id = Column(String(32), ForeignKey("customers.customer_id"), nullable=False, index=True)
    card_id = Column(String(32), ForeignKey("cards.card_id"), nullable=False, index=True)
    merchant_id = Column(String(32), ForeignKey("merchants.merchant_id"), nullable=False, index=True)
    
    transaction_date = Column(String(16), nullable=False, index=True)
    transaction_time = Column(String(16), nullable=False)
    transaction_datetime = Column(String(32), nullable=False, index=True)
    transaction_amount = Column(Float, nullable=False, index=True)
    
    payment_method = Column(String(32), nullable=False, index=True)
    transaction_channel = Column(String(32), nullable=False, index=True)
    device_type = Column(String(32), nullable=False)
    transaction_status = Column(String(32), nullable=False, index=True)
    is_international = Column(Integer, nullable=False, index=True)
    
    fraud_flag = Column(Integer, nullable=False, index=True)
    fraud_reason = Column(String(128), nullable=False, index=True)
    
    merchant_risk_level = Column(String(16), nullable=False, index=True)
    merchant_category = Column(String(64), nullable=False, index=True)
    customer_state = Column(String(64), nullable=False, index=True)
    customer_city = Column(String(64), nullable=False)
    merchant_state = Column(String(64), nullable=False)
    merchant_city = Column(String(64), nullable=False)
    
    year = Column(Integer, nullable=False, index=True)
    month = Column(Integer, nullable=False, index=True)
    year_month = Column(String(16), nullable=False, index=True)
    day_of_week = Column(String(16), nullable=False, index=True)
    day_of_week_num = Column(Integer, nullable=False)
    hour = Column(Integer, nullable=False, index=True)
    time_period = Column(String(32), nullable=False, index=True)
    is_night = Column(Integer, nullable=False, index=True)
    is_weekend = Column(Integer, nullable=False, index=True)
    
    card_credit_limit = Column(Integer, nullable=False)
    amount_to_limit_ratio = Column(Float, nullable=False)
    is_high_value = Column(Integer, nullable=False, index=True)

    # Relationships
    customer = relationship("Customer", back_populates="transactions")
    card = relationship("Card", back_populates="transactions")
    merchant = relationship("Merchant", back_populates="transactions")
