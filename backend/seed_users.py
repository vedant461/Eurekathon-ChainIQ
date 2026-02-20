from backend.database import SessionLocal, engine
from backend.models_v2 import User, Base
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_users():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if users exist
        if db.query(User).first():
            logger.info("Users table already seeded.")
            return

        users = [
            User(
                email="retailer@demo.com",
                password_hash="demo123",
                role="retailer",
                company_name="MegaMart",
                user_id="ret-current-user" # Force ID for demo compatibility
            ),
            User(
                email="supplier@demo.com",
                password_hash="demo123",
                role="supplier",
                company_name="VRT Shirts",
                user_id="sup-001" # Force ID for demo compatibility
            )
        ]
        
        db.add_all(users)
        db.commit()
        logger.info("Successfully seeded 2 demo users.")
        
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()
