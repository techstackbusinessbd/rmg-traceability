# Custom Admin Panel UI/UX Specification
**Role:** Frontend Developer / UI/UX Designer
**Project:** RMG Traceability Software
**Status:** Approved for Implementation

---

## 1. Introduction
Since we are building a 100% Custom React Admin Panel (avoiding third-party tools like Filament), this document serves as the strict design blueprint. The goal is to create a clean, modern SaaS-like dashboard (inspired by Vercel/Stripe) that is highly performant and user-friendly for Factory Managers and Super Admins.

---

## 2. Layout Structure

### 2.1. The App Shell
- **Background:** The main content area must have a soft off-white background (`bg-gray-50` or `bg-slate-50`) to reduce eye strain, with content cards being pure white (`bg-white`).
- **Left Sidebar (Navigation):** 
  - Fixed on the left (`w-64`). 
  - Permanently styled with Enterprise Midnight Dark Theme (`bg-slate-950 text-slate-100`).
  - Contains grouped and collapsible menu items.
  - Must highlight the active route using the Primary Brand Color (`bg-blue-600 text-white font-bold`).

### 2.1.1. Hierarchical 3-Level Sidebar Menu Architecture (Strict Requirement)
To accommodate deep complex RMG operations (e.g. Master Data -> Garment Specs -> Size Grading), the Left Navigation Sidebar **MUST natively support 3-Level Hierarchical Menus**:
1. **Level 1 (Module Group / Category Header):** e.g., `MASTER DATA ENGINE`, `IDENTITY & SECURITY`, `SHOP FLOOR EXECUTION`.
2. **Level 2 (Parent Feature Node / Collapsible Section):** e.g., `Buyers & Brands`, `Styles & Construction`, `Production Routing`. Supports smooth expand/collapse chevron toggles.
3. **Level 3 (Granular Child Sub-Route / Action View):** e.g., `Master Data` -> `Styles & Construction` -> `Size Range Matrix`, `BOM Specification`, `Operation Bulletin (SMV)`.
- **Indentation & Styling:** Level 3 items must be clearly indented (`pl-9`), styled with connecting tree guides or subtle dot markers, and sync automatically with the top Navbar Breadcrumbs.

- **Top Navbar:** 
  - Contains Breadcrumbs on the left (e.g., `Admin / Master Data / Styles / Size Matrix`).
  - Contains Global Status Indicators (Plant status, Real-time Redis Telemetry) and User Profile Dropdown on the right.

### 2.2. Responsiveness
- Although primarily used on Desktops, the layout must be responsive.
- On screens smaller than `1024px` (Tablets/Mobiles), the Left Sidebar must hide automatically and convert into a "Hamburger Menu" in the Top Navbar.

---

## 3. Data Tables (Custom React Tables)
Tables are the heart of the Admin Panel. We will use a library like `@tanstack/react-table` styled with TailwindCSS.

### 3.1. Required Table Features
Every data table (e.g., Buyers List, PO List, User List) MUST have:
1. **Global Search:** A search bar at the top right of the table.
2. **Column Sorting:** Clicking on column headers (e.g., "Created At") toggles ASC/DESC sorting.
3. **Pagination:** Server-side pagination at the bottom (`Show 10/25/50 per page`).
4. **Action Menu:** Instead of cluttering the table with "Edit" and "Delete" buttons, place a `Three-dot (⋮)` dropdown menu on the far-right column of every row.

---

## 4. Forms & Modals

### 4.1. Modals (Slide-overs / Dialogs)
- **Rule:** For simple data entry (e.g., adding a new Color, Size, or Factory Line), do NOT navigate to a new page.
- **Action:** Open a Centered Modal or a Right-Side Slide-over. This keeps the user in their current context.

### 4.2. Full-Page Forms
- **Rule:** For complex data entry (e.g., creating a new PO with multiple nested fields like BOM), navigate to a dedicated full-page form (`/admin/po/create`).

### 4.3. Form Validation & Feedback
- **Validation Errors:** Must appear immediately below the input field in red text (`text-red-500 text-sm`). The input border should also turn red.
- **Success Toasts:** Upon successful submission, show a green Toast notification at the top-right corner (e.g., "Buyer created successfully") and automatically close the modal.

---
*(End of Admin Panel UI/UX Spec)*
