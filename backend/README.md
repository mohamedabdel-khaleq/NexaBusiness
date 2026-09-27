# NexaBusiness Backend

NexaBusiness is a business management backend API built with Node.js, Express.js, PostgreSQL, and Prisma ORM.

## Features

* Authentication & JWT
* Role-based access control
* Permission management
* User & Role management
* Category management
* Product management
* Barcode support
* Inventory management
* Customer management
* Employee & Department management
* Sales management
* POS checkout
* Payment management
* Dashboard
* Reports
* Notifications
* Low-stock alerts
* Delivery drivers
* Delivery orders
* Driver location tracking
* Customer delivery tracking
* Support tickets & messages
* Input validation with Zod

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* JWT
* bcrypt
* Zod
* CORS

## Project Structure

```text
backend/
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

## Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME"
PORT=5000
JWT_SECRET="your_jwt_secret_here"
```

> Never commit your real `.env` file or expose database credentials and JWT secrets.

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Apply database migrations

```bash
npx prisma migrate deploy
```

### 5. Start the server

```bash
node server.js
```

The API will run on:

```text
http://localhost:5000
```

## Health Check

```http
GET /api/health
```

Example response:

```json
{
  "status": "ok"
}
```

## Main API Modules

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
| Reports          | `/api/reports`          |
| POS              | `/api/pos`              |
| Delivery Drivers | `/api/delivery-drivers` |
| Delivery Orders  | `/api/delivery-orders`  |
| Support Tickets  | `/api/support-tickets`  |

## Authentication

Protected endpoints require a JWT token.

```text
Authorization: Bearer YOUR_TOKEN
```

## Security

* Passwords are hashed using bcrypt.
* Authentication uses JWT.
* Role-based permissions protect sensitive endpoints.
* Request validation is handled using Zod.
* Environment secrets are excluded from Git.
* Users can only access their own notifications.
* Delivery status transitions are validated.
* POS stock updates use atomic database operations.
* Sensitive user-owned resources are protected by authorization checks.

## Database

The project uses PostgreSQL with Prisma ORM.

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

## Development

Start the backend:

```bash
node server.js
```

For development with automatic restart:

```bash
npx nodemon server.js
```

## Environment Variables

The project uses the following environment variables:

```env
DATABASE_URL=
PORT=
JWT_SECRET=
```

For security, real environment values must remain inside `.env` and should never be committed to Git.

## API Testing

The API can be tested using tools such as:

* Postman
* Insomnia
* Thunder Client

Start the server first:

```bash
node server.js
```

Then send requests to:

```text
http://localhost:5000
```

## Project Status

The backend includes the core business management modules required for the NexaBusiness platform, including authentication, authorization, products, inventory, sales, POS, payments, customers, employees, notifications, delivery tracking, support tickets, dashboard, and reports.

## Author

Mohamed Abd El-khaleq
