import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/chainiq_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- MongoDB Connection (Added for Phase 14/23) ---
# We make this robust so the app works even if MongoDB is not running or pymongo is missing.
try:
    import pymongo
    
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
    # serverSelectionTimeoutMS=2000 ensures we don't hang for 30s if Mongo is down
    mongo_client = pymongo.MongoClient(MONGO_URL, serverSelectionTimeoutMS=2000)
    
    # Check if we can actually connect (triggered on first use, but let's define the collection)
    mongo_db = mongo_client["chainiq_raw"]
    raw_data_collection = mongo_db["ingestion_events"]
    print("INFO: MongoDB connection configured.")

except ImportError:
    print("WARNING: pymongo not installed. MongoDB features disabled.")
    raw_data_collection = None
except Exception as e:
    print(f"WARNING: MongoDB connection failed: {e}. MongoDB features disabled.")
    raw_data_collection = None
