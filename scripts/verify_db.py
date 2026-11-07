import sqlite3

conn = sqlite3.connect('sentinelshield.db')
cur = conn.cursor()

# Get tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
tables = [r[0] for r in cur.fetchall()]
print(f"Tables in sentinelshield.db: {tables}")

# Get counts
for t in tables:
    cur.execute(f"SELECT COUNT(*) FROM {t};")
    cnt = cur.fetchone()[0]
    print(f"  - {t}: {cnt:,} rows")

# Get indexes
cur.execute("SELECT tbl_name, name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_autoindex%';")
indexes = cur.fetchall()
print(f"\nTotal secondary indexes: {len(indexes)}")
for tbl, idx in indexes[:12]:
    print(f"  [{tbl}] {idx}")

# Quick test query (fraud transactions with join)
cur.execute("""
    SELECT t.transaction_id, t.transaction_amount, t.fraud_reason, c.customer_name, m.merchant_name
    FROM transactions t
    JOIN customers c ON t.customer_id = c.customer_id
    JOIN merchants m ON t.merchant_id = m.merchant_id
    WHERE t.fraud_flag = 1
    LIMIT 3;
""")
print("\nSample Fraud Query with Joins:")
for row in cur.fetchall():
    print(" ", row)

conn.close()
