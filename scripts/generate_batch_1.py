import os

base_dir = r"g:\ERP\rmg-track\docs"
ba_dir = os.path.join(base_dir, "01_Business_Analyst")
arch_dir = os.path.join(base_dir, "02_Solution_Architect")

# Detailed Content for Batch 1

# ----------------- MODULE 02 -----------------
prd_02 = """# Product Requirements Document (PRD)
**Module:** 02 - Order Management (মার্চেন্ডাইজিং)
**Version:** 2.0 (In-depth Enterprise)
**Author:** AI Business Analyst
**Status:** 100% Production Ready

## 1. Executive Summary
The Order Management module acts as the starting point of the traceability chain. Merchandisers enter the Buyer Purchase Orders (PO) here. The system breaks down the PO into exact Style, Color, and Size ratios, linking them to the Master Data library.

## 2. User Personas
- **Merchandiser:** Creates and updates POs, defines color/size ratio.
- **Planning Manager (Read Only):** Views confirmed POs to start production planning.

## 3. User Stories
- **US02-01:** As a Merchandiser, I want to select a Buyer and Style from a dropdown (linked to Module 01) so that I don't enter duplicate data.
- **US02-02:** As a Merchandiser, I want to input a Total PO Quantity and define the breakdown (e.g., Size S: 20%, M: 40%, L: 40%) so that the system automatically calculates exact garment quantities per size.
- **US02-03:** As a Merchandiser, I want to upload a Tech Pack (PDF) so that the sampling and cutting team can view it.

## 4. Functional Requirements
### 4.1. PO Creation Rules
- `PO Number` must be strictly unique across the system.
- The `Total Quantity` must exactly match the sum of all breakdowns (`color_id`, `size_id`, `qty`). If not, the system must show a validation error and prevent saving.
- **Status Flow:** `Draft` -> `Pending Approval` -> `Confirmed`.
- Only `Confirmed` POs are visible to the Production Planning team.

### 4.2. File Uploads
- Supported formats for Tech Packs: PDF, JPG, PNG.
- Max file size: 10MB.

## 5. Non-Functional Requirements
- **Performance:** Complex breakdowns (e.g., 50 colors * 10 sizes) must be calculated and saved in under 500ms.
- **Audit Trail:** Any change to a Confirmed PO (e.g., quantity change) must log the `user_id` and timestamp.

## 6. Acceptance Criteria
- [ ] **AC1:** Creating a PO with an inactive Buyer returns HTTP 422.
- [ ] **AC2:** Editing a Confirmed PO triggers a recalculation warning if Cutting has already started.
- [ ] **AC3:** Downloading the Tech Pack works across all tablet devices.
"""

api_02 = """# API Specification & Schema Details
**Module:** 02 - Order Management
**Version:** 2.0 (In-depth Enterprise)
**Author:** Solution Architect
**Status:** 100% Production Ready

## 1. Database Schema Specifications

### Table: `purchase_orders`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| id | UUID | Primary Key | PK |
| po_number | String(100) | Unique, Not Null | E.g. PO-88992 |
| buyer_id | UUID | Foreign Key (buyers.id) | Linked from Mod 01 |
| style_id | UUID | Foreign Key (styles.id) | Linked from Mod 01 |
| total_qty | Integer | Not Null | E.g. 50000 |
| delivery_date | Date | Not Null | Shipment target |
| techpack_url | String(255)| Nullable | Path in GCS/S3 |
| status | Enum | Default 'Draft' | Draft, Confirmed |
| created_by | UUID | Foreign Key (users.id) | - |
| created_at, updated_at, deleted_at | Timestamp | - | Soft Deletes enabled |

### Table: `po_breakdowns`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| id | UUID | Primary Key | PK |
| po_id | UUID | Foreign Key (purchase_orders.id)| Cascade on delete |
| color_id | UUID | Foreign Key (colors.id) | Linked from Mod 01 |
| size_id | UUID | Foreign Key (sizes.id) | Linked from Mod 01 |
| qty | Integer | Not Null | Exact garments |

## 2. API Endpoints (Secured via Sanctum Token)

### 2.1. Create Purchase Order (POST `/api/v1/orders`)
**Headers:** `Authorization: Bearer {token}`, `Content-Type: application/json`

**Request Body:**
```json
{
  "po_number": "PO-12345",
  "buyer_id": "9b1d... (UUID)",
  "style_id": "9b1d... (UUID)",
  "total_qty": 1000,
  "delivery_date": "2026-10-15",
  "breakdowns": [
    { "color_id": "uuid-red", "size_id": "uuid-s", "qty": 300 },
    { "color_id": "uuid-red", "size_id": "uuid-m", "qty": 700 }
  ]
}
```

**Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "PO Created Successfully",
  "data": { "id": "new-po-uuid" }
}
```

**Error Response (422 Unprocessable Entity - Quantity Mismatch):**
```json
{
  "status": "error",
  "message": "Validation Failed",
  "errors": {
    "total_qty": ["Breakdown sum (1000) does not match total_qty (1001)"]
  }
}
```

### 2.2. Get Confirmed POs (GET `/api/v1/orders/confirmed`)
Used by Planning Module.
**Response:** Array of POs with nested breakdowns.
"""


