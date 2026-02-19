import sys
import os
import random
import uuid
from datetime import datetime, timedelta
from sqlalchemy import text

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models import Base, Node
from backend.models_v2 import MetricHierarchy, FactEventTelemetry
from backend.database import engine, SessionLocal

def seed_data_v2():
    print("Initializing V2 Schema...")
    Base.metadata.create_all(bind=engine)
    
    session = SessionLocal()
    
    # 1. Clear V2 Data (Optional, for development)
    session.query(FactEventTelemetry).delete()
    session.query(MetricHierarchy).delete()
    session.commit()
    
    # 2. Seed Metric Tree (dim_metric_hierarchy)
    # L1: Executive KPIs
    l1_perf = MetricHierarchy(metric_id="L1-PERF", metric_name="Delivery Performance", level="L1_Exec", weight_coefficient=1.0)
    l1_qual = MetricHierarchy(metric_id="L1-QUAL", metric_name="Fulfillment Quality", level="L1_Exec", weight_coefficient=1.0)
    l1_rel = MetricHierarchy(metric_id="L1-REL", metric_name="Supplier Reliability", level="L1_Exec", weight_coefficient=1.0)
    
    session.add_all([l1_perf, l1_qual, l1_rel])
    session.commit()
    
    # L2: Category
    # Children of L1-PERF
    l2_transit = MetricHierarchy(metric_id="L2-TRANSIT", parent_metric_id="L1-PERF", metric_name="Transit Timeliness", level="L2_Category", weight_coefficient=0.6)
    l2_proc_time = MetricHierarchy(metric_id="L2-PROC", parent_metric_id="L1-PERF", metric_name="Processing Speed", level="L2_Category", weight_coefficient=0.4)
    
    # Children of L1-QUAL
    l2_qc = MetricHierarchy(metric_id="L2-QC", parent_metric_id="L1-QUAL", metric_name="QC Compliance", level="L2_Category", weight_coefficient=0.7)
    l2_cond = MetricHierarchy(metric_id="L2-COND", parent_metric_id="L1-QUAL", metric_name="Storage Condition", level="L2_Category", weight_coefficient=0.3)
    
    # Children of L1-REL
    l2_avail = MetricHierarchy(metric_id="L2-AVAIL", parent_metric_id="L1-REL", metric_name="Stock Availability", level="L2_Category", weight_coefficient=0.5)
    l2_doc = MetricHierarchy(metric_id="L2-DOC", parent_metric_id="L1-REL", metric_name="Documentation Accuracy", level="L2_Category", weight_coefficient=0.5)

    session.add_all([l2_transit, l2_proc_time, l2_qc, l2_cond, l2_avail, l2_doc])
    session.commit() 
    
    # L3: Leaf Metrics (The inputs)
    metrics_l3 = [
        # Transit
        {"id": "L3-GPS", "parent": "L2-TRANSIT", "name": "GPS Variance", "w": 0.5},
        {"id": "L3-CUSTOMS", "parent": "L2-TRANSIT", "name": "Customs Hold Time", "w": 0.5},
        # Processing
        {"id": "L3-ROAST", "parent": "L2-PROC", "name": "Roaster Cycle Time", "w": 0.5},
        {"id": "L3-PICK", "parent": "L2-PROC", "name": "Warehouse Pick Rate", "w": 0.5},
        # QC
        {"id": "L3-MOIST", "parent": "L2-QC", "name": "Moisture Content %", "w": 0.5},
        {"id": "L3-DEFECT", "parent": "L2-QC", "name": "Defect Rate", "w": 0.5},
        # Condition
        {"id": "L3-TEMP", "parent": "L2-COND", "name": "Container Temp", "w": 0.5},
        {"id": "L3-SHOCK", "parent": "L2-COND", "name": "Shock/G-Force", "w": 0.5},
        # Availability
        {"id": "L3-FILL", "parent": "L2-AVAIL", "name": "Fill Rate", "w": 1.0},
        # Doc
        {"id": "L3-Inv-ACC", "parent": "L2-DOC", "name": "Invoice Accuracy", "w": 1.0}
    ]
    
    l3_objs = []
    for m in metrics_l3:
        l3_objs.append(MetricHierarchy(metric_id=m["id"], parent_metric_id=m["parent"], metric_name=m["name"], level="L3_Leaf", weight_coefficient=m["w"]))
        
    session.add_all(l3_objs)
    session.commit()
    print("Metric Tree Seeded.")
    
    # 3. Create Materialized View (Raw SQL)
    # Rollup logic: 
    # 1. Avg variance of L3 -> L2 Score
    # 2. Weighted Avg of L2 -> L1 Score
    # For MVP, we'll make a simpler view trying to aggregate L3 variances
    
    mv_sql = """
    DROP MATERIALIZED VIEW IF EXISTS mv_metric_propagation;
    CREATE MATERIALIZED VIEW mv_metric_propagation AS
    WITH l3_stats AS (
        SELECT 
            m.parent_metric_id as l2_id,
            f.node_id,
            AVG(f.variance) as l2_variance_contribution,
            COUNT(f.event_id) as event_count
        FROM fact_event_telemetry f
        JOIN dim_metric_hierarchy m ON f.metric_id = m.metric_id
        WHERE m.level = 'L3_Leaf'
        GROUP BY m.parent_metric_id, f.node_id
    ),
    l2_stats AS (
        SELECT 
            m.parent_metric_id as l1_id,
            s.node_id,
            SUM(s.l2_variance_contribution * m.weight_coefficient) as l1_variance_contribution
        FROM l3_stats s
        JOIN dim_metric_hierarchy m ON s.l2_id = m.metric_id
        GROUP BY m.parent_metric_id, s.node_id
    )
    SELECT * FROM l2_stats;
    """
    # session.execute(text(mv_sql))
    # session.commit()
    # print("Materialized View Created.") 
    # Commenting out MV creation in Python for now to avoid complexity if permissions fail; 
    # we can calculate in API or create manually. Let's try to include it.
    try:
        session.execute(text(mv_sql))
        session.commit()
        print("Materialized View Created.")
    except Exception as e:
        print(f"Warning: Could not create MV. {e}")
        session.rollback()

    # 4. Seed Telemetry (Rigged)
    print("Seeding Telemetry...")
    
    # Get Nodes
    all_nodes = session.query(Node).all()
    if not all_nodes:
        print("ERROR: No nodes found. Run seed_data.py first!")
        return
        
    supplier_b = next((n for n in all_nodes if n.node_name == "Supplier B"), None)
    west_coast = next((n for n in all_nodes if n.node_name == "West Coast Carrier"), None)
    
    events = []
    end_date = datetime.utcnow()
    
    # Generate 5,000 events
    for i in range(5000):
        # Pick node
        node = random.choice(all_nodes)
        is_bad_actor = (supplier_b and node.node_id == supplier_b.node_id)
        
        # Pick random L3 metric
        metric = random.choice(l3_objs)
        
        # Rigged Logic
        if is_bad_actor and metric.metric_id == "L3-ROAST":
            # Supplier B struggling with Roasting
            variance = random.uniform(10, 20)
            friction = True
        elif is_bad_actor and metric.metric_id == "L3-DEFECT":
             # Supplier B defects
             variance = random.uniform(5, 10)
             friction = True
        elif west_coast and node.node_id == west_coast.node_id and metric.metric_id == "L3-GPS":
             # West Coast GPS delay
             variance = random.uniform(5, 15)
             friction = True
        else:
            variance = random.uniform(-1, 1)
            friction = False
            
        e = FactEventTelemetry(
            lineage_id=str(uuid.uuid4()),
            metric_id=metric.metric_id,
            node_id=node.node_id,
            recorded_at_utc=end_date - timedelta(hours=random.randint(0, 100)),
            value_actual=10 + variance,
            value_expected=10,
            variance=variance,
            friction_flag=friction,
            event_type="Simulated"
        )
        events.append(e)
        
        if len(events) >= 1000:
            session.add_all(events)
            session.commit()
            events = []
            
    if events:
        session.add_all(events)
        session.commit()
        
    print("V2 Data Seeded.")

if __name__ == "__main__":
    seed_data_v2()
