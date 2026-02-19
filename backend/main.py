from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case
from typing import List, Optional
from pydantic import BaseModel
import os
from openai import OpenAI

from .models import Base, Node, Event, Product
from .database import engine, get_db
from . import api_v2, api_auth

# Initialize DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Supply Chain Intelligence Platform")

app.include_router(api_v2.router)
app.include_router(api_auth.router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class NodeOut(BaseModel):
    node_id: int
    node_name: str
    node_type: str
    lat: float
    lng: float
    avg_variance: Optional[float] = 0.0

    class Config:
        from_attributes = True

class KPIOut(BaseModel):
    total_orders: int
    avg_variance_hrs: float
    on_time_pct: float

class BottleneckOut(BaseModel):
    node_name: str
    process_type: str
    avg_variance_hrs: float
    fail_rate_pct: float

# --- Endpoints ---

@app.get("/api/kpis", response_model=KPIOut)
def get_kpis(db: Session = Depends(get_db)):
    total_events = db.query(Event).count()
    if total_events == 0:
        return {"total_orders": 0, "avg_variance_hrs": 0, "on_time_pct": 0}

    total_orders = db.query(func.count(func.distinct(Event.order_id))).scalar()
    avg_var = db.query(func.avg(Event.variance_hrs)).scalar() or 0
    
    ok_events = db.query(Event).filter(Event.status == 'OK').count()
    on_time_pct = (ok_events / total_events) * 100

    return {
        "total_orders": total_orders,
        "avg_variance_hrs": round(avg_var, 2),
        "on_time_pct": round(on_time_pct, 1)
    }

@app.get("/api/node-performance", response_model=List[NodeOut])
def get_node_performance(db: Session = Depends(get_db)):
    results = db.query(
        Node,
        func.avg(Event.variance_hrs).label('avg_variance')
    ).join(Event, Node.node_id == Event.node_id, isouter=True)\
     .group_by(Node.node_id)\
     .all()
    
    nodes_out = []
    for node, avg_variance in results:
        n_out = NodeOut(
            node_id=node.node_id,
            node_name=node.node_name,
            node_type=node.node_type,
            lat=node.lat,
            lng=node.lng,
            avg_variance=avg_variance or 0.0
        )
        nodes_out.append(n_out)
    return nodes_out

@app.get("/api/bottlenecks", response_model=List[BottleneckOut])
def get_bottlenecks(db: Session = Depends(get_db)):
    # Top 5 node+process combos by high variance
    results = db.query(
        Node.node_name,
        Event.process_type,
        func.avg(Event.variance_hrs).label('avg_variance'),
        func.count(Event.event_id).label('total_events'),
        func.sum(case((Event.status != 'OK', 1), else_=0)).label('fail_count')
    ).join(Node, Event.node_id == Node.node_id)\
     .group_by(Node.node_name, Event.process_type)\
     .order_by(desc('avg_variance'))\
     .limit(5)\
     .all()
    
    bottlenecks = []
    for r in results:
        fail_rate = (r.fail_count / r.total_events * 100) if r.total_events > 0 else 0
        bottlenecks.append({
            "node_name": r.node_name,
            "process_type": r.process_type,
            "avg_variance_hrs": round(r.avg_variance or 0, 1),
            "fail_rate_pct": round(fail_rate, 1)
        })
    return bottlenecks

@app.post("/api/generate-insight")
def generate_insight(db: Session = Depends(get_db)):
    bottlenecks = get_bottlenecks(db)
    if not bottlenecks:
        return "No data available."
    
    # BottleneckOut is a Pydantic model, so access attributes directly
    # Wait, in get_bottlenecks I returned a list of dicts or objects?
    # I returned `bottlenecks.append({...})` -> List of dicts?
    # `response_model=List[BottleneckOut]` handles conversion from dict.
    # But when I call `get_bottlenecks(db)` directly here, I get the python list of dicts.
    
    top = bottlenecks[0] # dict
    
    node_name = top['node_name']
    process_type = top['process_type']
    avg_variance = top['avg_variance_hrs']
    fail_rate = top['fail_rate_pct']
    
    prompt = f"""
    You are a Supply Chain Analyst. Analyze this data issue:
    Node: {node_name}
    Process: {process_type}
    Average Delay: {avg_variance} hours
    Failure Rate: {fail_rate}%
    
    Provide a concise 3-sentence root cause analysis and recommendation.
    """
    
    client = OpenAI(
        base_url='http://localhost:11434/v1',
        api_key='ollama',
    )
    
    try:
        response = client.chat.completions.create(
            model="llama3.2:3b",
            messages=[
                {"role": "system", "content": "You are a helpful supply chain expert."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"AI Error: {e}")
        return f"AI Analysis Unavailable: {e}"
