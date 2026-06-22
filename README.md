# Textile ERP Desktop Application

A comprehensive ERP system for textile business management, built as a desktop application using Electron, React, and Express with PostgreSQL database.

## Features

- **Authentication**: Secure login with JWT and bcrypt
- **User Management**: Role-based access control (Admin, Office Staff)
- **Product Management**: Manage products, categories, and variants
- **Store Management**: Multi-store inventory tracking (SLTI, HTL)
- **Inventory Management**: Real-time stock tracking with transaction history
- **Purchase Order Management**: Complete PO workflow from creation to completion
- **Approval Workflow**: Admin approval and estimation process
- **Delivery Order Management**: Track dispatches and deliveries
- **Billing & Invoicing**: Generate and print invoices with PDF export
- **Reports**: Comprehensive reporting with Excel/PDF export
- **Dashboard**: Real-time statistics and charts
- **Real-time Sync**: Supabase Realtime for instant updates across all installations

## Technology Stack

### Desktop
- Electron.js

### Frontend
- React.js
- React Router DOM
- Tailwind CSS
- React Hook Form
- React Toastify
- Lucide React
- Recharts
- jsPDF
- SheetJS (xlsx)

### Backend
- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- bcrypt
- dotenv

### Database
- PostgreSQL (Supabase)

### Real-time
- Supabase Realtime

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure your database connection
   - Set up Supabase credentials
   - Configure JWT secret

4. Run database migrations:
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

## Building for Production

```bash
npm run build
```

This will create an executable in the `dist` folder.

## Project Structure

```
textile-erp-system/
├── client/                 # React frontend
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── contexts/
│   └── utils/
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── models/
│   │   ├── prisma/
│   │   ├── config/
│   │   └── utils/
│   └── prisma/
├── electron/               # Electron main process
└── docs/                   # Documentation
```

## User Roles

### Administrator
- Full system access
- Manage users
- Manage inventory
- Approve orders
- Create estimates
- Cancel orders
- Generate invoices
- Generate delivery orders
- View reports
- View dashboard

### Office Staff
- Create Purchase Orders
- Update inventory
- Receive packed items
- Generate invoices
- Generate delivery orders
- Manage customers
- Update order statuses

## Purchase Order Workflow

1. **Pending** - Order created
2. **Admin Review** - Admin approves or estimates
3. **Approved/Estimated** - Stock reserved
4. **Store Packs Items** - Items prepared
5. **Office Receives Packed Items** - Inventory reduced
6. **If Approved** → Invoice → Delivery Order → Completed
7. **If Estimated** → Estimation → Customer Decision → (Accepted → Approved) or (Rejected → Cancelled with stock restoration)

## License

ISC