# ----------------- MODULE 03 -----------------
prd_03 = """# Product Requirements Document (PRD)
**Module:** 03 - IE & Production Planning
**Version:** 2.0 (In-depth Enterprise)
**Author:** AI Business Analyst
**Status:** 100% Production Ready

## 1. Executive Summary
This module connects the Confirmed POs from Merchandising to the Factory Floor. The Industrial Engineering (IE) team calculates the Standard Minute Value (SMV) and allocates the PO to specific Sewing Lines based on capacity. 

## 2. User Personas
- **IE Manager:** Defines SMV, targets, and line allocation.
- **Store Manager:** System integration checks fabric balance.

## 3. User Stories
- **US03-01:** As an IE, I want to select a Confirmed PO and assign it to "Line 01" so that the cutting team knows where to send the bundles.
- **US03-02:** As an IE, I want to input the SMV and Manpower for a line so the system calculates the Target DHU (Hourly Target).
- **US03-03:** As an IE, I want the system to warn me if Fabric/Accessories are not in-house (checked against Module 10) before I lock the plan.

## 4. Functional Requirements
### 4.1. Calculations
- **Target per Hour:** `(Manpower * 60) / SMV * Target_Efficiency_Percentage`
- Example: (30 operators * 60) / 15 SMV * 60% = 72 pcs/hour.

### 4.2. Material Readiness Check (Strict Rule)
- When clicking "Confirm Plan", the system makes an internal API call to the Store Module (`Module 10`).
- It checks if `PO Required Qty <= Store Allocated Balance`.
- If False, a modal warning appears: "Material Shortage! Fabric is not completely in-house. Do you still want to proceed at risk?"

## 5. Non-Functional Requirements
- Dashboard calendar view showing line allocations must load within 1 second using Redis caching.

## 6. Acceptance Criteria
- [ ] **AC1:** Hourly target calculation matches manual IE formulas exactly.
- [ ] **AC2:** Attempting to assign a PO to a Line that is already fully booked for those dates throws a Schedule Conflict error.
"""

api_03 = """# API Specification & Schema Details
**Module:** 03 - IE & Production Planning
**Version:** 2.0 (In-depth Enterprise)
**Author:** Solution Architect
**Status:** 100% Production Ready

## 1. Database Schema Specifications

### Table: `production_plans`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| id | UUID | Primary Key | PK |
| po_id | UUID | Foreign Key | From Module 02 |
| line_id | UUID | Foreign Key | From Module 01 |
| start_date | Date | Not Null | - |
| end_date | Date | Not Null | - |
| smv | Decimal(5,2) | Not Null | Standard Minute Value |
| manpower | Integer | Not Null | Total operators |
| efficiency_target| Decimal(5,2) | Not Null | E.g. 60.50 (%) |
| hourly_target | Integer | Computed | - |
| is_locked | Boolean | Default False| Locked for production |

## 2. API Endpoints

### 2.1. Create/Calculate Plan (POST `/api/v1/planning/calculate`)
**Request Body:**
```json
{
  "po_id": "uuid",
  "line_id": "uuid",
  "start_date": "2026-09-01",
  "end_date": "2026-09-10",
  "smv": 15.5,
  "manpower": 45,
  "efficiency_target": 65
}
```
**Success Response:** Returns the calculated `hourly_target` and checks for line conflicts.

### 2.2. Lock Plan & Material Check (POST `/api/v1/planning/{id}/lock`)
**Internal Logic:** Invokes Store API service.
**Response (200 OK - Warning):**
```json
{
  "status": "warning",
  "message": "Fabric balance is 80%. Proceed with risk?",
  "requires_override": true
}
```
"""


