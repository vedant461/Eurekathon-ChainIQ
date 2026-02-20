import requests
import time

BASE_URL = "http://localhost:8000/api/v2"

# 1. Create Supplier
print("Creating Supplier...")
supplier_payload = {
    "company_name": "Debug Farms",
    "location": "Debug Valley",
    "role": "Harvesting",
    "supplied_good": "Debug Corn",
    "processes": ["Harvesting", "Quality Control", "Shipping"]
}
res = requests.post(f"{BASE_URL}/suppliers", json=supplier_payload)
print(f"Supplier Create: {res.status_code} - {res.text}")
supplier_id = res.json()["supplier_id"]

# 2. Place Order
print(f"\nPlacing Order for Supplier {supplier_id}...")
order_payload = {
    "retailer_id": "r-999",
    "supplier_id": supplier_id,
    "product": "Debug Corn",
    "quantity": 100,
    "required_date": "2024-12-31"
}
res = requests.post(f"{BASE_URL}/orders/place", json=order_payload)
print(f"Order Place Status: {res.status_code}")
print(f"Order Place Body: {res.text}")

try:
    data = res.json()
    if "order_id" in data:
        order_id = data["order_id"]
    else:
        print("ERROR: order_id not found in response!")
        exit(1)
except Exception as e:
    print(f"ERROR: Failed to parse JSON: {e}")
    exit(1)

# 3. Accept Order (Generate Batch ID)
print(f"\nAccepting Order {order_id}...")
res = requests.put(f"{BASE_URL}/orders/{order_id}/accept")
print(f"Order Accept: {res.status_code} - {res.text}")
batch_id = res.json()["batch_id"]
print(f"Batch ID: {batch_id}")

# 4. Simulate Steps (Complete All)
steps = ["Harvesting", "Quality Control", "Shipping"]

for step in steps:
    print(f"\nCompleting Step: {step}...")
    webhook_payload = {
        "batch_id": batch_id,
        "step_name": step,
        "status": "Completed",
        "variance_hrs": 0.5
    }
    res = requests.post(f"{BASE_URL}/webhook/erp", json=webhook_payload)
    print(f"Webhook [{step}]: {res.status_code} - {res.text}")

# 5. Check KPIs
print(f"\nChecking KPIs for Supplier {supplier_id}...")
res = requests.get(f"{BASE_URL}/supplier/{supplier_id}/kpis")
print(f"KPIs: {res.status_code} - {res.text}")
