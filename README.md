# Pharmacy Management System

A full-stack Pharmacy Management System built with React (Vite + Tailwind CSS) on the frontend and Node.js/Express + MongoDB (Mongoose) on the backend.

## Features

- **Authentication** — JWT-based login/registration for three roles: Admin, Pharmacist, Cashier. Passwords are hashed with bcrypt.
- **Inventory Management** — Full CRUD for medicines: name, batch number, category, manufacturer, supplier, expiry date, stock quantity, reorder level, price, cost price. Role-gated: only Admin/Pharmacist can create/edit, only Admin can delete.
- **POS / Billing** — Cart-based checkout, automatic tax + discount calculation, atomic stock deduction on checkout, generated receipt with a unique receipt number, printable.
- **Analytics Dashboard** — Low-stock alerts, today's total sales, total registered medicines, transaction count, inventory valuation, expired-item count.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, React Router, Axios, Context API |
| Backend | Node.js, Express.js (modular MVC) |
| Database | MongoDB via Mongoose |
| Auth | JSON Web Tokens (JWT), bcryptjs |

## Folder Structure

```
pharmacy-management-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── medicineController.js
│   │   ├── salesController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Medicine.js
│   │   └── Sale.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── salesRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env.example
│   ├── package.json
│   ├── seeder.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── LowStockAlert.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── POS.jsx
│   │   │   └── Receipt.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a free MongoDB Atlas cluster

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env if your Mongo URI or JWT secret differ
npm run seed     # creates demo users + demo medicines
npm run dev      # starts on http://localhost:5000
```

Demo accounts created by the seeder:
| Role | Email | Password |
|---|---|---|
| Admin | admin@pharmacy.com | admin123 |
| Pharmacist | pharmacist@pharmacy.com | pharma123 |
| Cashier | cashier@pharmacy.com | cash123 |

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev      # starts on http://localhost:5173
```

Open `http://localhost:5173` and log in with a demo account above.

## API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register a new user |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Authenticated | Get current user |
| GET | /api/medicines | Authenticated | List/search medicines |
| GET | /api/medicines/low-stock | Authenticated | List low-stock medicines |
| POST | /api/medicines | Admin, Pharmacist | Create medicine |
| PUT | /api/medicines/:id | Admin, Pharmacist | Update medicine |
| DELETE | /api/medicines/:id | Admin | Delete medicine |
| POST | /api/sales | Authenticated | Checkout cart, deducts stock, returns receipt |
| GET | /api/sales | Authenticated | List all sales |
| GET | /api/dashboard/summary | Authenticated | Dashboard analytics |

## Notes on Production Hardening

- The `.env` files contain secrets — never commit real `.env` files; only `.env.example` is checked in.
- `JWT_SECRET` in `.env.example` is a placeholder — always replace it with a long random string in real deployments.
- Stock deduction during checkout validates all cart items before deducting any of them, then deducts sequentially. For high-concurrency, multi-instance deployments, upgrade this to a MongoDB replica set and wrap the operation in a Mongoose transaction (`session.startTransaction()`), which standalone local MongoDB instances don't support.
- Add rate limiting (e.g. `express-rate-limit`) and helmet (`helmet` package) before exposing this API publicly.
- CORS is currently open (`cors()` with no options) — restrict `origin` to your deployed frontend domain in production.
