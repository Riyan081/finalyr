# 🚀 Project Setup & Environment Guide

This document explains how to configure environment variables and run the **Gumroad Clone** application locally or using Docker.

---

## 📋 Table of Contents
1. [Required Environment Variables](#1-required-environment-variables)
2. [Method A: Local Execution (Bun + Turbo)](#method-a-local-execution-bun--turbo)
3. [Method B: Containerized Execution (Docker Compose)](#method-b-containerized-execution-docker-compose)
4. [Testing & Verification](#4-testing--verification)

---

## 1. Required Environment Variables

The project uses modular `.env` files located across the monorepo packages/apps.

### 📁 1. Backend Server (`apps/https/.env`)

```env
# ─── Auth & Security ──────────────────────────────────────────
BETTER_AUTH_SECRET=your-random-32-char-secret-key-here
BETTER_AUTH_URL=http://localhost:3001
TRUSTED_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ORIGIN=http://localhost:3000
DOWNLOAD_TOKEN_SECRET=change-me-to-random-32-char-string

# ─── Database ─────────────────────────────────────────────────
# Neon Postgres or local Docker Postgres
DATABASE_URL=postgresql://user:password@host:5432/neondb?sslmode=require

# ─── OAuth Providers (Optional) ──────────────────────────────
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ─── Payments / Stripe ───────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_51... (Get from https://dashboard.stripe.com/apikeys)
STRIPE_WEBHOOK_SECRET=whsec_...   (Get from Stripe CLI or Webhook dashboard)

# ─── File Storage / S3 (Optional - Defaults to local MinIO) ──
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin123
S3_BUCKET=gumroad-files
S3_REGION=us-east-1
```

---

### 📁 2. Frontend App (`apps/web/.env.local`)

```env
# ─── Auth ────────────────────────────────────────────────────
BETTER_AUTH_SECRET=your-random-32-char-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# ─── API Base URL ─────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001

# ─── Database ─────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host:5432/neondb?sslmode=require

# ─── Stripe Publishable Key ──────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

### 📁 3. Database Package (`packages/db/.env`)

```env
DATABASE_URL=postgresql://user:password@host:5432/neondb?sslmode=require
```

---

### 📁 4. WebSocket Server (`apps/ws-server/.env`)

```env
DATABASE_URL=postgresql://user:password@host:5432/neondb?sslmode=require
PORT=8080
```

---

## Method A: Local Execution (Bun + Turbo)

> 💡 **Recommended for development.** Hot-reloading is fast and easy to debug.

### Prerequisites
- [Bun](https://bun.sh) (v1.1+)
- [Node.js](https://nodejs.org) (v20+)

### Step 1: Install Dependencies
```bash
bun install
```

### Step 2: Push Prisma Schema to Database
```bash
cd packages/db
bunx prisma db push
bunx prisma generate
cd ../..
```

### Step 3: Start All Services
```bash
bun run dev
```

This starts all 3 services concurrently via Turborepo:
- 🌐 **Frontend (Next.js)**: `http://localhost:3000`
- ⚙️ **Backend API (Express)**: `http://localhost:3001`
- 🔌 **WebSocket Server**: `ws://localhost:8080`

---

## Method B: Containerized Execution (Docker Compose)

> 🐳 **No local database or Bun needed!** Spins up Postgres, MinIO file storage, Express backend, Next.js frontend, and WebSocket server automatically.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Step 1: Run with Docker Compose
```bash
docker compose up --build
```

### Step 2: What Docker Starts
- 🗄️ **PostgreSQL**: `localhost:5432`
- 🪣 **MinIO S3 Storage**: `localhost:9000` (Console: `http://localhost:9001`)
- ⚙️ **Express API**: `http://localhost:3001`
- 🌐 **Next.js Frontend**: `http://localhost:3000`
- 🔌 **WebSocket**: `http://localhost:8080`

### Step 3: Stop Container Services
```bash
docker compose down
```

---

## 4. Testing & Verification

Run the built-in end-to-end API test suite to confirm everything is operational:

```bash
bun run scratch/test-all-apis.ts
```

Expected result: **40+ endpoints passing ✅**.
