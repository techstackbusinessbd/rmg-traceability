import os

base_dir = r"g:\ERP\rmg-track\docs"
ba_dir = os.path.join(base_dir, "01_Business_Analyst")
arch_dir = os.path.join(base_dir, "02_Solution_Architect")

# Detailed Content for Batch 2 & 3

# --- Mod 5 ---
prd_05 = """# Product Requirements Document (PRD)
**Module:** 05 - Value Addition
**Version:** 3.0 (Enterprise Manual Details)
**Status:** Ready

## 1. Executive Summary
Tracks bundles sent outside the regular line for Embroidery or Printing. Requires exact in/out matching to prevent bundle mixing.

## 2. Functional Requirements
- **Challan System:** Bundles must be grouped into a Delivery Challan.
- **Variance Calculation:** If Sent = 100, Received = 98. System must prompt for Reason (Reject/Lost).
- **Blocker:** Sewing cannot scan a bundle if it is marked as "In Value Addition".

## 3. API & Offline Rules
- Transactions must sync within 5 minutes. Tablets must store local challans.
"""
api_05 = """# API Specification & Schema Details
**Module:** 05 - Value Addition

### Table: `value_additions`
- `id` UUID PK
- `bundle_id` UUID FK
- `process_type` Enum (Print, Embroidery)
- `status` Enum (Sent, Received, Rejected)
- `challan_no` String

### API Endpoints
`POST /api/v1/value-addition/send`
`POST /api/v1/value-addition/receive`
Requires array of bundle QR codes.
"""

# --- Mod 6 ---
prd_06 = """# Product Requirements Document (PRD)
**Module:** 06 - Sewing & Line Tracking
**Version:** 3.0 (Enterprise Manual Details)

## 1. Executive Summary
Core of tracing. Operators scan QR codes at the start (Input) and end (Output) of the sewing line.

## 2. Functional Requirements
- **WIP Calculation:** `Total Input - Total Output = Line WIP`.
- **Offline Sync:** If Wi-Fi fails, Android tablet saves scans in local SQLite database. When Wi-Fi restores, pushes via bulk API.
- **Strict Validation:** A bundle scanned as Input in Line 1 cannot be scanned as Output in Line 2 without a formal Line Transfer approval.

## 3. Acceptance Criteria
- [ ] Scan speed < 200ms.
- [ ] Duplicate scan shows red warning modal.
"""
api_06 = """# API Specification & Schema Details
**Module:** 06 - Sewing

### Table: `sewing_transactions`
- `id` UUID PK
- `bundle_id` UUID FK
- `line_id` UUID FK
- `operation_type` Enum (Input, Output)
- `scanned_at` Timestamp

### API Endpoints
`POST /api/v1/sewing/scan`
Payload:
```json
{
  "line_id": "uuid",
  "scans": [
    {"qr": "BNDL-001", "type": "Input", "time": "2026-08-28T10:00:00"}
  ]
}
```
"""

# --- Mod 7 ---
prd_07 = """# Product Requirements Document (PRD)
**Module:** 07 - Quality Control
**Version:** 3.0 (Enterprise Manual Details)

## 1. Executive Summary
Defect tracking at the end of the sewing line. Logs DHU (Defect Hundred Units).

## 2. Functional Requirements
- **DHU Formula:** `(Total Defects / Total Inspected) * 100`.
- **Rework Loop:** A bundle marked with "Alter" cannot proceed to Washing. It must be fixed and re-scanned as "Pass".
- **Defect Library:** Dropdown of standard defects (e.g. Broken Stitch, Puckering, Oil Spot).

## 3. Acceptance Criteria
- [ ] Auto-calculates DHU real-time on tablet.
"""
api_07 = """# API Specification & Schema Details
**Module:** 07 - QC

### Table: `qc_inspections`
- `id` UUID PK
- `bundle_id` UUID FK
- `status` Enum (Pass, Alter, Reject)
- `dhu` Decimal

### API Endpoints
`POST /api/v1/qc/inspect`
Payload:
```json
{
  "bundle_id": "uuid",
  "pass_qty": 48,
  "defects": [{"type": "Stitch", "qty": 2}]
}
```
"""

