"""
SentinelShield - Card Model
"""

from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Card(Base):
    __tablename__ = "cards"

    card_id = Column(String(32), primary_key=True, index=True)
    customer_id = Column(String(32), ForeignKey("customers.customer_id"), nullable=False, index=True)
    card_type = Column(String(32), nullable=False, index=True)
    card_network = Column(String(32), nullable=False, index=True)
    credit_limit = Column(Integer, nullable=False, index=True)
    card_status = Column(String(32), nullable=False, index=True)
    contactless = Column(String(8), nullable=False)
    card_mode = Column(String(16), nullable=False)
    issue_date = Column(String(16), nullable=False)
    expiry_date = Column(String(16), nullable=False)
    credit_limit_tier = Column(String(32), nullable=False, index=True)

    # Relationships
    customer = relationship("Customer", back_populates="cards")
    transactions = relationship("Transaction", back_populates="card")
