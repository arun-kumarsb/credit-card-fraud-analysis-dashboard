"""
SentinelShield - FastAPI Application Entry Point
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import (
    dashboard,
    transactions,
    customers,
    cards,
    merchants,
    data_quality
)

app = FastAPI(
    title="SentinelShield — Fraud Analytics & Detection API",
    description="REST API delivering high-performance financial analytics, transaction queries, and demographic risk insights.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
allowed_origins = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(dashboard.router)
app.include_router(transactions.router)
app.include_router(customers.router)
app.include_router(cards.router)
app.include_router(merchants.router)
app.include_router(data_quality.router)

@app.get("/", tags=["Health"])
def root():
    return {
        "name": "SentinelShield — Fraud Analytics API",
        "status": "operational",
        "database": "sqlite:///./sentinelshield.db",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "/api/dashboard/overview",
            "/api/dashboard/trends",
            "/api/dashboard/distributions",
            "/api/transactions",
            "/api/transactions/{transaction_id}",
            "/api/transactions/export/csv",
            "/api/customers/analytics",
            "/api/cards/analytics",
            "/api/merchants/analytics",
            "/api/data-quality"
        ]
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "SentinelShield Backend"}
