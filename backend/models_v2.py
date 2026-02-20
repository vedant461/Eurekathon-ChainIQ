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

from sqlalchemy import func, JSON

class Supplier(Base):
    __tablename__ = 'suppliers'
    supplier_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_name = Column(String, nullable=False)
    supplied_good = Column(String)
    location = Column(String)
    processes = Column(JSON) # List of process steps

    # Relationships
    orders = relationship("Order", back_populates="supplier")

class Order(Base):
    __tablename__ = 'orders'
    order_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    retailer_id = Column(String, index=True)
    supplier_id = Column(String, ForeignKey('suppliers.supplier_id'), index=True)
    product = Column(String)
    quantity = Column(Integer)
    required_date = Column(String) # ISO 8601
    status = Column(String, default="PENDING") # PENDING, IN_PROGRESS, DELAYED, COMPLETED
    batch_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    supplier = relationship("Supplier", back_populates="orders")

class User(Base):
    __tablename__ = 'users'
    user_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    password_hash = Column(String) # Plaintext for prototype as requested
    role = Column(String) # 'retailer' or 'supplier'
    company_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
