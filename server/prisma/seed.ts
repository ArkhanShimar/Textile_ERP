import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create default users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'System Administrator',
      email: 'admin@textileerp.com',
      role: 'ADMIN',
      isActive: true
    }
  });

  const staff = await prisma.user.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      username: 'staff',
      password: staffPassword,
      fullName: 'Office Staff',
      email: 'staff@textileerp.com',
      role: 'OFFICE_STAFF',
      isActive: true
    }
  });

  console.log('Created users:', { admin, staff });

  // Create default stores
  const sltiStore = await prisma.store.upsert({
    where: { code: 'SLTI' },
    update: {},
    create: {
      name: 'SLTI Store',
      code: 'SLTI',
      address: 'Main Warehouse',
      phone: '+91-1234567890',
      isActive: true
    }
  });

  const htlStore = await prisma.store.upsert({
    where: { code: 'HTL' },
    update: {},
    create: {
      name: 'HTL Store',
      code: 'HTL',
      address: 'Secondary Warehouse',
      phone: '+91-0987654321',
      isActive: true
    }
  });

  console.log('Created stores:', { sltiStore, htlStore });

  // Create default category
  const category = await prisma.category.upsert({
    where: { name: 'Textiles' },
    update: {},
    create: {
      name: 'Textiles',
      description: 'Textile products'
    }
  });

  console.log('Created category:', category);

  // Create sample product
  const product = await prisma.product.upsert({
    where: { code: 'TXT-001' },
    update: {},
    create: {
      code: 'TXT-001',
      name: 'Cotton Fabric',
      categoryId: category.id,
      storeId: sltiStore.id,
      size: 'Standard',
      color: 'White',
      unitPrice: 500,
      description: 'Premium cotton fabric',
      isActive: true
    }
  });

  // Create inventory for product
  await prisma.inventory.upsert({
    where: { productId: product.id },
    update: {},
    create: {
      productId: product.id,
      storeId: sltiStore.id,
      availableQuantity: 100,
      reservedQuantity: 0,
      totalQuantity: 100,
      lowStockThreshold: 10
    }
  });

  console.log('Created product and inventory:', product);

  // Create sample customer
  const customer = await prisma.customer.upsert({
    where: { id: 'default-customer' },
    update: {},
    create: {
      id: 'default-customer',
      name: 'Sample Customer',
      phone: '+91-9876543210',
      email: 'customer@example.com',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isActive: true
    }
  });

  console.log('Created customer:', customer);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
