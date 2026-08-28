import os

base_dir = r"g:\ERP\rmg-track\docs"
be_dir = os.path.join(base_dir, "03_Backend_Developer")
fe_dir = os.path.join(base_dir, "04_Frontend_Developer")
qa_dir = os.path.join(base_dir, "05_QA_Engineer")
dev_dir = os.path.join(base_dir, "06_DevOps_Engineer")

os.makedirs(be_dir, exist_ok=True)
os.makedirs(fe_dir, exist_ok=True)
os.makedirs(qa_dir, exist_ok=True)
os.makedirs(dev_dir, exist_ok=True)

# 03 Backend
be_arch = """# Backend Architecture Guidelines
**Role:** Backend Developer
**Framework:** Laravel 12 API
**Status:** Approved

## 1. Coding Standards (PSR-12)
- All controllers must be thin. Business logic must reside in `Services`.
- Direct DB calls in controllers are prohibited. Use the **Repository Pattern**.
- Example: `BundleController` -> `BundleService` -> `BundleRepository`.

## 2. Error Handling & Logging
- Every DB transaction must be wrapped in a `DB::beginTransaction()` and `DB::commit()`.
- Use global `Try-Catch`. On Exception, call `DB::rollBack()` and log the error using Laravel `Log::error()` with Context.
- Return standard HTTP codes: `200` (Success), `201` (Created), `403` (Forbidden), `422` (Validation), `500` (Server Error).

## 3. API Security
- All endpoints must use `auth:sanctum` middleware.
- Request payloads must be validated using Laravel Form Requests.
"""

be_db = """# Database Optimization Rules
**Role:** Backend Developer
**Status:** Approved

## 1. Query Optimization
- N+1 Query problem must be avoided using Eloquent `with()`.
- Use `chunk()` or `cursor()` for generating large reports (e.g., Exporting 100,000 bundles).
- Avoid `SELECT *`. Always select specific columns.

## 2. Indexing Strategy
- Foreign keys (`buyer_id`, `style_id`, `po_id`) MUST be indexed.
- Columns used frequently in WHERE clauses (e.g., `qr_code`, `status`) must have indexes.

## 3. Caching (Redis)
- Static Master Data (Buyers, Styles, Colors) must be cached via Redis.
- Analytics endpoints (Mod 12) must return cached data. Cache should clear every 5 mins.
"""

# 04 Frontend
fe_arch = """# Frontend Component Architecture
**Role:** Frontend / Android Developer
**Framework:** React (Web), React Native / Kotlin (Tablet)
**Status:** Approved

## 1. Directory Structure
```text
/src
  /components     (Reusable UI components: Buttons, Modals)
  /features       (Module-specific logic: Sewing, QC)
  /services       (Axios API calls)
  /store          (Zustand/Redux state management)
```

## 2. Offline-First Architecture (Critical)
- **Local Database:** Android tablets must use SQLite / LocalForage to store today's allocated bundles.
- **Sync Logic:** If `navigator.onLine` is false, save scans locally with `sync_status = pending`.
- **Background Sync:** Use Service Workers / WorkManager to push data in bulk when Wi-Fi connects.

## 3. API Integration
- Use `Axios` interceptors to inject the Bearer Token automatically.
- Handle 401 Unauthorized by auto-redirecting to Login screen.
"""

fe_ui = """# Tablet UI Specifications
**Role:** Frontend / Android Developer
**Status:** Approved

## 1. Factory Floor UI/UX
- **Dark Theme:** Mandatory to save battery and reduce eye strain in low-light factory floors.
- **Touch Targets:** Minimum 48x48 dp for all interactive elements (buttons, inputs) because operators wear gloves.
- **Colors:** Use High-Contrast colors.
  - Green (#4CAF50): Success/Pass
  - Red (#F44336): Reject/Error
  - Orange (#FF9800): Alter/Warning

## 2. Hardware Integration
- Must integrate with Zebra / Honeywell physical barcode scanners (Keyboard wedge mode).
- Focus must auto-return to the scanning input field after every scan.
"""

