import os
import re

ROOT = r"g:\ERP\rmg-tracibility\docs"

# Define rename mappings for each folder
# format: (folder_relative_to_docs, old_filename, new_filename)

renames = [
    # 01_Business_Analyst
    ("01_Business_Analyst", "PRD_11_Auth_Admin.md", "PRD_01_Auth_Admin.md"),
    ("01_Business_Analyst", "PRD_11_System_Admin.md", "PRD_01_System_Admin.md"),
    ("01_Business_Analyst", "PRD_01_Master_Data.md", "PRD_02_Master_Data.md"),
    ("01_Business_Analyst", "PRD_01_QC_Routing.md", "PRD_08_QC_Routing.md"),
    ("01_Business_Analyst", "PRD_02_Order_Management.md", "PRD_03_Order_Management.md"),
    ("01_Business_Analyst", "PRD_03_Production_Planning.md", "PRD_04_Production_Planning.md"),
    ("01_Business_Analyst", "PRD_04_Cutting.md", "PRD_05_Cutting.md"),
    ("01_Business_Analyst", "PRD_04_Cutting_Bundle_Ticket.md", "PRD_05_Cutting_Bundle_Ticket.md"),
    ("01_Business_Analyst", "PRD_05_Value_Addition.md", "PRD_06_Value_Addition.md"),
    ("01_Business_Analyst", "PRD_06_Sewing.md", "PRD_07_Sewing.md"),
    ("01_Business_Analyst", "PRD_06_Sewing_Line_Tracking.md", "PRD_07_Sewing_Line_Tracking.md"),
    ("01_Business_Analyst", "PRD_07_QC.md", "PRD_08_QC.md"),
    ("01_Business_Analyst", "PRD_07_Quality_Control.md", "PRD_08_Quality_Control.md"),
    ("01_Business_Analyst", "PRD_08_Washing.md", "PRD_09_Washing.md"),
    ("01_Business_Analyst", "PRD_08_Washing_Finishing.md", "PRD_09_Washing_Finishing.md"),
    ("01_Business_Analyst", "PRD_09_Packing.md", "PRD_10_Packing.md"),
    ("01_Business_Analyst", "PRD_09_Packing_Shipment.md", "PRD_10_Packing_Shipment.md"),
    ("01_Business_Analyst", "PRD_10_Fabric_Accessories_Store.md", "PRD_11_Fabric_Accessories_Store.md"),
    ("01_Business_Analyst", "PRD_10_Store.md", "PRD_11_Store.md"),

    # 02_Solution_Architect
    ("02_Solution_Architect", "API_Spec_11_Auth_Admin.md", "API_Spec_01_Auth_Admin.md"),
    ("02_Solution_Architect", "API_Spec_Admin.md", "API_Spec_01_Admin.md"),
    ("02_Solution_Architect", "API_Spec_01_Master_Data.md", "API_Spec_02_Master_Data.md"),
    ("02_Solution_Architect", "API_Spec_Master_Data.md", "API_Spec_02_Master_Data_Old.md"),
    ("02_Solution_Architect", "API_Spec_02_Order_Management.md", "API_Spec_03_Order_Management.md"),
    ("02_Solution_Architect", "API_Spec_03_Production_Planning.md", "API_Spec_04_Production_Planning.md"),
    ("02_Solution_Architect", "API_Spec_04_Cutting.md", "API_Spec_05_Cutting.md"),
    ("02_Solution_Architect", "API_Spec_04_Cutting_Bundle_Ticket.md", "API_Spec_05_Cutting_Bundle_Ticket.md"),
    ("02_Solution_Architect", "API_Spec_05_Value_Addition.md", "API_Spec_06_Value_Addition.md"),
    ("02_Solution_Architect", "API_Spec_06_Sewing.md", "API_Spec_07_Sewing.md"),
    ("02_Solution_Architect", "API_Spec_06_Sewing_Line_Tracking.md", "API_Spec_07_Sewing_Line_Tracking.md"),
    ("02_Solution_Architect", "API_Spec_07_QC.md", "API_Spec_08_QC.md"),
    ("02_Solution_Architect", "API_Spec_07_Quality_Control.md", "API_Spec_08_Quality_Control.md"),
    ("02_Solution_Architect", "API_Spec_08_Washing.md", "API_Spec_09_Washing.md"),
    ("02_Solution_Architect", "API_Spec_08_Washing_Finishing.md", "API_Spec_09_Washing_Finishing.md"),
    ("02_Solution_Architect", "API_Spec_09_Packing.md", "API_Spec_10_Packing.md"),
    ("02_Solution_Architect", "API_Spec_09_Packing_Shipment.md", "API_Spec_10_Packing_Shipment.md"),
    ("02_Solution_Architect", "API_Spec_10_Fabric_Accessories_Store.md", "API_Spec_11_Fabric_Accessories_Store.md"),
    ("02_Solution_Architect", "API_Spec_10_Fabric_Store.md", "API_Spec_11_Fabric_Store.md"),
    ("02_Solution_Architect", "API_Spec_10_Store.md", "API_Spec_11_Store.md"),

    # 03_Backend_Developer
    ("03_Backend_Developer", "Mod_11_Rules.md", "Mod_01_Rules.md"),
    ("03_Backend_Developer", "Mod_01_Rules.md", "Mod_02_Rules.md"),
    ("03_Backend_Developer", "Mod_02_Rules.md", "Mod_03_Rules.md"),
    ("03_Backend_Developer", "Mod_03_Rules.md", "Mod_04_Rules.md"),
    ("03_Backend_Developer", "Mod_04_Rules.md", "Mod_05_Rules.md"),
    ("03_Backend_Developer", "Mod_05_Rules.md", "Mod_06_Rules.md"),
    ("03_Backend_Developer", "Mod_06_Rules.md", "Mod_07_Rules.md"),
    ("03_Backend_Developer", "Mod_07_Rules.md", "Mod_08_Rules.md"),
    ("03_Backend_Developer", "Mod_08_Rules.md", "Mod_09_Rules.md"),
    ("03_Backend_Developer", "Mod_09_Rules.md", "Mod_10_Rules.md"),
    ("03_Backend_Developer", "Mod_10_Rules.md", "Mod_11_Rules.md"),

    # 04_Frontend_Developer
    ("04_Frontend_Developer", "Mod_11_UI_Spec.md", "Mod_01_UI_Spec.md"),
    ("04_Frontend_Developer", "Mod_01_UI_Spec.md", "Mod_02_UI_Spec.md"),
    ("04_Frontend_Developer", "Mod_02_UI_Spec.md", "Mod_03_UI_Spec.md"),
    ("04_Frontend_Developer", "Mod_03_UI_Spec.md", "Mod_04_UI_Spec.md"),
    ("04_Frontend_Developer", "Mod_04_UI_Spec.md", "Mod_05_UI_Spec.md"),
    ("04_Frontend_Developer", "Mod_05_UI_Spec.md", "Mod_06_UI_Spec.md"),
    ("04_Frontend_Developer", "Mod_06_UI_Spec.md", "Mod_07_UI_Spec.md"),
    ("04_Frontend_Developer", "Mod_07_UI_Spec.md", "Mod_08_UI_Spec.md"),
    ("04_Frontend_Developer", "Mod_08_UI_Spec.md", "Mod_09_UI_Spec.md"),
    ("04_Frontend_Developer", "Mod_09_UI_Spec.md", "Mod_10_UI_Spec.md"),
    ("04_Frontend_Developer", "Mod_10_UI_Spec.md", "Mod_11_UI_Spec.md"),

    # 05_QA_Engineer
    ("05_QA_Engineer", "TC_11_Auth_Admin.md", "TC_01_Auth_Admin.md"),
    ("05_QA_Engineer", "TC_01_Master_Data.md", "TC_02_Master_Data.md"),
    ("05_QA_Engineer", "TC_02_Order_Management.md", "TC_03_Order_Management.md"),
    ("05_QA_Engineer", "TC_03_Production_Planning.md", "TC_04_Production_Planning.md"),
    ("05_QA_Engineer", "TC_04_Cutting.md", "TC_05_Cutting.md"),
    ("05_QA_Engineer", "TC_05_Value_Addition.md", "TC_06_Value_Addition.md"),
    ("05_QA_Engineer", "TC_06_Sewing.md", "TC_07_Sewing.md"),
    ("05_QA_Engineer", "TC_07_QC.md", "TC_08_QC.md"),
    ("05_QA_Engineer", "TC_08_Washing.md", "TC_09_Washing.md"),
    ("05_QA_Engineer", "TC_09_Packing.md", "TC_10_Packing.md"),
    ("05_QA_Engineer", "TC_10_Store.md", "TC_11_Store.md"),
]

# Step 1: Use temporary names to avoid overwriting during cyclic rename
temp_map = []
for folder, old_f, new_f in renames:
    old_p = os.path.join(ROOT, folder, old_f)
    if os.path.exists(old_p):
        temp_p = os.path.join(ROOT, folder, "__tmp__" + new_f)
        new_p = os.path.join(ROOT, folder, new_f)
        os.rename(old_p, temp_p)
        temp_map.append((temp_p, new_p))
        print(f"Temp renamed: {old_f} -> __tmp__{new_f}")

for temp_p, new_p in temp_map:
    os.rename(temp_p, new_p)
    print(f"Final renamed: {os.path.basename(temp_p)} -> {os.path.basename(new_p)}")

print("File Renaming Completed Successfully!")
