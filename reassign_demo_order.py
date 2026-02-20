import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.database import SessionLocal
from backend.models_v2 import Order, Supplier
from sqlalchemy import desc

def assign_demo_to_latest():
    db = SessionLocal()
    try:
        # Find latest supplier
        latest_supplier = db.query(Supplier).order_by(desc(Supplier.supplier_id)).first() # UUIDs don't sort well by time, but let's try or pick first
        # Actually UUIDs are random. 
        # If we can't find "latest", we might just fetch *all* and pick one that isn't sup-001 if possible, or just print them.
        
        suppliers = db.query(Supplier).all()
        print(f"Found {len(suppliers)} suppliers.")
        
        target_supplier = None
        if len(suppliers) > 0:
            # Prefer one that looks like a user created it (not seed)
            # But we don't know timestamps.
            # Let's just pick the *last* one in list (might be random) or one with a specific name if we knew it.
            # Let's just pick the one that ISN'T sup-001 if exists.
            
            for s in suppliers:
                print(f" - {s.supplier_id}: {s.company_name}")
                if s.supplier_id != "sup-001":
                    target_supplier = s
            
            if not target_supplier:
                target_supplier = suppliers[0]
                
            print(f"Targeting Supplier: {target_supplier.supplier_id} ({target_supplier.company_name})")
            
            # Find demo order
            order = db.query(Order).filter(Order.batch_id == "ORD-2024-001").first()
            if order:
                print(f"Updating ORD-2024-001 to belong to {target_supplier.company_name}...")
                order.supplier_id = target_supplier.supplier_id
                order.status = "COMPLETED" # Ensure it's completed too
                db.commit()
                print("Done.")
            else:
                print("ORD-2024-001 not found.")
        else:
            print("No suppliers found!")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    assign_demo_to_latest()
