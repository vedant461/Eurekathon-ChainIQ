import sys
import os
import requests
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.database import SessionLocal
from backend.models_v2 import Order

def fix_and_check():
    # 1. Reassign to sup-001
    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.batch_id == "ORD-2024-001").first()
        if order:
            print(f"Reassigning ORD-2024-001 to sup-001 (Current: {order.supplier_id})...")
            order.supplier_id = "sup-001"
            order.status = "COMPLETED"
            db.commit()
            print("Reassigned to sup-001.")
        else:
            print("ORD-2024-001 not found.")
    except Exception as e:
        print(f"DB Error: {e}")
    finally:
        db.close()

    # 2. Check API
    print("\nChecking API for sup-001...")
    try:
        res = requests.get("http://localhost:8000/api/v2/supplier/sup-001/kpis")
        print(f"Status: {res.status_code}")
        print(f"Body: {res.text}")
        
        res2 = requests.get("http://localhost:8000/api/v2/supplier/sup-001/bottlenecks")
        print(f"Bottlenecks Status: {res2.status_code}")
        print(f"Bottlenecks Body: {res2.text}")
        
    except Exception as e:
        print(f"API Error: {e}")

if __name__ == "__main__":
    fix_and_check()
