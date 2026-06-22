# Textile ERP Desktop Application - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (Supabase recommended)
- Git

## Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy the following credentials:
   - Project URL
   - anon/public key
   - service_role key (for backend)

## Environment Configuration

### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development
```

### Client Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:3001
```

## Installation Steps

### 1. Install Root Dependencies

```bash
npm install
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Setup Database

From the `server` directory:

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with initial data
npm run seed
```

### 5. Start Development Servers

#### Terminal 1 - Start Backend Server

```bash
cd server
npm run dev
```

The backend will run on `http://localhost:3001`

#### Terminal 2 - Start Frontend Development Server

```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Login Credentials

After running the seed script, you can login with:

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Office Staff:**
- Username: `staff`
- Password: `staff123`

## Running as Desktop Application (Electron)

To run the application as a desktop app:

```bash
# From root directory
npm run electron:dev
```

## Building for Production

### Backend Build

```bash
cd server
npm run build
npm start
```

### Frontend Build

```bash
cd client
npm run build
```

### Electron Desktop Build

```bash
# From root directory
npm run build:electron
```

The built executable will be in the `dist` directory.

## Project Structure

```
textile-erp-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth, Theme)
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                # Node.js backend
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Database seed script
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Express middlewares
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utility functions
│   │   └── server.ts      # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── electron/              # Electron main process
│   └── main.js
├── .env.example           # Environment variables template
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/password` - Change password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

### Inventory
- `GET /api/inventory` - Get all inventory
- `GET /api/inventory/:id` - Get inventory by ID
- `POST /api/inventory/adjust` - Adjust inventory
- `GET /api/inventory/transactions/:id` - Get transaction history

### Purchase Orders
- `GET /api/purchase-orders` - Get all purchase orders
- `GET /api/purchase-orders/:id` - Get purchase order by ID
- `POST /api/purchase-orders` - Create purchase order
- `PUT /api/purchase-orders/:id` - Update purchase order
- `POST /api/purchase-orders/:id/approve` - Approve order
- `POST /api/purchase-orders/:id/estimate` - Estimate order
- `POST /api/purchase-orders/:id/confirm` - Confirm order
- `POST /api/purchase-orders/:id/cancel` - Cancel order

### Delivery Orders
- `GET /api/delivery-orders` - Get all delivery orders
- `GET /api/delivery-orders/:id` - Get delivery order by ID
- `POST /api/delivery-orders` - Create delivery order
- `PUT /api/delivery-orders/:id` - Update delivery order
- `DELETE /api/delivery-orders/:id` - Delete delivery order

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/monthly-sales` - Get monthly sales data
- `GET /api/dashboard/top-products` - Get top products
- `GET /api/dashboard/top-customers` - Get top customers

### Reports
- `GET /api/reports/sales` - Get sales report
- `GET /api/reports/inventory` - Get inventory report
- `GET /api/reports/orders` - Get order report
- `GET /api/reports/invoices` - Get invoice report
- `GET /api/reports/deliveries` - Get delivery report
- `GET /api/reports/cancelled-orders` - Get cancelled orders report

### Activity Logs
- `GET /api/activity-logs` - Get all activity logs (Admin only)
- `GET /api/activity-logs/:id` - Get activity log by ID (Admin only)

## Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Ensure Supabase project is active
- Check network connectivity

### TypeScript Errors
- Run `npm install` in the server directory
- Run `npm run prisma:generate` to regenerate Prisma client

### Frontend Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Ensure Vite is properly configured

### Electron Issues
- Ensure Electron is installed in root dependencies
- Check that the frontend build output path is correct

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **Database Studio**: Use `npm run prisma:studio` to view and edit database
3. **API Testing**: Use tools like Postman or Insomnia to test API endpoints
4. **Logs**: Check console for error messages and debug information

## Security Notes

- Change JWT_SECRET in production
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Implement rate limiting for API endpoints
- Regularly update dependencies

## Support

For issues or questions, refer to the main README.md or contact the development team.
