# NexaBusiness Backend

NexaBusiness is a production-ready business management backend API built with **Node.js, Express.js, PostgreSQL, and Prisma ORM**.

The platform provides a centralized backend for managing products, inventory, customers, employees, sales, POS operations, payments, notifications, delivery operations, support tickets, dashboards, and reports.

## 🚀 Live API

**Production API:**

https://nexabusiness-production.up.railway.app

**Health Check:**

https://nexabusiness-production.up.railway.app/api/health

The API is deployed on **Railway** with PostgreSQL and automated Prisma production migrations.

---

## ✨ Features

### Authentication & Authorization

* JWT authentication
* Password hashing with bcrypt
* Role-based access control (RBAC)
* Permission-based authorization
* User and role management

### Products & Inventory

* Product management
* Category management
* Barcode support
* Inventory transactions
* Stock tracking
* Low-stock detection

### Customers & Employees

* Customer management
* Employee management
* Department management

### Sales & POS

* Sales management
* POS checkout
* Multiple payment methods
* Automatic stock deduction
* Payment management
* Sales validation

### Dashboard & Reports

* Business dashboard
* Sales statistics
* Revenue tracking
* Payment statistics
* Outstanding amounts
* Low-stock products

### Notifications

* Sale notifications
* Low-stock alerts
* Admin notifications
* Read/unread notification management

### Delivery Management

* Delivery driver management
* Delivery orders
* Driver assignment
* Delivery status tracking
* Driver location tracking
* Customer delivery tracking
* Delivery state validation

### Customer Support

* Support tickets
* Support messages
* Admin notifications for new tickets

### Validation & Security

* Zod request validation
* Protected routes
* Resource ownership checks
* Atomic inventory updates
* Delivery state-machine validation
* Environment variable protection

---

## 🛠️ Tech Stack

| Technology | Purpose                      |
| ---------- | ---------------------------- |
| Node.js    | Backend runtime              |
| Express.js | REST API framework           |
| PostgreSQL | Relational database          |
| Prisma ORM | Database access & migrations |
| JWT        | Authentication               |
| bcrypt     | Password hashing             |
| Zod        | Request validation           |
| CORS       | Cross-origin requests        |
| Railway    | Production deployment        |

---

## 🏗️ Architecture

The backend follows a modular REST API architecture:

```text
Client
  │
  ▼
Express.js API
  │
  ├── Authentication
  ├── Authorization / RBAC
  ├── Validation
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ▼
Prisma ORM
  │
  ▼
PostgreSQL
```

---

## 📁 Project Structure

```text
backend/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── prisma.config.ts
└── server.js
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/mohamed-abdel-khaleq/NexaBusiness.git
cd NexaBusiness
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME"
PORT=5000
JWT_SECRET="your_jwt_secret_here"
```

> Never commit real environment variables, database credentials, or JWT secrets.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Apply database migrations

For an existing database:

```bash
npx prisma migrate deploy
```

For local development when creating new migrations:

```bash
npx prisma migrate dev
```

### 6. Start the server

```bash
node server.js
```

For development:

```bash
npx nodemon server.js
```

The API will run at:

```text
http://localhost:5000
```

---

## ❤️ Health Check

```http
GET /api/health
```

Example:

```json
{
  "status": "ok",
  "message": "NexaBusiness API is running"
}
```

---

## 📚 Main API Modules

| Module           | Base Route              |
| ---------------- | ----------------------- |
| Authentication   | `/api/auth`             |
| Users            | `/api/users`            |
| Categories       | `/api/categories`       |
| Products         | `/api/products`         |
| Inventory        | `/api/inventory`        |
| Customers        | `/api/customers`        |
| Sales            | `/api/sales`            |
| Payments         | `/api/payments`         |
| Employees        | `/api/employees`        |
| Departments      | `/api/departments`      |
| Notifications    | `/api/notifications`    |
| Dashboard        | `/api/dashboard`        |
| Sales Reports    | `/api/reports/sales`    |
| POS              | `/api/pos`              |
| Delivery Drivers | `/api/delivery-drivers` |
| Delivery Orders  | `/api/delivery-orders`  |
| Support Tickets  | `/api/support-tickets`  |