# 05 QA
qa_master = """# QA Test Cases Master Guideline
**Role:** QA Engineer
**Status:** Approved

## 1. Positive Testing
- Verify standard workflow: PO Create -> Plan -> Cut -> Scan In -> Scan Out -> QC Pass -> Pack.
- Ensure Mathematical accuracy: DHU and SMV targets match manual formulas.

## 2. Negative Testing (Boundary & Bypass)
- **Bypass Test:** Scan a bundle directly into "Packing" without it passing "Sewing" or "QC". System MUST block it.
- **Double Scan Test:** Scan the exact same QR code twice within 1 second. System MUST block the second request.

## 3. Offline Scenario Testing
- Turn Wi-Fi OFF on tablet.
- Scan 10 bundles.
- Turn Wi-Fi ON.
- Assert that exactly 10 bundles hit the backend API sequentially.
"""

qa_auto = """# Automation Testing Strategy
**Role:** QA Engineer
**Status:** Approved

## 1. End-to-End (E2E) Automation
- Use **Cypress** (for Web Admin) and **Appium** (for Tablets).
- Core critical paths (Login, Create PO, Scan Bundle) must have automated test coverage.
- Tests must run automatically in the CI/CD pipeline before any deployment.

## 2. Load Testing (JMeter)
- Scenario: Shift change (e.g. 1:00 PM).
- 500 lines concurrently sending "Scan OUT" API requests.
- Assert: Server must handle 500 requests/sec with response time < 300ms without throwing 502/503 errors.
"""

# 06 DevOps
dev_deploy = """# DevOps Deployment Strategy
**Role:** DevOps Engineer
**Status:** Approved

## 1. Server Architecture
- **Web Server:** Nginx (Reverse Proxy).
- **App Server:** PHP 8.3-FPM (Laravel 12).
- **Database:** PostgreSQL (Primary and Replica for scaling).
- **Cache & Queue:** Redis (Mandatory for Analytics and QR PDF generation queues).

## 2. Docker Containerization
- The entire stack must be Dockerized using `docker-compose`.
- Separate containers for: Nginx, PHP, Postgres, Redis, Horizon (Queue workers).

## 3. Environments
- `Staging`: For QA testing (Mirror of production).
- `Production`: Live factory server.
"""

dev_cicd = """# CI/CD Pipeline Flow
**Role:** DevOps Engineer
**Status:** Approved

## 1. GitHub Actions Pipeline
Every push to the `main` or `staging` branch must trigger the following pipeline:
1. **Linting:** Run PHP_CodeSniffer / ESLint.
2. **Unit Tests:** Run `php artisan test`.
3. **Build:** Build Docker images.
4. **Deploy:** SSH into the target server, pull new images, run `php artisan migrate --force`, and restart queue workers.

## 2. Zero-Downtime Deployment
- Use Laravel Envoyer or Docker Swarm to ensure the system does not go offline during deployments (factory floor cannot stop).
"""

files_to_write = {
    os.path.join(be_dir, "Backend_Architecture_Guidelines.md"): be_arch,
    os.path.join(be_dir, "Database_Optimization_Rules.md"): be_db,
    os.path.join(fe_dir, "Frontend_Component_Architecture.md"): fe_arch,
    os.path.join(fe_dir, "Tablet_UI_Specifications.md"): fe_ui,
    os.path.join(qa_dir, "QA_Test_Cases_Master.md"): qa_master,
    os.path.join(qa_dir, "Automation_Testing_Strategy.md"): qa_auto,
    os.path.join(dev_dir, "DevOps_Deployment_Strategy.md"): dev_deploy,
    os.path.join(dev_dir, "CI_CD_Pipeline_Flow.md"): dev_cicd,
}

for path, content in files_to_write.items():
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Teams 3-6 Detailed Documents Generated Successfully.")
