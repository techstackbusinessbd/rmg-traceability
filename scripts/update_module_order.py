import os
import re

ROOT_DIR = r"g:\ERP\rmg-tracibility"
DOCS_DIR = os.path.join(ROOT_DIR, "docs")

# Mapping: Old Module Num -> New Module Num
# 11 -> 01
# 01 -> 02
# 02 -> 03
# 03 -> 04
# 04 -> 05
# 05 -> 06
# 06 -> 07
# 07 -> 08
# 08 -> 09
# 09 -> 10
# 10 -> 11
# 12 -> 12

module_meta = {
    "11": {"new_num": "01", "name": "System Admin & Auth (RBAC, Device Auth)", "short": "Auth_Admin"},
    "01": {"new_num": "02", "name": "Master Data Management", "short": "Master_Data"},
    "02": {"new_num": "03", "name": "Order Management", "short": "Order_Management"},
    "03": {"new_num": "04", "name": "Production Planning & IE", "short": "Production_Planning"},
    "04": {"new_num": "05", "name": "Cutting & Bundle Ticketing", "short": "Cutting"},
    "05": {"new_num": "06", "name": "Value Addition (Printing/Embroidery)", "short": "Value_Addition"},
    "06": {"new_num": "07", "name": "Sewing & Line Tracking", "short": "Sewing"},
    "07": {"new_num": "08", "name": "Quality Control (QC)", "short": "QC"},
    "08": {"new_num": "09", "name": "Washing & Finishing", "short": "Washing"},
    "09": {"new_num": "10", "name": "Packing & Shipment", "short": "Packing"},
    "10": {"new_num": "11", "name": "Fabric & Accessories Store", "short": "Store"},
    "12": {"new_num": "12", "name": "BI & Analytics Dashboard", "short": "Analytics"},
}

print("Starting Module Reorganization...")
