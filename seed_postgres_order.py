import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.database import SessionLocal, engine
from backend.models_v2 import Order, Base

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_missing_order():
    db = SessionLocal()
    try:
        # Check if exists first
        exists = db.query(Order).filter(Order.batch_id == "ORD-2024-001").first()
        if exists:
            print("Order ORD-2024-001 already exists.")
            return

        print("Seeding ORD-2024-001 into Postgres...")
        new_order = Order(
            order_id="ORD-2024-001", # Using batch_id as ID for simplicity or separate?
            # Model says: order_id is Primary Key. 
            # In state.py, it keys by ORD-2024-001.
            # let's make order_id = ORD-2024-001 and batch_id = ORD-2024-001 to be safe.
            
            retailer_id="r-001", # Mock
            supplier_id="sup-001", # Value from Dashboard mock
            product="Premium Arabica Beans",
            quantity=500,
            required_date="2024-10-12",
            status="IN_PROGRESS",
            batch_id="ORD-2024-001"
        )
        db.add(new_order)
        db.commit()
        print("Successfully seeded ORD-2024-001.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_missing_order()
