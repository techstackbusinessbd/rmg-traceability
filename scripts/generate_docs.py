import os

base_dir = r"g:\ERP\rmg-track\docs"
ba_dir = os.path.join(base_dir, "01_Business_Analyst")
arch_dir = os.path.join(base_dir, "02_Solution_Architect")
qa_dir = os.path.join(base_dir, "05_QA_Engineer")
fe_dir = os.path.join(base_dir, "04_Frontend_Developer")

os.makedirs(qa_dir, exist_ok=True)
os.makedirs(fe_dir, exist_ok=True)

modules = [
    ("02", "Order_Management", "Order Management (মার্চেন্ডাইজিং)"),
    ("03", "Production_Planning", "IE & Production Planning"),
    ("04", "Cutting_Bundle_Ticket", "Cutting & Bundle Ticket"),
    ("05", "Value_Addition", "Value Addition"),
    ("06", "Sewing_Line_Tracking", "Sewing & Line Tracking"),
    ("07", "Quality_Control", "Quality Control"),
    ("08", "Washing_Finishing", "Washing & Finishing"),
    ("09", "Packing_Shipment", "Packing & Shipment"),
    ("10", "Fabric_Accessories_Store", "Fabric & Accessories Store"),
    ("12", "BI_Analytics_Dashboard", "BI & Analytics Dashboard")
]

# Generate BA PRDs
for mod_num, mod_name, title in modules:
    content = f"""# Product Requirements Document (PRD)
**Module:** {mod_num} - {title}
**Author:** AI Business Analyst
**Status:** Approved for Design Phase

## 1. Module Overview
This module covers the core business logic for {title} as defined in the Master BRD.

## 2. Target Users
- Relevant Floor Users & Managers

## 3. Data Entities
- Core entities for {title} will be managed here.

## 4. Acceptance Criteria
- [ ] **AC 1:** System must enforce sequential processing rules.
- [ ] **AC 2:** Offline sync capability must be supported if tablet-based.
"""
    file_path = os.path.join(ba_dir, f"PRD_{mod_num}_{mod_name}.md")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# Generate Architect API Specs
for mod_num, mod_name, title in modules:
    content = f"""# API Specification & Schema Details
**Module:** {mod_num} - {title}
**Author:** Solution Architect
**Status:** Draft

## 1. Database Schema Specifications
Schema designs for {title} will be detailed here, following the UUID and timestamp conventions.

## 2. API Endpoints
Endpoints for {title} operations (e.g., Scan IN/OUT, CRUD operations).

### 2.1. Basic Endpoint
**Endpoint:** `POST /api/v1/{mod_name.lower().replace('_', '-')}`
**Auth Required:** Yes
"""
    file_path = os.path.join(arch_dir, f"API_Spec_{mod_num}_{mod_name}.md")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# Generate Placeholders
qa_content = """# QA Test Strategy Master
**Author:** QA Engineer
**Scope:** Defines the testing methodology (Positive, Negative, Boundary) for all modules.
"""
with open(os.path.join(qa_dir, "Test_Strategy_Master.md"), "w", encoding="utf-8") as f:
    f.write(qa_content)

fe_content = """# UI/UX Guidelines
**Author:** Frontend/Android Developer
**Scope:** Defines the UI components, colors, and layout rules for tablet apps and admin web panels.
"""
with open(os.path.join(fe_dir, "UI_UX_Guidelines.md"), "w", encoding="utf-8") as f:
    f.write(fe_content)

print("Successfully generated all documents.")
