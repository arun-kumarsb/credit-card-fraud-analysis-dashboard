import subprocess
import time
import os
from PIL import Image

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = r"N:\Projects\CreditCardFraudAnalyticsDashboard\docs\screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

TARGETS = [
    {
        "filename": "fig_7_1_executive_overview.png",
        "url": "http://127.0.0.1:5173/?tab=overview",
        "window_size": "1920,1350",
        "delay": 6000
    },
    {
        "filename": "fig_filter_dropdown.png",
        "url": "http://127.0.0.1:5173/?tab=overview&openFilter=true",
        "window_size": "1920,1080",
        "delay": 5000
    },
    {
        "filename": "fig_7_5_transactions_explorer.png",
        "url": "http://127.0.0.1:5173/?tab=transactions",
        "window_size": "1920,1150",
        "delay": 6000
    },
    {
        "filename": "fig_7_5b_transaction_drawer.png",
        "url": "http://127.0.0.1:5173/?tab=transactions&openDrawer=true",
        "window_size": "1920,1150",
        "delay": 7000
    },
    {
        "filename": "fig_7_6_customer_analytics.png",
        "url": "http://127.0.0.1:5173/?tab=customers",
        "window_size": "1920,1200",
        "delay": 6000
    },
    {
        "filename": "fig_7_7_cards_portfolio.png",
        "url": "http://127.0.0.1:5173/?tab=cards",
        "window_size": "1920,1250",
        "delay": 6000
    },
    {
        "filename": "fig_7_8_merchant_ecosystem.png",
        "url": "http://127.0.0.1:5173/?tab=merchants",
        "window_size": "1920,1300",
        "delay": 6000
    },
    {
        "filename": "fig_7_9_data_quality.png",
        "url": "http://127.0.0.1:5173/?tab=quality",
        "window_size": "1920,1200",
        "delay": 6000
    },
    {
        "filename": "fig_8_1_filtered_comparison.png",
        "url": "http://127.0.0.1:5173/?tab=overview&range=2025",
        "window_size": "1920,1350",
        "delay": 6000
    }
]

def capture(target):
    out_path = os.path.join(OUTPUT_DIR, target["filename"])
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        f"--window-size={target['window_size']}",
        f"--virtual-time-budget={target['delay']}",
        f"--screenshot={out_path}",
        target["url"]
    ]
    print(f"Capturing {target['filename']} from {target['url']}...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if os.path.exists(out_path):
        size_kb = os.path.getsize(out_path) / 1024
        im = Image.open(out_path)
        print(f"  -> SUCCESS: {target['filename']} ({im.size[0]}x{im.size[1]}, {size_kb:.1f} KB)")
    else:
        print(f"  -> FAILED: {target['filename']}")

if __name__ == "__main__":
    for t in TARGETS:
        capture(t)
        time.sleep(1)
