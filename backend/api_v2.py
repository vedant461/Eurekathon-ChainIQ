from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, text
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncio
import json
import uuid
from openai import OpenAI

from .database import get_db
from .models_v2 import FactEventTelemetry, MetricHierarchy
from .models import Node

router = APIRouter(prefix="/api/v2", tags=["v2"])

# --- Ingestion Models ---
# --- Ingestion Models ---
class TelemetryPayload(BaseModel):
    event_type: str # 'IoT', 'ERP', 'OCR'
    supplier_id: Optional[str] = None # node_name or ID
    metric_id: str
    value: float
    timestamp: Optional[str] = None # ISO 8601
    meta: Optional[Dict[str, Any]] = {}

# --- Simulation Models ---
class SimulationRequest(BaseModel):
    target_metric_id: str
    target_node_name: Optional[str] = None
    adjustment_factor: float # e.g. 1.2 (+20%), 0.5 (-50%) or absolute delta? Let's say absolute delta for simplicity
    
# --- Queue Simulation (In-Memory for Hackathon) ---
# A real implementation would use Redis/Celery
ingestion_queue = asyncio.Queue()

async def worker_processor():
    """Background worker to process events from queue."""
    # In a real app, this would be a separate process.
    # Here we invoke processing logic directly or simulating delay.
    pass 

async def process_event_task(payload: dict, db: Session):
    """
    The 'Worker' Logic:
    1. Validate & Normalize
    2. Calculate Friction
    3. Write to DB
    4. Update Real-time View (or rely on MV refresh)
    """
    try:
        # 1. Normalize Timestamp
        ts_str = payload.get('timestamp')
        if ts_str:
            try:
                recorded_at = datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
            except:
                recorded_at = datetime.utcnow() # Fallback or Lead-time Logic
        else:
            # "Missing Timestamps: Apply standard historical lead-time deduction"
            recorded_at = datetime.utcnow() 

        # 2. Resolve Node
        supplier_id = payload.get('supplier_id')
        node_id = None
        if supplier_id:
            # Simple lookup - ideally cached
            node = db.query(Node).filter(Node.node_name == supplier_id).first()
            if node:
                node_id = node.node_id
        
        # 3. Resolve Metric & Calculate Variance
        metric_id = payload.get('metric_id')
        val = payload.get('value')
        
        # Determine expected value (mock logic: expected is roughly val for now, or fetch standard)
        expected = 10.0 # Placeholder standard
        variance = val - expected
        friction = abs(variance) > 5.0 # Threshold for friction

        # 4. Write
        new_event = FactEventTelemetry(
            lineage_id=str(uuid.uuid4()),
            metric_id=metric_id,
            node_id=node_id,
            recorded_at_utc=recorded_at,
            value_actual=val,
            value_expected=expected,
            variance=variance,
            friction_flag=friction,
            event_type=payload.get('event_type')
        )
        db.add(new_event)
        
        # Refresh Materialized View? Too heavy for per-event. 
        # API queries should refreshing lazily or use a standard refresh schedule.
        # db.execute(text("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_metric_propagation;")) 
        
        db.commit()
        print(f"Processed Event: {metric_id} -> {val}")
        
    except Exception as e:
        print(f"Worker Error: {e}")
        db.rollback()