# ----------------- MODULE 04 -----------------
prd_04 = """# Product Requirements Document (PRD)
**Module:** 04 - Cutting & Bundle Ticket
**Version:** 2.0 (In-depth Enterprise)
**Author:** AI Business Analyst
**Status:** 100% Production Ready

## 1. Executive Summary
This is where Traceability physically begins. The cutting room cuts fabric based on the IE plan and generates unique QR Codes for every bundle. These QR codes act as the digital passport for the garments.

## 2. User Personas
- **Cutting Master:** Enters cut details, ply count, and shade.
- **Barcode Operator:** Prints bundle tickets.

## 3. User Stories
- **US04-01:** As a Cutting Master, I want to input the number of plies and table length so the system calculates the cut quantity.
- **US04-02:** As a Cutting Master, I want to specify the Shade Band (e.g., A, B, C) for the cut so that color shading issues are tracked.
- **US04-03:** As a Barcode Operator, I want the system to automatically generate bundles of a specific ratio (e.g., 50 pcs per bundle) and generate printable QR code PDFs.

## 4. Functional Requirements
### 4.1. Excess Cutting Logic
- Factories often cut 2-3% extra for rejections.
- System must allow `Cut Qty > PO Qty`.
- Formula: `Variance % = ((Total Cut - PO Breakdown Qty) / PO Breakdown Qty) * 100`.
- If Variance > 5%, Manager override/approval is required.

### 4.2. Bundle Generation Rule
- If Cut Qty = 120 and Bundle Size = 50.
- System generates: Bundle 1 (50 pcs), Bundle 2 (50 pcs), Bundle 3 (20 pcs).
- Bundle ID format: `{PO_ID}-{Cut_No}-{Size}-{Bundle_Serial}`

## 5. Non-Functional Requirements
- QR Code generation library must support bulk PDF creation (e.g., 500 tags per page) without crashing the server. Queue jobs (Redis) must be used.

## 6. Acceptance Criteria
- [ ] **AC1:** Scanning a generated QR code with any standard scanner resolves to the correct UUID in the system.
- [ ] **AC2:** Attempting to cut 10% excess without manager approval blocks the save action.
"""

api_04 = """# API Specification & Schema Details
**Module:** 04 - Cutting & Bundle Ticket
**Version:** 2.0 (In-depth Enterprise)
**Author:** Solution Architect
**Status:** 100% Production Ready

## 1. Database Schema Specifications

### Table: `cut_registers`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| id | UUID | Primary Key | PK |
| po_id | UUID | Foreign Key | - |
| color_id | UUID | Foreign Key | - |
| cut_no | Integer | Auto-increment per PO | E.g. Cut-01 |
| shade | String(20) | Nullable | A, B, C etc. |
| table_no | String(50) | Nullable | - |

### Table: `bundles`
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| id | UUID | Primary Key | PK |
| cut_id | UUID | Foreign Key | Linked to cut |
| size_id | UUID | Foreign Key | Linked to size |
| qr_code | String(100) | Unique, Indexed | The actual barcode text |
| pcs_qty | Integer | Not Null | Number of garments |
| status | Enum | Default 'Cut' | Cut, Sewing, QC, Packed |

## 2. API Endpoints

### 2.1. Save Cut & Dispatch Queue (POST `/api/v1/cutting`)
**Request Body:**
```json
{
  "po_id": "uuid",
  "color_id": "uuid",
  "table_no": "Table-2",
  "shade": "Shade-A",
  "sizes": [
    { "size_id": "uuid", "plies": 100, "ratio": 1, "bundle_size_limit": 50 }
  ]
}
```

**Success Response (202 Accepted):**
```json
{
  "status": "queued",
  "message": "Cut saved. Bundle generation running in background.",
  "job_id": "redis-job-xyz"
}
```

### 2.2. Print QR Tags (GET `/api/v1/cutting/{cut_id}/print`)
**Response:** Generates and returns a downloadable PDF stream containing the QR codes.
"""

# Write files
with open(os.path.join(ba_dir, "PRD_02_Order_Management.md"), "w", encoding="utf-8") as f: f.write(prd_02)
with open(os.path.join(arch_dir, "API_Spec_02_Order_Management.md"), "w", encoding="utf-8") as f: f.write(api_02)

with open(os.path.join(ba_dir, "PRD_03_Production_Planning.md"), "w", encoding="utf-8") as f: f.write(prd_03)
with open(os.path.join(arch_dir, "API_Spec_03_Production_Planning.md"), "w", encoding="utf-8") as f: f.write(api_03)

with open(os.path.join(ba_dir, "PRD_04_Cutting_Bundle_Ticket.md"), "w", encoding="utf-8") as f: f.write(prd_04)
with open(os.path.join(arch_dir, "API_Spec_04_Cutting_Bundle_Ticket.md"), "w", encoding="utf-8") as f: f.write(api_04)

print("Batch 1 Detailed Documents Generated Successfully.")
