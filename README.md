<div align="center">

<img src="https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
<img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
<img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>

# 📦 Stock Management System

**A full-stack inventory and sales management application for small to medium-sized retail businesses.**

[Features](#-features) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Role Permissions](#-role-based-access-control) · [Team](#-team)

</div>

---

## 📌 Overview

The **Stock Management System** is a decoupled, three-tier web application that streamlines inventory control, procurement, and point-of-sale operations. It supports multiple user roles with fine-grained access control, automated stock tracking, and real-time reporting.

> Built as a group project for the **Enterprise Application Development 2** module — Group No. 36

---

## ✨ Features

| Module | Capabilities |
|---|---|
| 🔐 **Authentication** | JWT-based login, role-based guards, BCrypt password hashing |
| 📦 **Products** | CRUD, barcode support, low-stock alerts, category & supplier linking |
| 🗂️ **Categories** | Create and manage product classifications |
| 🏭 **Suppliers** | Full supplier directory with contact details |
| 👥 **Customers** | Customer registry with sales history linkage |
| 🛒 **Purchases (GRN)** | Create Goods Received Notes → approve to auto-increment stock |
| 💳 **Sales (POS)** | Multi-item invoices, CASH/CARD payment, auto-decrement stock |
| 📊 **Stock History** | Full audit trail of all inventory movements + manual adjustments |
| 📈 **Reports** | Sales, purchase, profit reports with CSV export |
| 👤 **User Management** | Admin-only user creation, role assignment, activate/deactivate |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│   React 18 SPA  │  TypeScript  │  Material UI  │  Vite      │
│   Axios + JWT interceptor  │  React Router v6 guards        │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP / JSON + Bearer JWT
┌──────────────────────────▼──────────────────────────────────┐
│                       BACKEND LAYER                          │
│   Spring Boot 3.2.5  │  Java 17  │  REST API                │
│   Spring Security + JwtAuthFilter  │  BCryptPasswordEncoder  │
│   Service Layer: Business Logic + Auto Stock Updates         │
└──────────────────────────┬──────────────────────────────────┘
                           │  Spring Data JPA / Hibernate
┌──────────────────────────▼──────────────────────────────────┐
│                      DATABASE LAYER                          │
│   MySQL 8.x  │  Auto-schema via Hibernate DDL               │
│   Tables: users, products, categories, suppliers,           │
│           customers, purchases, sales, stocks               │
└─────────────────────────────────────────────────────────────┘
```

**Automated Inventory Logic:**
- ✅ **GRN Approved** → stock quantity **incremented** automatically
- 🛒 **Sale Created** → stock quantity **decremented** automatically
- 🔧 **Manual Adjustment** → positive (add) or negative (remove, e.g. damaged goods)

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology | Version |
|---|---|---|
| Framework | Spring Boot | 3.2.5 |
| Language | Java | 17 |
| Security | Spring Security + JWT (JJWT) | 0.11.5 |
| Persistence | Spring Data JPA + Hibernate | — |
| Database | MySQL | 8.x |
| Build Tool | Apache Maven | 3.8+ |

### Frontend
| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.3.1 |
| Language | TypeScript | 5.6 |
| Build Tool | Vite | 5.4.8 |
| UI Library | Material UI (MUI) | v5 |
| HTTP Client | Axios | 1.7.7 |
| Routing | React Router | v6 |
| Charts | Recharts | 3.7.0 |
| Date Utils | Day.js | 1.11.13 |

---

## 🚀 Getting Started

### Prerequisites

- **Java 17+** (JDK)
- **Apache Maven 3.8+**
- **MySQL 8.x** running locally
- **Node.js 18+** and npm
- IDE: IntelliJ IDEA (backend) + VS Code (frontend) recommended

---

### Step 1 — Database Setup

Open MySQL Workbench (or any MySQL client) and create the database:

```sql
CREATE DATABASE stock_management_db;
```

Open `Stock_Managment/src/main/resources/application.yaml` and update your credentials:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/stock_management_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: YOUR_MYSQL_USERNAME
    password: YOUR_MYSQL_PASSWORD
```

> 💡 **Hibernate** will auto-generate all tables on first run — no SQL scripts needed.

---

### Step 2 — Start the Backend

Navigate to the `Stock_Managment/` directory (where `pom.xml` lives):

```bash
mvn clean package -DskipTests
java -jar target/Stock_Managment-0.0.1-SNAPSHOT.jar
```

Or run directly from your IDE:
```
StockManagmentApplication.java → Run as Spring Boot App
```

✅ Backend starts at **http://localhost:8080**

---

### Step 3 — Start the Frontend

Navigate to the `stock-frontend/` directory:

```bash
npm install
npm run dev
```

✅ Frontend starts at **http://localhost:5173** — automatically connects to the backend.

---

### Step 4 — Create the First Admin User

On first run, the database is empty. Insert the initial admin using a BCrypt-encoded password.

Generate a BCrypt hash at [bcrypt-generator.com](https://bcrypt-generator.com), then run:

```sql
INSERT INTO users (name, email, password, role, status, created_at)
VALUES ('Admin', 'admin@sms.com', '<YOUR_BCRYPT_HASH>', 'ADMIN', 'ACTIVE', NOW());
```

> Once logged in as Admin, create **MANAGER** and **CASHIER** accounts directly from the **Users Management** page inside the application. No further SQL is required.

---

## 🔐 Role-Based Access Control

The system enforces fine-grained permissions via Spring Security:

| Endpoint Group | ADMIN | MANAGER | CASHIER |
|---|:---:|:---:|:---:|
| Auth (Login) | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ |
| Own Profile | ✅ | ✅ | ✅ |
| Products — View | ✅ | ✅ | ✅ |
| Products — Create/Edit | ✅ | ✅ | ❌ |
| Products — Delete | ✅ | ❌ | ❌ |
| Categories — View | ✅ | ✅ | ✅ |
| Categories — Create/Edit | ✅ | ✅ | ❌ |
| Suppliers — View/Manage | ✅ | ✅ | ❌ |
| Suppliers — Delete | ✅ | ❌ | ❌ |
| Purchases (GRN) | ✅ | ✅ | ❌ |
| Sales — View/Create | ✅ | ✅ | ✅ |
| Sales — Edit | ✅ | ✅ | ❌ |
| Sales — Delete | ✅ | ❌ | ❌ |
| Customers — View/Create | ✅ | ✅ | ✅ |
| Customers — Delete | ✅ | ❌ | ❌ |
| Stock Management | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ |

---

## 📡 API Reference

All endpoints are prefixed with `http://localhost:8080`. All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

### 🔑 Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login and receive JWT | Public |

### 📦 Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | Get product by ID |
| GET | `/api/products/search?name=` | Search products by name |
| GET | `/api/products/low-stock` | Get products below reorder level |
| GET | `/api/products/barcode/{barcode}` | Get product by barcode |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |

### 🛒 Purchases (GRN)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/purchases` | List all GRNs |
| GET | `/api/purchases/{id}` | Get GRN by ID |
| GET | `/api/purchases/{id}/items` | Get GRN line items |
| GET | `/api/purchases/supplier/{supplierId}` | Filter by supplier |
| GET | `/api/purchases/status/{status}` | Filter by status (PENDING/APPROVED/REJECTED) |
| POST | `/api/purchases/create` | Create new GRN |
| PUT | `/api/purchases/{id}` | Update GRN |
| PATCH | `/api/purchases/{id}/approve` | **Approve GRN → auto-increment stock** |
| PATCH | `/api/purchases/{id}/reject` | Reject GRN |
| DELETE | `/api/purchases/{id}` | Delete GRN |

### 💳 Sales
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sales` | List all sales |
| GET | `/api/sales/{id}` | Get sale by ID |
| GET | `/api/sales/{id}/items` | Get sale line items |
| GET | `/api/sales/{id}/invoice` | Generate invoice |
| GET | `/api/sales/customer/{customerId}` | Sales by customer |
| POST | `/api/sales/create` | **Create sale → auto-decrement stock** |
| PUT | `/api/sales/{id}` | Update sale |
| DELETE | `/api/sales/{id}` | Delete sale |

### 📊 Stock
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stocks` | List all stock entries |
| GET | `/api/stocks/history` | Full stock history/audit trail |
| GET | `/api/stocks/product/{productId}` | Stock history for a product |
| POST | `/api/stocks/adjust/{productId}` | Manual stock adjustment |
| DELETE | `/api/stocks/{id}` | Delete stock entry |

### 📈 Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/sales?start=&end=` | Sales report by date range |
| GET | `/api/reports/purchases?start=&end=` | Purchase report by date range |
| GET | `/api/reports/profit?start=&end=` | Profit report by date range |
| GET | `/api/reports/low-stock` | Low stock report |
| GET | `/api/reports/suppliers` | Supplier report |
| GET | `/api/reports/daily-sales/csv?date=` | Download daily sales as CSV |

### 👤 Users (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users/profile` | Get own profile |
| POST | `/api/users` | Create user |
| PUT | `/api/users/{id}` | Update user |
| PUT | `/api/users/profile` | Update own profile |
| PATCH | `/api/users/profile/password` | Change own password |
| PATCH | `/api/users/{id}/activate` | Activate user |
| PATCH | `/api/users/{id}/deactivate` | Deactivate user |
| PATCH | `/api/users/{id}/role` | Change user role |
| PATCH | `/api/users/{id}/reset-password` | Admin reset user password |
| DELETE | `/api/users/{id}` | Delete user |

---

## 📁 Project Structure

```
Stock-Management-System/
│
├── Stock_Managment/                  # Spring Boot Backend
│   └── src/main/java/.../
│       ├── config/                   # CORS + Security config
│       ├── controller/               # REST controllers (10 modules)
│       ├── dto/                      # Request/Response DTOs
│       ├── entity/                   # JPA entities
│       ├── exception/                # Global exception handling
│       ├── repository/               # Spring Data JPA repositories
│       ├── security/                 # JwtUtils + JwtAuthFilter
│       └── service/                  # Business logic layer
│
└── stock-frontend/                   # React + TypeScript Frontend
    └── src/
        ├── api/                      # Axios client + endpoint definitions
        ├── auth/                     # AuthContext + RequireAuth guard
        ├── components/               # Shared UI components
        ├── layout/                   # App shell / sidebar layout
        ├── pages/                    # Feature pages (Dashboard, Products, etc.)
        ├── types/                    # TypeScript API type definitions
        └── utils/                    # Currency formatting helpers
```

---

## 👥 Team

| # | Index No. | Name | Contribution |
|---|---|---|---|
| 01 | 28161 | N S Y Jayathilaka | Stock & Reports Module CRUD (Stock Control + CSV Export + Analytics) |
| 02 | 29149 | M Y A Aberathna | Product Management (CRUD + Barcode + Stock Link) |
| 03 | 30341 | P A G Manawadu | Authentication & User Management (Login, Roles, JWT Security) |
| 04 | 29657 | K K G A Devinda | Customer Management (CRUD + Sales Integration) |
| 05 | 29327 | M M R Herath | Purchase / GRN Management (Create + Approve + Stock Update) |
| 06 | 29876 | M K Jayashan | Supplier Management (CRUD + GRN Integration) |
| 07 | 28611 | M R P Chathuranga | Stock & Reports Module CRUD (Stock Control + CSV Export + Analytics) |
| 08 | 30688 | Chinthaka J K | Category Management (CRUD + Product Mapping) |

---

## ⚠️ Security Note

The `application.yaml` file in this repository contains a default JWT secret and database credentials for **local development only**.

Before deploying to any shared or production environment:
- Replace the JWT secret with a strong, randomly generated key
- Use environment variables or a secrets manager for database credentials
- Enable SSL on the database connection

---

<div align="center">

Made with ☕ and Java | Group 36 — Enterprise Application Development 2

</div>