@router.post("/ingest")
async def ingest_telemetry(payload: TelemetryPayload, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Layer 1: Ingestion Gateway.
    Accepts payload, pushes to background worker (simulated queue).
    """
    # Simulate Pushing to Queue (Redis)
    # redis.xadd("telemetry_stream", payload.dict())
    
    # Using FastAPI BackgroundTasks as the "Worker"
    background_tasks.add_task(process_event_task, payload.dict(), db)
    
    return {"status": "queued", "id": str(uuid.uuid4())}

@router.post("/simulate")
def run_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    """
    Layer 5: Decision Engine.
    Calculates impact of checking a specific metric constraint.
    """
    # 1. Get current state (rolled up)
    # For MVP, we'll query the MV or aggregate from telemetry
    
    # 2. Apply "What-If" Delta in Memory
    # Logic: If we improve 'target_metric_id' by 'adjustment_factor', how does L1 change?
    
    # Fetch weight of target metric
    target_metric = db.query(MetricHierarchy).filter(MetricHierarchy.metric_id == req.target_metric_id).first()
    if not target_metric:
        raise HTTPException(status_code=404, detail="Metric not found")
        
    # Calculate propagation path: L3 -> L2 -> L1
    # Weight L3->L2 * Weight L2->L1 = Total Impact Coefficient
    
    current_impact = 0.0 # Placeholder
    
    # 3. AI Explanation
    client = OpenAI(base_url='http://localhost:11434/v1', api_key='ollama')
    
    prompt = f"""
    Simulation: Adjusting {target_metric.metric_name} by {req.adjustment_factor}.
    Context: This metric contributes to parent {target_metric.parent_metric_id}.
    
    Predict the downstream impact on Supply Chain Reliability and provide a strategic recommendation.
    """
    
    try:
        response = client.chat.completions.create(
            model="llama3.2:3b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150
        )
        ai_text = response.choices[0].message.content
    except:
        ai_text = "AI Simulation unavailable."

    return {
        "simulation_id": str(uuid.uuid4()),
        "target": target_metric.metric_name,
        "delta_applied": req.adjustment_factor,
        "projected_impact_score": 0.0, # TODO: Real math
        "ai_analysis": ai_text
    }

@router.get("/tree")
def get_metric_tree(db: Session = Depends(get_db)):
    """
    Returns the full hierarchy for React Flow.
    """
    metrics = db.query(MetricHierarchy).all()
    # Need to verify if we have data. If not, maybe return static structure?
    # Converting to nodes/edges format for React Flow
    
    nodes = []
    edges = []
    
    for m in metrics:
        # Calculate status (Green/Red) based on recent telemetry
        # Join with FactEventTelemetry -> Avg Variance
        avg_var = db.query(func.avg(FactEventTelemetry.variance))\
            .filter(FactEventTelemetry.metric_id == m.metric_id)\
            .scalar() or 0.0
            
        color = "green" if abs(avg_var) < 5 else "red"
        
        nodes.append({
            "id": m.metric_id,
            "data": { "label": m.metric_name, "level": m.level, "variance": round(avg_var, 2) },
            "position": { "x": 0, "y": 0 }, # Layout will be handled by Dagre on frontend
            "type": "custom", # or default
            "style": { "background": "#fecaca" if color == "red" else "#d1fae5", "border": "1px solid #777" } 
        })
        
        if m.parent_metric_id:
            edges.append({
                "id": f"{m.parent_metric_id}-{m.metric_id}",
                "source": m.parent_metric_id,
                "target": m.metric_id
            })
            
    return {"nodes": nodes, "edges": edges}

class ProcessGenerationRequest(BaseModel):
    supplied_good: str

@router.post("/generate-processes")
def generate_processes(req: ProcessGenerationRequest):
    """
    Generates a list of likely supply chain processes for a given good.
    """
    client = OpenAI(base_url='http://localhost:11434/v1', api_key='ollama')
    
    prompt = f"""
    List 5 standard supply chain process steps for: {req.supplied_good}.
    Return a JSON array of strings only. Example: ["Harvesting", "Processing", "Transport"].
    """
    
    try:
        response = client.chat.completions.create(
            model="llama3.2:3b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        content = response.choices[0].message.content
        # Extract JSON if wrapped in markdown
        if "```" in content:
            content = content.split("```")[1].replace("json", "").strip()
        elif "[" not in content:
            # Fallback if AI chats instead of returning JSON
            return ["Procurement", "Manufacturing", "Quality Control", "Packaging", "Shipping"]
            
        processes = json.loads(content)
        return processes
    except Exception as e:
        print(f"AI Error: {e}")
        # Fallback
        return ["Raw Material Sourcing", "Production", "Quality Check", "Logistics", "Delivery"]
