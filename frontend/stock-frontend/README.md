# Stock Management Frontend (React + Vite)

This frontend is built to match your Spring Boot backend in **Stock_Managment_Complete.zip**.

## 1) Prerequisites
- Node.js 18+ (recommended)
- Backend running (default: `http://localhost:8080`)

## 2) Configure backend URL
Create a `.env` file in the project root:

```
VITE_API_BASE_URL=http://localhost:8080
```

(You can copy `.env.example`.)

## 3) Install & run

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

## 4) Login
Your backend currently has **permitAll** in `SecurityConfig`, so the UI login is a simple demo:
- It fetches `/api/users`
- Finds the user by email
- Uses `bcryptjs` to compare the entered password with the BCrypt hash stored in DB

So you must create a user first using backend:

`POST /api/users`

Example JSON:

```json
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "1234",
  "role": "ADMIN"
}
```

## Pages
- Dashboard (counts + low stock)
- Products (CRUD)
- Categories (CRUD)
- Suppliers (CRUD)
- Customers (CRUD)
- Purchases/GRN (create + approve/reject)
- Sales (create)
- Stock (history + adjustments)
- Reports (sales, purchases, profit by date range)
- Users (CRUD + activate/deactivate + reset password)
