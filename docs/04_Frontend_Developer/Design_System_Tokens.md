# Design System & Styling Tokens
**Role:** Frontend Developer / UI Designer
**Project:** RMG Traceability Software
**Status:** Approved for Implementation

---

## 1. Introduction
To prevent UI fragmentation and ensure a premium, SaaS-level aesthetic for the Custom Admin Panel, all Frontend Developers MUST strictly adhere to these Design Tokens. We will utilize **TailwindCSS** as our utility framework. Do not use random hex codes or arbitrary spacing classes.

---

## 2. Typography

### 2.1. Font Family
- **Primary Font:** `Inter` (Google Fonts). It provides a clean, highly legible interface suitable for data-heavy dashboards.
- *Tailwind Config:* Add `'Inter', sans-serif` as the default `sans` font.

### 2.2. Font Sizes & Weights
Because the admin panel is data-dense, our base font size is slightly smaller than a standard marketing website.
- **Base Text (Body/Tables):** `text-sm` (14px), `font-normal`.
- **Small Text (Labels/Hints):** `text-xs` (12px), `font-medium`.
- **Card Titles:** `text-lg` (18px), `font-semibold`.
- **Page Titles:** `text-2xl` (24px), `font-bold`.

---

## 3. Color Palette (Tailwind Tokens)

### 3.1. Primary Brand (Indigo)
Used for primary actions, active states, and focus rings.
- **Primary Button:** `bg-indigo-600 hover:bg-indigo-700 text-white`
- **Active Menu Item:** `bg-indigo-50 text-indigo-700`
- **Focus Ring:** `focus:ring-2 focus:ring-indigo-500`

### 3.2. Surface & Backgrounds (Slate/White)
- **App Background:** `bg-slate-50` (Off-white/light gray to reduce eye strain).
- **Cards & Modals:** `bg-white` (Pure white to contrast against the app background).
- **Table Headers:** `bg-slate-100`.

### 3.3. Text Colors
- **Headings (H1-H6):** `text-slate-900` (Almost black).
- **Body / Subtitles:** `text-slate-600` (Dark gray).
- **Disabled Text:** `text-slate-400`.

### 3.4. Semantic / Status Colors
Used strictly for Badges, Alerts, and Toasts.
- **Success (Pass/Complete):** `text-emerald-700 bg-emerald-100` (Buttons: `bg-emerald-600`).
- **Danger (Fail/Reject/Delete):** `text-red-700 bg-red-100` (Buttons: `bg-red-600`).
- **Warning (Pending/Hold):** `text-amber-700 bg-amber-100`.

---

## 4. Spacing, Layout & Shapes

### 4.1. Spacing (Paddings & Gaps)
- **Card Padding:** `p-6` (24px) for desktop, `p-4` (16px) for mobile.
- **Element Gap:** `gap-4` (16px) between buttons or form fields.

### 4.2. Borders & Radius
We want a modern, soft look. Sharp corners are not allowed.
- **Border Radius:** All cards, buttons, and inputs must use `rounded-lg` (8px).
- **Border Color:** `border border-slate-200`.

### 4.3. Shadows
To create depth on a light background.
- **Cards & Tables:** `shadow-sm`.
- **Modals & Dropdowns:** `shadow-lg`.

---
*(End of Design System Tokens)*
