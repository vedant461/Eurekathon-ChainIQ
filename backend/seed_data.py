import sys
import os
import random
from datetime import datetime, timedelta
import uuid
import faker

# Add project root to path so we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models import Base, Node, Product, Event
from backend.database import engine, SessionLocal

def seed_data():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    session = SessionLocal()
    
    # Check if data exists
    if session.query(Node).first():
        print("Data already exists. Skipping seed.")
        session.close()
        return

    fake = faker.Faker()

    print("Seeding Nodes...")
    nodes = []
    
    # 1. Critical "Rigged" Nodes
    supplier_b = Node(node_name="Supplier B", node_type="Processor", lat=12.9716, lng=77.5946)
    west_coast_carrier = Node(node_name="West Coast Carrier", node_type="Carrier", lat=34.0522, lng=-118.2437)
    
    nodes.extend([supplier_b, west_coast_carrier])
    
    # 2. Random Nodes
    node_types = ['Grower', 'Processor', 'Warehouse', 'Carrier']
    for _ in range(30):
        lat = float(fake.latitude())
        lng = float(fake.longitude())
        ntype = random.choice(node_types)
        nodes.append(Node(node_name=fake.company(), node_type=ntype, lat=lat, lng=lng))
        
    session.add_all(nodes)
    session.commit()
    
    # Re-fetch to get IDs
    all_nodes = session.query(Node).all()
    all_growers = [n for n in all_nodes if n.node_type == 'Grower']
    all_processors = [n for n in all_nodes if n.node_type == 'Processor']
    all_warehouses = [n for n in all_nodes if n.node_type == 'Warehouse']
    all_carriers = [n for n in all_nodes if n.node_type == 'Carrier']

    # Supplier B refetch
    supplier_b = next(n for n in all_nodes if n.node_name == "Supplier B")
    west_coast_carrier = next(n for n in all_nodes if n.node_name == "West Coast Carrier")

    print("Seeding Products...")
    products = []
    categories = ['Coffee', 'Cacao', 'Tea', 'Spices']
    for _ in range(50):
        products.append(Product(sku_name=fake.word().upper() + "-" + str(random.randint(100, 999)), category=random.choice(categories)))
    
    session.add_all(products)
    session.commit()
    
    print("Seeding Events (Rigged Logic)...")
    events = []
    start_date = datetime.now() - timedelta(days=30)
    
    # Generate ~2500 orders -> ~10000 events
    for i in range(2500):
        order_id = str(uuid.uuid4())
        current_time = start_date + timedelta(minutes=random.randint(0, 40000))
        
        # Step 1: Grower
        grower = random.choice(all_growers) if all_growers else random.choice(all_nodes)
        process_hours = random.uniform(24, 48)
        
        e1 = Event(
            event_id=str(uuid.uuid4()),
            order_id=order_id,
            node_id=grower.node_id,
            process_type="Harvesting",
            timestamp_start=current_time,
            timestamp_end=current_time + timedelta(hours=process_hours),
            expected_duration_hrs=process_hours,
            actual_duration_hrs=process_hours + random.uniform(-2, 2),
            variance_hrs=random.uniform(-2, 2), # Corrected logic
            status="OK"
        )
        # Fix variance calculation strictly
        e1.variance_hrs = e1.actual_duration_hrs - e1.expected_duration_hrs
        
        events.append(e1)
        current_time = e1.timestamp_end
        
        # Step 2: Processor (Supplier B logic)
        processor = random.choice(all_processors) if all_processors else supplier_b
        is_supplier_b = (processor.node_id == supplier_b.node_id)
        
        process_hours = random.uniform(10, 20)
        
        if is_supplier_b and random.random() < 0.40:
            status = "QC_FAIL"
            variance = 120.0
            actual_duration = process_hours + variance
        else:
            status = "OK"
            variance = random.uniform(-2, 2)
            actual_duration = process_hours + variance
            
        e2 = Event(
            event_id=str(uuid.uuid4()),
            order_id=order_id,
            node_id=processor.node_id,
            process_type="Roasting" if random.random() > 0.5 else "QC",
            timestamp_start=current_time,
            timestamp_end=current_time + timedelta(hours=actual_duration),
            expected_duration_hrs=process_hours,
            actual_duration_hrs=actual_duration,
            variance_hrs=variance,
            status=status
        )
        events.append(e2)
        current_time = e2.timestamp_end
        
        touched_supplier_b = is_supplier_b
        
        # Step 3: Warehouse
        warehouse = random.choice(all_warehouses) if all_warehouses else random.choice(all_nodes)
        process_hours = random.uniform(5, 12)
        
        e3 = Event(
            event_id=str(uuid.uuid4()),
            order_id=order_id,
            node_id=warehouse.node_id,
            process_type="Storage",
            timestamp_start=current_time,
            timestamp_end=current_time + timedelta(hours=process_hours),
            expected_duration_hrs=process_hours,
            actual_duration_hrs=process_hours + random.uniform(-1, 1),
            variance_hrs=0, # placeholder
            status="OK"
        )
        e3.variance_hrs = e3.actual_duration_hrs - e3.expected_duration_hrs
        events.append(e3)
        current_time = e3.timestamp_end

        # Step 4: Carrier (West Coast Carrier logic)
        carrier = random.choice(all_carriers) if all_carriers else west_coast_carrier
        is_west_coast = (carrier.node_id == west_coast_carrier.node_id)
        process_hours = random.uniform(48, 96)
        
        if is_west_coast and touched_supplier_b:
            variance = 48.0
            status = "DELAYED"
            actual_duration = process_hours + variance
        else:
            variance = random.uniform(-5, 5)
            status = "OK"
            actual_duration = process_hours + variance
            
        e4 = Event(
            event_id=str(uuid.uuid4()),
            order_id=order_id,
            node_id=carrier.node_id,
            process_type="Transit",
            timestamp_start=current_time,
            timestamp_end=current_time + timedelta(hours=actual_duration),
            expected_duration_hrs=process_hours,
            actual_duration_hrs=actual_duration,
            variance_hrs=variance,
            status=status
        )
        events.append(e4)
        
        if len(events) >= 10000:
            break
            
    print(f"Committing {len(events)} events...")
    session.add_all(events)
    session.commit()
    session.close()
    print("Done!")

if __name__ == "__main__":
    seed_data()
