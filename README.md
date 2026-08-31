# RMG Woven Garments Traceability Software

![Project Status](https://img.shields.io/badge/status-active-success.svg) 
![Tech Stack](https://img.shields.io/badge/Laravel-13-red) 
![Tech Stack](https://img.shields.io/badge/React-Vite-blue)

An Enterprise-grade Factory Floor Traceability and ERP System designed for Woven Garments Manufacturing. This system tracks every single garment piece from the cutting floor to shipment using QR/Barcode scanning on Android tablets.

## 🚀 Core Features

This software is composed of 12 primary modules, built using **Domain-Driven Design (DDD)**:

1. System Admin & Auth (RBAC)
2. Master Data Management
3. Order Management
4. Production Planning & IE
5. Cutting & Bundle Ticketing
6. Value Addition (Printing/Embroidery)
7. Sewing Line Tracking
8. Quality Control (QC)
9. Washing & Finishing
10. Packing & Shipment
11. Fabric & Accessories Store
12. BI Analytics Dashboard

## 🏗️ Architecture & Tech Stack

- **Backend:** Laravel 13 (API-First, Repository Pattern, Redis Caching, Laravel Horizon, Reverb)
- **Frontend:** React with Vite (Custom UI, TailwindCSS, Zustand/Redux, TanStack Query)
- **Hardware:** Android Tablets (Offline-First via PWA/IndexedDB), Bluetooth Barcode Scanners
- **Database:** PostgreSQL + Redis

## 📚 Documentation

The entire system architecture, Product Requirements Documents (PRDs), API Specifications, and UI/UX Strategy are documented thoroughly in the `docs/` folder.

- **[Business Requirements (PRDs)](./docs/01_Business_Analyst/)**
- **[System Architecture & API Specs](./docs/02_Solution_Architect/)**
- **[Backend Guidelines](./docs/03_Backend_Developer/)**
- **[Frontend UI/UX Strategy](./docs/04_Frontend_Developer/)**

---

*This project is strictly governed by custom AI Agent Workflow Rules to enforce architectural integrity.*
