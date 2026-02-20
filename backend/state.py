# Global In-Memory State (Simulating a DB for Hackathon / Phase 21+)
# Moved here to avoid circular imports between main.py and api_v2.py

LIVE_ORDER_DB = {
    "ORD-2024-001": {
        "order_id": "ORD-2024-001",
        "product_name": "Premium Arabica Beans (Batch #404)",
        "quantity": 500,
        "supplier_name": "Verdant Valley Growers",
        "date_promised": "Oct 12",
        "date_actual_projected": "Oct 12", # Initially on time
        "telemetry": [
            {
                "step_name": "Raw Material Sourcing",
                "status": "Completed",
                "variance_hrs": 0.5,
                "timestamp": "Oct 10, 08:00 AM",
                "sub_tracks": [
                    {
                        "step_name": "Tier 2 Farm Harvesting (Valley Farms)",
                        "status": "Completed",
                        "variance_hrs": 0.2,
                        "timestamp": "Oct 10, 09:00 AM"
                    },
                    {
                        "step_name": "Tier 2 Salt Mining (OceanMin)",
                        "status": "Completed",
                        "variance_hrs": 0.1,
                        "timestamp": "Oct 10, 10:00 AM"
                    }
                ]
            },
            {
                "step_name": "Tier 1 Processing",
                "status": "Completed",
                "variance_hrs": 1.2,
                "timestamp": "Oct 11, 02:00 PM",
                "sub_tracks": [
                     {
                        "step_name": "Roasting",
                        "status": "Completed",
                        "variance_hrs": 0.5,
                        "timestamp": "Oct 11, 03:00 PM"
                    },
                    {
                        "step_name": "Quality Control",
                        "status": "Completed",
                        "variance_hrs": 0,
                        "timestamp": "Oct 11, 04:00 PM"
                    },
                    {
                        "step_name": "Packaging",
                        "status": "Completed",
                        "variance_hrs": 0.7,
                        "timestamp": "Oct 11, 06:00 PM"
                    }
                ]
            },
            {
                "step_name": "Retail Logistics",
                "status": "Completed",
                "variance_hrs": 0.8,
                "timestamp": "Oct 12, 10:00 AM",
                "sub_tracks": [
                    {
                        "step_name": "Shipping",
                        "status": "Completed",
                        "variance_hrs": 0.3,
                        "timestamp": "Oct 12, 11:00 AM"
                    },
                    {
                        "step_name": "Delivery",
                        "status": "Completed",
                        "variance_hrs": 0.5,
                        "timestamp": "Oct 12, 01:00 PM"
                    }
                ]
            }
        ]
    }
}
