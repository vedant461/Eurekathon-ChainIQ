import requests
import json

# URL for the backend
BASE_URL = "http://localhost:8000"

print("--- Inspecting LIVE_ORDER_DB ---")

# We don't have a direct endpoint to dump the whole DB, 
# but we can try to "get tracker" for the batch if we know it.
# The user screenshot showed "Batch #404". 
# Let's try to guess the batch ID or find a way to list them.

# Actually, I can write a small script that imports `state` directly if run from the backend dir,
# OR I can add a temporary debug endpoint.
# Let's try importing `state` directly via a python script in the backend folder.

import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from backend.state import LIVE_ORDER_DB
    print(f"Found {len(LIVE_ORDER_DB)} batches in memory.")
    for batch_id, data in LIVE_ORDER_DB.items():
        print(f"\nBatch: {batch_id}")
        print("Steps:")
        for step in data["telemetry"]:
            status = step["status"]
            name = step["step_name"]
            print(f" - {name}: {status}")
            
except ImportError:
    print("Could not import backend.state. Ensure you are running this from d:/ChainIQ")
except Exception as e:
    print(f"Error: {e}")
