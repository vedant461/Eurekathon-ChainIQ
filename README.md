# ChainIQ: AI-Driven Supply Chain Intelligence Platform

ChainIQ is a next-generation Supply Chain Control Tower designed to bridge the gap between **Retailers** and **Suppliers**. It leverages **Generative AI**, **Real-Time Telemetry**, and **Predictive Analytics** to optimize order fulfillment, detect bottlenecks, and automate supplier coordination.

## 🚀 Project Overview

The platform provides a dual-persona interface:
1.  **Retailer Control Tower**: detailed visibility into "Active Order Networks", supplier performance, and AI-driven exception alerts.
2.  **Supplier Operating System**: tools for suppliers to receive orders, track production steps (Pizza Tracker), and monitor their own performance metrics (OTIF, Variance).

A key diffrentiator is the **Live ERP Simulator**, which allows users to simulate the lifecycle of an order in real-time to demonstrate the platform's responsiveness.

---

## ✨ Key Features

### 1. 🏢 Retailer Control Tower
-   **Active Order Network**: Real-time table of all in-flight orders with status and variance highlighting.
-   **AI Exception Alerts**: Proactive notifications about potential delays (e.g., "Predicted 4h delay in Shipping").
-   **KPI Dashboard**: High-level metrics for Active Orders, Orders at Risk, and On-Time-In-Full (OTIF) rates.

### 2. 🏭 Supplier Dashboard ("My Performance")
-   **Live Analytics**: Real-time scorecards triggered by completed orders.
-   **Bottleneck Analysis**: Visual charts identifying which process steps (e.g., "Raw Material Sourcing") are causing the most delays.
-   **Zero-State Guidance**: Helpful empty states that guide new suppliers to complete their first order.

### 3. 📦 Order Tracker ("Pizza Tracker")
-   **Vertical Lineage**: A granular, step-by-step timeline of an order's journey (Order Placed -> Processing -> Quality -> Logistics -> Delivered).
-   **Multi-Tier Visibility**: Ability to see sub-tier dependencies (e.g., a Tier 1 supplier waiting on a Tier 2 farm).
-   **Order Diagnostics (AI)**: An "AI Recovery Agent" that analyzes telemetry to suggest recovery protocols for delayed orders.

### 4. 🛍️ B2B Marketplace & Interactive Ordering
-   **Supplier Discovery**: Search and filter suppliers by capability and location.
-   **Order Execution**: Seamless workflow to place orders, which are instantly transmitted to the supplier's inbox.
-   **Interactive Webhook**: Orders accepted in the inbox generate a unique `Batch ID` and initialize a live tracking session.

### 5. 🎮 Live ERP Simulator
-   **Simulation Engine**: A debug tool that mimics an external ERP system.
-   **Step-by-Step Execution**: Users can manually "complete" production steps (e.g., "Roasting Done") to trigger updates in the main dashboard.
-   **Auto-Complete Logic**: When all steps are finished, the system automatically marks the order as `COMPLETED` and updates performance analytics.

---

## 🏗️ Technical Architecture

### Frontend (`/figma_frontend`)
-   **Framework**: React (Vite)
-   **Styling**: TailwindCSS (Custom configuration for "Premium" aesthetics)
-   **Charts**: Recharts (Responsive, animated visualizations)
-   **Icons**: Lucide React
-   **State/API**: Axios for fetching data from the Python backend.

### Backend (`/backend`)
-   **Framework**: FastAPI (High-performance Async Python)
-   **Database**: PostgreSQL (via SQLAlchemy ORM)
    -   *Note*: Includes an **In-Memory State (`LIVE_ORDER_DB`)** overlay to support high-frequency updates during the demo without hammering the DB.
    -   **State Hydration**: Robust logic ensures the in-memory state is reconstructed from Postgres if the server restarts.
-   **AI Engine**: Integrated with **OpenAI** (or Ollama) to generate natural language insights for the "Order Diagnostics" feature.

### Data Flow
1.  **Order Creation**: Retailer places order via API -> Stored in Postgres (`PENDING`).
2.  **Acceptance**: Supplier accepts order -> Status updates to `IN_PROGRESS`, `Batch ID` generated, In-Memory State initialized.
3.  **Live Tracking**: 
    -   ERP Simulator sends `POST /api/v2/webhook/erp`.
    -   Backend updates `LIVE_ORDER_DB` and broadcasts changes.
    -   Frontend polls `GET /tracker/{batch_id}` to update the UI visuals.
4.  **Completion**: 
    -   Webhook detects all steps are `Completed`.
    -   Order status updates to `COMPLETED` in Postgres.
5.  **Analytics**: `GET /supplier/{id}/performance` aggregates verified data to update the Supplier Dashboard.

---

## 🛠️ How to Run

### Prerequisites
-   Python 3.10+
-   Node.js 16+
-   PostgreSQL (Running locally or hosted)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Run Database Migrations / Seed Data
python seed_data.py 

# Start Server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd figma_frontend/chainIQ
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

---

## 🧩 Default Login / Testing Persona
-   **Supplier ID**: `sup-001` (Verdant Valley Growers)
-   **Retailer ID**: `ret-001` (Global Coffee Co)

Use these IDs when testing endpoints or logging in (if auth is enabled).