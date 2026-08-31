import os
import re

ROOT = r"g:\ERP\rmg-tracibility"
DOCS_DIR = os.path.join(ROOT, "docs")

# Specific file heading regexes or content adjustments
def update_file_content(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    fname = os.path.basename(file_path)

    # 1. Update Module numbers in headers (e.g. # Module 11 -> # Module 01 or **Module:** 11 -> **Module:** 01)
    if "01_Auth_Admin" in fname or "Mod_01" in fname or "TC_01" in fname or "01_Admin" in fname:
        content = re.sub(r'# Test Cases: Module 11', r'# Test Cases: Module 01', content)
        content = re.sub(r'# Module 11: UI/UX Specifications', r'# Module 01: UI/UX Specifications', content)
        content = re.sub(r'# Module 11: Backend Rules', r'# Module 01: Backend Rules', content)
        content = re.sub(r'\*\*Module:\*\* 11\b', r'**Module:** 01', content)
        content = re.sub(r'Module 11 - System Admin', r'Module 01 - System Admin', content)
        content = re.sub(r'for Module 11', r'for Module 01', content)

    elif "02_Master_Data" in fname or "Mod_02" in fname or "TC_02" in fname:
        content = re.sub(r'# Test Cases: Module 01', r'# Test Cases: Module 02', content)
        content = re.sub(r'# Module 01: UI/UX Specifications', r'# Module 02: UI/UX Specifications', content)
        content = re.sub(r'# Module 01: Backend Rules', r'# Module 02: Backend Rules', content)
        content = re.sub(r'\*\*Module:\*\* 01\b', r'**Module:** 02', content)
        content = re.sub(r'for Module 01', r'for Module 02', content)
        content = re.sub(r'Module 11', r'Module 01', content) # When configuring tablet in Mod 01 (Auth)

    elif "03_Order_Management" in fname or "Mod_03" in fname or "TC_03" in fname:
        content = re.sub(r'# Test Cases: Module 02', r'# Test Cases: Module 03', content)
        content = re.sub(r'# Module 02: UI/UX Specifications', r'# Module 03: UI/UX Specifications', content)
        content = re.sub(r'# Module 02: Backend Rules', r'# Module 03: Backend Rules', content)
        content = re.sub(r'\*\*Module:\*\* 02\b', r'**Module:** 03', content)
        content = re.sub(r'for Module 02', r'for Module 03', content)
        content = re.sub(r'Module 01\b', r'Module 02', content) # Links to Master Data (now Mod 02)
        content = re.sub(r'Module 1\b', r'Module 02', content)

    elif "04_Production_Planning" in fname or "Mod_04" in fname or "TC_04" in fname:
        content = re.sub(r'# Test Cases: Module 03', r'# Test Cases: Module 04', content)
        content = re.sub(r'# Module 03: UI/UX Specifications', r'# Module 04: UI/UX Specifications', content)
        content = re.sub(r'# Module 03: Backend Rules', r'# Module 04: Backend Rules', content)
        content = re.sub(r'\*\*Module:\*\* 03\b', r'**Module:** 04', content)
        content = re.sub(r'for Module 03', r'for Module 04', content)
        content = re.sub(r'Module 10\b', r'Module 11', content) # Store is now Mod 11
        content = re.sub(r'Mod 10\b', r'Mod 11', content)
        content = re.sub(r'Module 02\b', r'Module 03', content) # Order Mgmt is now Mod 03

    elif "05_Cutting" in fname or "Mod_05" in fname or "TC_05" in fname:
        content = re.sub(r'# Test Cases: Module 04', r'# Test Cases: Module 05', content)
        content = re.sub(r'# Module 04: UI/UX Specifications', r'# Module 05: UI/UX Specifications', content)
        content = re.sub(r'# Module 04: Backend Rules', r'# Module 05: Backend Rules', content)
        content = re.sub(r'\*\*Module:\*\* 04\b', r'**Module:** 05', content)
        content = re.sub(r'for Module 04', r'for Module 05', content)

    elif "06_Value_Addition" in fname or "Mod_06" in fname or "TC_06" in fname:
        content = re.sub(r'# Test Cases: Module 05', r'# Test Cases: Module 06', content)
        content = re.sub(r'# Module 05: UI/UX Specifications', r'# Module 06: UI/UX Specifications', content)
        content = re.sub(r'# Module 05: Backend Rules', r'# Module 06: Backend Rules', content)
        content = re.sub(r'\*\*Module:\*\* 05\b', r'**Module:** 06', content)
        content = re.sub(r'for Module 05', r'for Module 06', content)

    elif "07_Sewing" in fname or "Mod_07" in fname or "TC_07" in fname:
        content = re.sub(r'# Test Cases: Module 06', r'# Test Cases: Module 07', content)
        content = re.sub(r'# Module 06: UI/UX Specifications', r'# Module 07: UI/UX Specifications', content)
        content = re.sub(r'# Module 06: Backend Rules', r'# Module 07: Backend Rules', content)
        content = re.sub(r'\*\*Module:\*\* 06\b', r'**Module:** 07', content)
        content = re.sub(r'for Module 06', r'for Module 07', content)

    elif "08_QC" in fname or "08_Quality_Control" in fname or "Mod_08" in fname or "TC_08" in fname:
        content = re.sub(r'# Test Cases: Module 07', r'# Test Cases: Module 08', content)
        content = re.sub(r'# Module 07: UI/UX Specifications', r'# Module 08: UI/UX Specifications', content)
        content = re.sub(r'# Module 07: Backend Rules', r'# Module 08: Backend Rules', content)
        content = re.sub(r'\*\*Module:\*\* 07\b', r'**Module:** 08', content)
        content = re.sub(r'for Module 07', r'for Module 08', content)

    elif "09_Washing" in fname or "Mod_09" in fname or "TC_09" in fname:
        content = re.sub(r'# Test Cases: Module 08', r'# Test Cases: Module 09', content)
        content = re.sub(r'# Module 08: UI/UX Specifications', r'# Module 09: UI/UX Specifications', content)
        content = re.sub(r'# Module 08: Backend Rules', r'# Module 09: Backend Rules', content)
        content = re.sub(r'\*\*Module:\*\* 08\b', r'**Module:** 09', content)
        content = re.sub(r'for Module 08', r'for Module 09', content)

    elif "10_Packing" in fname or "Mod_10" in fname or "TC_10" in fname:
        content = re.sub(r'# Test Cases: Module 09', r'# Test Cases: Module 10', content)
        content = re.sub(r'# Module 09: UI/UX Specifications', r'# Module 10: UI/UX Specifications', content)
        content = re.sub(r'# Module 09: Backend Rules', r'# Module 10: Backend Rules', content)
        content = re.sub(r'\*\*Module:\*\* 09\b', r'**Module:** 10', content)
        content = re.sub(r'for Module 09', r'for Module 10', content)

    elif "11_Fabric_Accessories_Store" in fname or "11_Store" in fname or "Mod_11" in fname or "TC_11" in fname:
        content = re.sub(r'# Test Cases: Module 10', r'# Test Cases: Module 11', content)
        content = re.sub(r'# Module 10: UI/UX Specifications', r'# Module 11: UI/UX Specifications', content)
        content = re.sub(r'# Module 10: Backend Rules', r'# Module 11: Backend Rules', content)
        content = re.sub(r'\*\*Module:\*\* 10\b', r'**Module:** 11', content)
        content = re.sub(r'for Module 10', r'for Module 11', content)
        content = re.sub(r'Module 03\b', r'Module 04', content) # Planning is now Mod 04
        content = re.sub(r'Mod 3\b', r'Mod 04', content)

    # General cross-reference fixes in architectural docs
    if "Tech_Stack_Packages.md" in fname:
        content = re.sub(r'\(Module 11\)', r'(Module 01)', content)
        content = re.sub(r'\(Module 01\)', r'(Module 02)', content)

    if "Performance_Optimization_Guide.md" in fname:
        content = re.sub(r'Module 01: Buyers', r'Module 02: Buyers', content)

    if content != original:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated contents: {fname}")

for root, dirs, files in os.walk(DOCS_DIR):
    for f in files:
        if f.endswith(".md"):
            update_file_content(os.path.join(root, f))

print("All Documentation Content Updated!")
