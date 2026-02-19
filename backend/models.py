from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Node(Base):
    __tablename__ = 'dim_nodes'
    node_id = Column(Integer, primary_key=True)
    node_name = Column(String, nullable=False)
    node_type = Column(String, nullable=False)  # 'Grower', 'Processor', 'Warehouse', 'Carrier'
    lat = Column(Float)
    lng = Column(Float)

class Product(Base):
    __tablename__ = 'dim_products'
    product_id = Column(Integer, primary_key=True)
    sku_name = Column(String, nullable=False)
    category = Column(String)

class Event(Base):
    __tablename__ = 'fact_events'
    event_id = Column(String, primary_key=True) # UUID string
    order_id = Column(String, index=True)
    node_id = Column(Integer, ForeignKey('dim_nodes.node_id'))
    process_type = Column(String) # 'Roasting', 'Transit', 'QC', 'Harvesting', 'Packaging'
    timestamp_start = Column(DateTime)
    timestamp_end = Column(DateTime)
    expected_duration_hrs = Column(Float)
    actual_duration_hrs = Column(Float)
    variance_hrs = Column(Float)
    status = Column(String) # 'OK', 'QC_FAIL', 'DELAYED'
