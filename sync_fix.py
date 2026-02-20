import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.database import SessionLocal
from backend.models_v2 import Order
from backend.state import LIVE_ORDER_DB

def sync_completed_orders():
    db = SessionLocal()
    try:
        print("--- Syncing Completed Orders from Memory to Postgres ---")
        
        for batch_id, data in LIVE_ORDER_DB.items():
            telemetry = data.get("telemetry", [])
            steps_status = [s["status"] for s in telemetry]
            
            # Check if all completed in memory
            is_complete_in_memory = all(s == "Completed" for s in steps_status)
            
            print(f"Batch {batch_id}: Memory Status = {'COMPLETED' if is_complete_in_memory else 'IN_PROGRESS'} (Steps: {steps_status})")
            
            if is_complete_in_memory:
                # Find in DB
                order = db.query(Order).filter(Order.batch_id == batch_id).first()
                if order:
                    print(f" -> Found in DB (ID: {order.order_id}). Current DB Status: {order.status}")
                    
                    if order.status != "COMPLETED":
                        print(" -> Mismatch detected! Updating DB to COMPLETED.")
                        order.status = "COMPLETED"
                        db.commit()
                        print(" -> FIXED.")
                    else:
                        print(" -> DB is already synchronized.")
                else:
                    print(" -> CRITICAL: Order missing from Postgres! (Should have been seeded)")
                    
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    sync_completed_orders()
