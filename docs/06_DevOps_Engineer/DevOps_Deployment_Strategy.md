# DevOps Deployment Strategy
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
