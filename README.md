# OYF Mini Billing API

## 📌 Overview

A RESTful API for managing user bills with authentication, filtering, and PostgreSQL integration.

---

## 🚀 Features

* JWT Authentication (`/auth/login`)
* Health check endpoint (`/health`)
* CRUD operations for bills
* Filtering (date range, amount, status)
* Dockerized setup (API + PostgreSQL)

---

## 🛠️ Tech Stack

* Node.js (Express)
* PostgreSQL
* Zod (validation)
* Docker & Docker Compose

---

## 🐳 Running Locally (Docker)

```bash
docker-compose up --build
```

API:

```
http://localhost:5001
```

---

## 🌍 Deployment

Deployed on Render:

Base URL:

```
https://your-api.onrender.com
```

---

## 🔐 Environment Variables

Example:

```
PORT=5001
DATABASE_URL=postgres://user:password@host:5432/db
JWT_SECRET_KEY=your_secret
JWT_EXPIRES_IN=7d
```

---

## 💾 Backup & Restore

### Backup

```bash
docker exec -t postgres-db pg_dump -U postgres oyf-billing-backend > backup.sql
```

### Restore

```bash
cat backup.sql | docker exec -i postgres-db psql -U postgres -d oyf-billing-backend
```

### Production

* Managed PostgreSQL (Render) provides automated backups
* Supports snapshot recovery

---

## 📬 API Endpoints

* POST `/auth/login`
* GET `/health`
* POST `/bills`
* GET `/bills`
* PATCH `/bills/:id`
* DELETE `/bills/:id`

---

## 🎥 Walkthrough

(Insert Loom link here)
