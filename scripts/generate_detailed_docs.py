import os

base_dir = r"g:\ERP\rmg-track\docs"
ba_dir = os.path.join(base_dir, "01_Business_Analyst")
arch_dir = os.path.join(base_dir, "02_Solution_Architect")
qa_dir = os.path.join(base_dir, "05_QA_Engineer")
fe_dir = os.path.join(base_dir, "04_Frontend_Developer")

# Detailed Content Dictionary
module_details = {
    "02": {
        "name": "Order_Management",
        "title": "Order Management (মার্চেন্ডাইজিং)",
        "prd_logic": "- Purchase Order (PO) breakdown by Color/Size ratio.\n- Integration with Master Data for Buyer and Style validation.\n- Calculation of Total Order Qty and mapping with delivery dates.",
        "api_schema": "| po_number | String | Unique |\n| total_qty | Integer | - |\n| delivery_date | Date | - |",
        "api_payload": '{\n  "po_number": "PO-9988",\n  "style_id": "uuid",\n  "breakdowns": [{"color_id": "uuid", "size_id": "uuid", "qty": 5000}]\n}'
    },
    "03": {
        "name": "Production_Planning",
        "title": "IE & Production Planning",
        "prd_logic": "- Standard Minute Value (SMV) calculation per style.\n- Line capacity allocation based on operator efficiency.\n- Material Readiness Warning: API must check Store (Module 10) balance before allowing plan confirmation.",
        "api_schema": "| plan_id | UUID | Primary |\n| line_id | UUID | Foreign |\n| smv | Decimal(5,2) | - |\n| target_qty | Integer | - |",
        "api_payload": '{\n  "po_id": "uuid",\n  "line_id": "uuid",\n  "smv": 12.5,\n  "target_dhu": 2.5\n}'
    },
    "04": {
        "name": "Cutting_Bundle_Ticket",
        "title": "Cutting & Bundle Ticket",
        "prd_logic": "- Auto-generation of unique QR Codes per bundle.\n- Calculation of Excess Cutting % compared to PO qty.\n- Shade and Roll tracking integration for fabric utilization.",
        "api_schema": "| bundle_no | String | Unique QR |\n| cut_no | Integer | - |\n| qty | Integer | Max 100 |\n| shade | String | - |",
        "api_payload": '{\n  "po_id": "uuid",\n  "cut_no": 1,\n  "bundles": [{"size_id": "uuid", "qty": 50, "qr_code": "BNDL-001"}]\n}'
    },
    "05": {
        "name": "Value_Addition",
        "title": "Value Addition (Print/Embroidery)",
        "prd_logic": "- Tracking bundles sent to external/internal print and embroidery.\n- Receive bundles with variance tracking (Reject/Missing calculation).",
        "api_schema": "| send_challan | String | Unique |\n| process_type | String | Print/Emb |\n| total_sent | Integer | - |",
        "api_payload": '{\n  "bundle_qr": "BNDL-001",\n  "process": "Embroidery",\n  "status": "Sent"\n}'
    },
    "06": {
        "name": "Sewing_Line_Tracking",
        "title": "Sewing & Line Tracking",
        "prd_logic": "- Scan IN / Scan OUT of bundles via tablet.\n- Real-time Hourly Production tracking.\n- Must support Offline Sync: Data saves locally in SQLite if network drops, bulk syncs when online.",
        "api_schema": "| transaction_id | UUID | - |\n| bundle_id | UUID | Foreign |\n| operation | String | IN/OUT |\n| scanned_at | Timestamp | - |",
        "api_payload": '{\n  "bundle_qr": "BNDL-001",\n  "line_id": "uuid",\n  "action": "SCAN_IN",\n  "timestamp": "2026-08-28T10:00:00Z"\n}'
    },
    "07": {
        "name": "Quality_Control",
        "title": "Quality Control (QC)",
        "prd_logic": "- Defect logging per garment (Alter, Spot, Reject).\n- Defect Hundred Units (DHU) calculation real-time.\n- Rework loop: Altered garments must be re-scanned.",
        "api_schema": "| defect_type | Enum | Alter,Reject |\n| defect_name | String | E.g. Open Seam |\n| qty | Integer | - |",
        "api_payload": '{\n  "bundle_qr": "BNDL-001",\n  "pass_qty": 48,\n  "defects": [{"type": "Alter", "name": "Skip Stitch", "qty": 2}]\n}'
    },
    "08": {
        "name": "Washing_Finishing",
        "title": "Washing & Finishing",
        "prd_logic": "- Batch tracking for washing machines.\n- Thread cutting, ironing, and final measurement pass/fail tracking.",
        "api_schema": "| batch_no | String | Unique |\n| machine_id | String | - |\n| total_qty | Integer | - |",
        "api_payload": '{\n  "batch_no": "WASH-101",\n  "bundles": ["BNDL-001", "BNDL-002"],\n  "status": "Completed"\n}'
    },
    "09": {
        "name": "Packing_Shipment",
        "title": "Packing & Shipment",
        "prd_logic": "- Scanning bundles into Cartons.\n- Auto-generating Carton Barcodes/QR.\n- Packing List generation and Container loading validation against PO.",
        "api_schema": "| carton_no | String | Unique QR |\n| po_id | UUID | Foreign |\n| total_garments | Integer | - |",
        "api_payload": '{\n  "carton_no": "CRT-9001",\n  "po_id": "uuid",\n  "bundles_packed": ["BNDL-001"]\n}'
    },
    "10": {
        "name": "Fabric_Accessories_Store",
        "title": "Fabric & Accessories Store",
        "prd_logic": "- MRR (Material Receive Report) logging.\n- Real-time inventory balance calculation.\n- Allocation of materials to specific POs to trigger Planning Module warnings.",
        "api_schema": "| item_name | String | - |\n| received_qty | Decimal | - |\n| allocated_po | UUID | Foreign |",
        "api_payload": '{\n  "item_code": "FAB-001",\n  "received_qty": 15000.50,\n  "uom": "Yards",\n  "po_id": "uuid"\n}'
    },
    "12": {
        "name": "BI_Analytics_Dashboard",
        "title": "BI & Analytics Dashboard",
        "prd_logic": "- Aggregation of DHU, Efficiency %, and WIP (Work In Progress).\n- Data caching strategy for fast dashboard loading.\n- Role-based widget visibility (Management vs Line Supervisor).",
        "api_schema": "| metric_name | String | - |\n| metric_value | Decimal | - |\n| calculated_at | Timestamp | - |",
        "api_payload": '{\n  "dashboard_type": "Management",\n  "date_range": "Today"\n}'
    }
}

