# RMG Woven Garments Traceability Software

![Project Status](https://img.shields.io/badge/status-active-success.svg) 
![Tech Stack](https://img.shields.io/badge/Laravel-13-red) 
![Tech Stack](https://img.shields.io/badge/React-Vite-blue)

An Enterprise-grade Factory Floor Traceability and ERP System designed for Woven Garments Manufacturing. This system tracks every single garment piece from the cutting floor to shipment using QR/Barcode scanning on Android tablets.

## 🚀 Core Features

This software is composed of 12 primary modules, built using **Domain-Driven Design (DDD)**:

1. Master Data Management
2. Order Management
3. Production Planning
4. Cutting & Bundle Ticketing
5. Value Addition (Printing/Embroidery)
6. Sewing Line Tracking
7. Quality Control (QC)
8. Washing & Finishing
9. Packing & Shipment
10. Fabric & Accessories Store
11. System Admin & Auth
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
