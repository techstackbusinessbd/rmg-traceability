# Frontend UI Components Strategy (React)
**Role:** Frontend Developer
**Project:** RMG Traceability Software
**Status:** Approved for Implementation

---

## 1. Introduction
To maintain a 100% consistent User Experience (UX) across all 12 modules, all frontend developers MUST use the exact same libraries and implementations for Data Tables, Notifications, and Confirmation Modals. Do not introduce custom plugins without architect approval.

---

## 2. Data Tables (`@tanstack/react-table`)
We will use TanStack Table (React Table v8) because it is "headless" (giving us full control over Tailwind styling) and highly performant for large datasets.

### 2.1. Server-Side Processing
- Do NOT load 10,000 Purchase Orders into the browser at once.
- Configure TanStack Table to use **Server-Side Pagination, Sorting, and Global Search**.
- Pass the state (page number, search query) to the backend API via `TanStack Query` (React Query).

### 2.2. Standardized Table UI
- Background: White (`bg-white`).
- Headers: Light Gray (`bg-gray-100 text-gray-700 font-semibold`).
- Actions: Always use a three-dot dropdown (`⋮`) on the far-right column for Edit/Delete to save horizontal space.

---

## 3. Toast Notifications (`react-hot-toast`)
Whenever a user performs an action (e.g., Saves a PO, Scans a Carton), they must receive immediate visual feedback.

### 3.1. Rules
- **Library:** Use `react-hot-toast`.
- **Position:** `top-right` for desktop dashboard, `top-center` for Factory Tablets.
- **Duration:** Auto-hide after 3000ms (3 seconds).

### 3.2. Types of Toasts
- **Success:** `toast.success('PO Created Successfully!')` -> Shows a green checkmark icon.
- **Error:** `toast.error('Scan Failed: Wrong Destination')` -> Shows a red cross icon.
- **Promise:** Use `toast.promise` for async API calls so the user sees a loading spinner while waiting for the server response.

---

## 4. Confirmation Modals (`SweetAlert2` / Custom Dialog)
Critical actions must NEVER happen with a single click.

### 4.1. The "Are You Sure?" Rule
If a user clicks a "Delete", "Reject", or "Force Close" button, the system MUST intercept the click and show a Confirmation Modal.

### 4.2. Implementation
- **Library:** Use `SweetAlert2` (React version) for quick, beautiful alerts, or Headless UI `<Dialog>`.
- **Warning Color:** The confirm button on the modal MUST be Red (`bg-red-600`) to indicate a destructive action.
- **Example Flow:**
  1. User clicks "Delete Buyer".
  2. SweetAlert modal pops up: *"Are you sure you want to delete this buyer? This action cannot be undone."*
  3. User clicks "Yes, Delete" -> Triggers API call -> Shows Success Toast.

---

## 5. Form Validation (`React Hook Form` + `Zod`)
- Do not use standard React controlled inputs (e.g., `useState` for every field) as it causes excessive re-renders on large forms.
- Use `React Hook Form` for performance.
- Use `Zod` (or `Yup`) for schema validation. Error messages must appear directly beneath the input field in red (`text-red-500`).

---
*(End of UI Components Strategy)*
