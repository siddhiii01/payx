# PayX — Digital Wallet App

A full-stack digital wallet application where users can add money from their bank, send money to other users, and track transactions — all in real time.

🔗 **Live Demo:** [payxfrontend.vercel.app](https://payxfrontend.vercel.app)

---

## Features

### Authentication
- JWT-based auth with access + refresh token rotation
- Tokens stored in HTTP-only cookies (XSS protection)
- Token versioning for immediate logout invalidation
- Auto-refresh interceptor — users stay logged in without re-entering credentials

###  On-Ramp (Bank → Wallet)
- Select a bank (HDFC / AXIS / SBI) and enter an amount
- Redirected to a dummy bank approval page
- On approval, a webhook credits the wallet atomically
- Idempotent webhook handler — safe against duplicate bank callbacks
- All amounts stored in paise to avoid floating point errors

###  P2P Transfer (Wallet → Wallet)
- Send money to any registered PayX user by phone number
- Atomic Prisma transaction — debit + credit happen together or not at all
- Ledger entries created for both sender and receiver
- Clear error if recipient phone number is not registered

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS, React Hook Form, Zod |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens), bcrypt, HTTP-only cookies |
| Validation | Zod (shared schemas between frontend and backend) |
| Deployment | Vercel (frontend), Render (backend + bank server) |

---

## Project Structure

```
payx/
├── frontend/          # React + Vite app
├── backend/           # Express API server
├── dummy-bank-server/ # Simulated bank for on-ramp flow
└── shared_schemas/    # Zod schemas shared across frontend & backend
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- pnpm or npm

### 1. Clone the repo

```bash
git clone https://github.com/siddhiii01/payx.git
cd payx
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/payx
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

BANK_URL=http://localhost:3001
WEBHOOK_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

```bash
npx prisma migrate dev
npm run dev
```

### 3. Dummy Bank Server

```bash
cd dummy-bank-server
npm install
```

Create a `.env` file:

```env
BANK_BASE_URL=http://localhost:3001
WEBHOOK_URL=http://localhost:3000
USER_RETURN_URL=http://localhost:5173
```

```bash
node bank-server.js
```

### 4. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## How the On-Ramp Flow Works

```
User fills form → PayX backend calls bank → Bank returns paymentUrl
     → User redirected to bank approval page
          → User approves → Bank POSTs webhook to PayX
               → PayX credits wallet atomically → User redirected to payment-status page
```

---

## Environment Variables (Production)

| Service | Platform | Key Variables |
|---|---|---|
| Frontend | Vercel | `VITE_API_URL` |
| Backend | Render | `DATABASE_URL`, `JWT_SECRET`, `BANK_URL`, `WEBHOOK_URL`, `FRONTEND_URL` |
| Bank Server | Render | `BANK_BASE_URL`, `WEBHOOK_URL`, `USER_RETURN_URL` |

---