# Update BA PRDs
for mod, data in module_details.items():
    content = f"""# Product Requirements Document (PRD) - ENTERPRISE READY
**Module:** {mod} - {data['title']}
**Author:** AI Business Analyst
**Status:** 100% Production Ready

## 1. Module Overview
This module handles the enterprise-grade business logic for {data['title']}. It strictly follows the rules defined in the RMG Master Traceability Architecture.

## 2. Detailed Business Logic
{data['prd_logic']}

## 3. Data Entities
- Core transactional tables will use `UUID` primary keys.
- Historical data will be preserved using Soft Deletes.

## 4. Acceptance Criteria (QA Rules)
- [ ] **AC 1:** System must enforce strict QR code sequence validation (Cannot scan in Packing if not passed QC).
- [ ] **AC 2:** All API transactions must complete within 200ms to support factory floor speed.
- [ ] **AC 3:** Offline mode must queue failed requests and retry automatically when network is restored.
"""
    file_path = os.path.join(ba_dir, f"PRD_{mod}_{data['name']}.md")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# Update Architect API Specs
for mod, data in module_details.items():
    content = f"""# API Specification & Schema Details - ENTERPRISE READY
**Module:** {mod} - {data['title']}
**Author:** Solution Architect
**Status:** 100% Production Ready

## 1. Database Schema Specifications
### Primary Table Structure
{data['api_schema']}
*(All tables include standard `id` (UUID), `created_at`, `updated_at`, `deleted_at`)*

## 2. API Endpoints
All endpoints are secured via JWT/Sanctum and require valid RBAC permissions.

### 2.1. Main Transaction Endpoint
**Endpoint:** `POST /api/v1/transaction/{data['name'].lower().replace('_', '-')}`
**Auth Required:** Yes (Bearer Token)

**Request Body (JSON - Offline Sync Compatible):**
```json
{data['api_payload']}
```

**Success Response (200 OK):**
```json
{{
  "status": "success",
  "message": "Transaction recorded successfully.",
  "sync_id": "sync-req-5542"
}}
```
"""
    file_path = os.path.join(arch_dir, f"API_Spec_{mod}_{data['name']}.md")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# Update QA Master
qa_content = """# QA Test Strategy Master - ENTERPRISE READY
**Author:** QA Engineer

## 1. Testing Methodology
- **Positive Testing:** Ensure standard RMG flow (Cutting -> Sewing -> QC -> Packing) works via QR scans.
- **Negative Testing:** Attempt to bypass steps (e.g. Packing before QC). System must block and return HTTP 403/422.
- **Load Testing:** Simulate 500 tablets sending API requests concurrently using JMeter.

## 2. Offline Sync Testing
- Turn off tablet Wi-Fi -> Scan 50 bundles -> Turn on Wi-Fi -> Verify all 50 bundles synced in correct chronological order using local timestamps.
"""
with open(os.path.join(qa_dir, "Test_Strategy_Master.md"), "w", encoding="utf-8") as f:
    f.write(qa_content)

# Update FE Guidelines
fe_content = """# UI/UX Guidelines - ENTERPRISE READY
**Author:** Frontend/Android Developer

## 1. Factory Floor Tablet UI (React/Android)
- **Theme:** Dark mode by default to reduce battery consumption and eye strain on the factory floor.
- **Buttons:** Extra large touch targets (min 48x48dp) for operators wearing gloves or working fast.
- **Indicators:** Prominent Offline/Online indicator at the top right.

## 2. Admin Web Panel (React/Tailwind)
- **Data Tables:** Server-side pagination, global search, and export to Excel/CSV.
- **Charts:** Use Recharts or Chart.js for real-time DHU and Efficiency rendering.
"""
with open(os.path.join(fe_dir, "UI_UX_Guidelines.md"), "w", encoding="utf-8") as f:
    f.write(fe_content)

print("Successfully injected detailed enterprise logic into all documents.")
