from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Reuse Base from V1 or create new? Let's use a new one to keep V2 clean, 
# but sharing metadata might be useful if we want foreign keys to V1 nodes.
# For simplicity, let's redefine Base or import if we want to share. 
# Attempting to share Base from models.py to link with Node if needed.
from .models import Base, Node 

# If models.py Base is used, we just define new classes.

class MetricHierarchy(Base):
    __tablename__ = 'dim_metric_hierarchy'
    
    metric_id = Column(String, primary_key=True) # e.g., "M-001"
    parent_metric_id = Column(String, ForeignKey('dim_metric_hierarchy.metric_id'), nullable=True)
    metric_name = Column(String, nullable=False)
    level = Column(String, nullable=False) # 'L1_Exec', 'L2_Category', 'L3_Leaf'
    weight_coefficient = Column(Float, default=1.0)
    
    # Self-referential relationship: Parent-Child
    parent = relationship("MetricHierarchy", remote_side=[metric_id], backref="children")

class FactEventTelemetry(Base):
    __tablename__ = 'fact_event_telemetry'
    
    event_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lineage_id = Column(String, index=True) # Hash of Order+PO+Batch+Supplier
    metric_id = Column(String, ForeignKey('dim_metric_hierarchy.metric_id'))
    node_id = Column(Integer, ForeignKey('dim_nodes.node_id'), nullable=True) # Link to physical node
    
    recorded_at_utc = Column(DateTime)
    value_actual = Column(Float)
    value_expected = Column(Float)
    variance = Column(Float)
    friction_flag = Column(Boolean, default=False)
    
    # Metadata for filtering
    event_type = Column(String) # 'IoT_Sensor', 'ERP_Status', 'OCR_Scan'

# Materialized View Definition (SQLAlchemy doesn't support CREAT MATERIALIZED VIEW natively well in ORM models, 
# so we will execute raw SQL in the seeder/migration).