# --- Mod 8 ---
prd_08 = """# Product Requirements Document (PRD)
**Module:** 08 - Washing & Finishing
**Version:** 3.0 (Enterprise Manual Details)

## 1. Executive Summary
Post-sewing operations. Tracks batches inside washing machines and final measurements.

## 2. Functional Requirements
- **Batch Tracking:** 10 bundles are grouped into 1 Wash Batch.
- **Finishing QC:** Ironing and folding QC.
"""
api_08 = """# API Specification & Schema Details
**Module:** 08 - Washing & Finishing

### Table: `wash_batches`
- `id` UUID PK
- `machine_no` String
- `total_qty` Integer
"""

# --- Mod 9 ---
prd_09 = """# Product Requirements Document (PRD)
**Module:** 09 - Packing & Shipment
**Version:** 3.0 (Enterprise Manual Details)

## 1. Executive Summary
Final step. Bundles are packed into Cartons. Cartons into Containers.

## 2. Functional Requirements
- **Carton Generation:** System generates Carton Barcodes.
- **Validation:** Only QC-Passed bundles can be packed.
- **Shipment Manifest:** Generates PDF packing list for customs.
"""
api_09 = """# API Specification & Schema Details
**Module:** 09 - Packing

### Table: `cartons`
- `id` UUID PK
- `po_id` UUID FK
- `barcode` String Unique
"""

# --- Mod 10 ---
prd_10 = """# Product Requirements Document (PRD)
**Module:** 10 - Fabric & Accessories Store
**Version:** 3.0 (Enterprise Manual Details)

## 1. Executive Summary
Inventory management. Directly feeds the Material Readiness check in Module 3.

## 2. Functional Requirements
- **MRR (Material Receive Report):** Entry of fabrics against Supplier PO.
- **Allocation:** Fabric must be explicitly allocated to a Buyer PO.
"""
api_10 = """# API Specification & Schema Details
**Module:** 10 - Store

### Table: `inventory`
- `id` UUID PK
- `item_code` String
- `balance` Decimal
- `allocated_po_id` UUID FK
"""

# --- Mod 12 ---
prd_12 = """# Product Requirements Document (PRD)
**Module:** 12 - BI & Analytics
**Version:** 3.0 (Enterprise Manual Details)

## 1. Executive Summary
Live management dashboards.

## 2. Functional Requirements
- **Metrics:** Factory DHU, Line Efficiency, Order Status.
- **Caching:** Redis cache updated every 5 minutes.
"""
api_12 = """# API Specification & Schema Details
**Module:** 12 - Analytics

### API Endpoints
`GET /api/v1/dashboard/metrics`
"""

files_to_write = {
    os.path.join(ba_dir, "PRD_05_Value_Addition.md"): prd_05,
    os.path.join(arch_dir, "API_Spec_05_Value_Addition.md"): api_05,
    os.path.join(ba_dir, "PRD_06_Sewing_Line_Tracking.md"): prd_06,
    os.path.join(arch_dir, "API_Spec_06_Sewing_Line_Tracking.md"): api_06,
    os.path.join(ba_dir, "PRD_07_Quality_Control.md"): prd_07,
    os.path.join(arch_dir, "API_Spec_07_Quality_Control.md"): api_07,
    os.path.join(ba_dir, "PRD_08_Washing_Finishing.md"): prd_08,
    os.path.join(arch_dir, "API_Spec_08_Washing_Finishing.md"): api_08,
    os.path.join(ba_dir, "PRD_09_Packing_Shipment.md"): prd_09,
    os.path.join(arch_dir, "API_Spec_09_Packing_Shipment.md"): api_09,
    os.path.join(ba_dir, "PRD_10_Fabric_Accessories_Store.md"): prd_10,
    os.path.join(arch_dir, "API_Spec_10_Fabric_Store.md"): api_10,
    os.path.join(ba_dir, "PRD_12_BI_Analytics_Dashboard.md"): prd_12,
    os.path.join(arch_dir, "API_Spec_12_Analytics.md"): api_12,
}

for path, content in files_to_write.items():
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Batch 2 & 3 Detailed Documents Generated Manually Successfully.")
