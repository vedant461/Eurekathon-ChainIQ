import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.database import SessionLocal
from backend.models_v2 import Order

def check_db():
    db = SessionLocal()
    try:
        orders = db.query(Order).all()
        print(f"Total Orders in Postgres: {len(orders)}")
        found = False
        for o in orders:
            print(f" - Order: {o.order_id}, Batch: {o.batch_id}, Status: {o.status}")
            if o.batch_id == "ORD-2024-001" or o.order_id == "ORD-2024-001":
                found = True
        
        if not found:
            print("\nCRITICAL: ORD-2024-001 NOT FOUND in Postgres!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