---

## 🔐 Authentication

Protected endpoints require a JWT access token.

```http
Authorization: Bearer YOUR_TOKEN
```

Authentication flow:

```text
Register / Login
      │
      ▼
JWT Access Token
      │
      ▼
Authentication Middleware
      │
      ▼
Role & Permission Check
      │
      ▼
Protected Resource
```

---

## 🛡️ Security

The API implements multiple security and data-integrity mechanisms:

* Passwords are hashed using bcrypt.
* Authentication uses JWT.
* Sensitive routes are protected with role-based permissions.
* Request payloads are validated using Zod.
* Environment secrets are excluded from Git.
* Users can only access their own notifications.
* Delivery status transitions are validated.
* Delivered delivery orders cannot be modified or deleted.
* POS stock updates use atomic database operations.
* Insufficient stock is rejected before completing a sale.
* Sensitive user-owned resources are protected with authorization checks.

---

## 💳 POS Checkout Flow

The POS module handles the complete checkout process:

```text
Customer
   │
   ▼
Select Products
   │
   ▼
Validate Stock
   │
   ▼
Calculate Total
   │
   ▼
Create Sale
   │
   ├── Create Payment
   │
   ├── Deduct Inventory
   │
   └── Create Notification
```

This keeps sales, payments, inventory, and notifications synchronized.

---

## 🚚 Delivery Flow

Delivery management follows the business flow:

```text
Sale
 │
 ▼
Delivery Order
 │
 ▼
Driver Assignment
 │
 ▼
Picked Up
 │
 ▼
In Transit
 │
 ▼
Delivered
```

Driver location tracking allows the backend to store the driver's latest location and support customer delivery tracking.

---

## 🔔 Notifications

The notification system supports:

* New sale notifications
* Low-stock notifications
* Support ticket notifications
* Admin notifications
* Read/unread state
* Mark all as read
* Notification deletion

---

## 🗄️ Database & Prisma

The project uses **PostgreSQL** with **Prisma ORM**.

Generate Prisma Client:

```bash
npx prisma generate
```

Create a development migration:

```bash
npx prisma migrate dev
```

Apply production migrations:

```bash
npx prisma migrate deploy
```

Railway is configured to run:

```bash
npx prisma migrate deploy
```

as a **Pre-deploy Command**, ensuring database migrations are applied before new production deployments.

---

## 🧪 API Testing

The API can be tested using:

* Postman
* Insomnia
* Thunder Client

Production API:

```text
https://nexabusiness-production.up.railway.app
```

Local API:

```text
http://localhost:5000
```

---

## ✅ Production Verification

The production API has been smoke-tested on Railway across the main business modules.

Verified flows include:

* Authentication
* JWT authorization
* Role-based permissions
* Categories
* Products
* Inventory transactions
* Customers
* POS checkout
* Payments
* Dashboard
* Sales reports
* Notifications

A complete POS transaction was also verified in production, including:

```text
Product Stock
     ↓
Inventory
     ↓
POS Checkout
     ↓
Sale
     ↓
Payment
     ↓
Updated Stock
     ↓
Dashboard / Reports
     ↓
Notification
```

---

## 🚀 Deployment

The backend is deployed using **Railway**.

Production environment:

```text
Railway
   │
   ├── Node.js / Express API
   │
   └── PostgreSQL
```

Database migrations are automatically applied before deployments through:

```bash
npx prisma migrate deploy
```

---

## 📌 Project Status

NexaBusiness currently includes the core backend infrastructure for a business management platform, including:

* Authentication & authorization
* Products & categories
* Inventory
* Customers
* Employees & departments
* Sales & POS
* Payments
* Dashboard & reports
* Notifications
* Delivery management
* Driver tracking
* Customer support
* Validation and security

The backend is deployed and operational in a production environment.

---

## 👨‍💻 Author

**Mohamed Abd El-khaleq**

Full Stack Developer

GitHub:
https://github.com/mohamed-abdel-khaleq

---
