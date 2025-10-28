import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@warehouse.com' },
    update: {},
    create: {
      email: 'admin@warehouse.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@warehouse.com' },
    update: {},
    create: {
      email: 'operator@warehouse.com',
      password: await bcrypt.hash('operator123', 12),
      name: 'Operator User',
      role: UserRole.OPERATOR,
    },
  });

  console.log('✅ Users created');

  // Create materials
  const materials = [
    { barcode: 'MAT-001', name: 'Tepung Terigu', unit: 'kg', minStock: 100 },
    { barcode: 'MAT-002', name: 'Gula Pasir', unit: 'kg', minStock: 50 },
    { barcode: 'MAT-003', name: 'Mentega', unit: 'kg', minStock: 30 },
    { barcode: 'MAT-004', name: 'Telur', unit: 'kg', minStock: 40 },
    { barcode: 'MAT-005', name: 'Susu Bubuk', unit: 'kg', minStock: 25 },
  ];

  for (const mat of materials) {
    await prisma.material.upsert({
      where: { barcode: mat.barcode },
      update: {},
      create: {
        ...mat,
        description: `Sample material: ${mat.name}`,
      },
    });
  }

  console.log('✅ Materials created');

  // Create products
  const products = [
    { barcode: 'PRD-001', name: 'Roti Tawar', unit: 'box', minStock: 20 },
    { barcode: 'PRD-002', name: 'Kue Kering', unit: 'box', minStock: 30 },
    { barcode: 'PRD-003', name: 'Biskuit', unit: 'box', minStock: 25 },
    { barcode: 'PRD-004', name: 'Donat', unit: 'box', minStock: 15 },
    { barcode: 'PRD-005', name: 'Cake', unit: 'box', minStock: 10 },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { barcode: prod.barcode },
      update: {},
      create: {
        ...prod,
        description: `Sample product: ${prod.name}`,
      },
    });
  }

  console.log('✅ Products created');

  // Create stock summary
  for (const mat of materials) {
    const material = await prisma.material.findUnique({
      where: { barcode: mat.barcode },
    });
    
    if (material) {
      await prisma.stockSummary.upsert({
        where: { barcode: mat.barcode },
        update: {},
        create: {
          barcode: mat.barcode,
          materialId: material.id,
          currentStock: Math.floor(Math.random() * 200) + 50,
          unit: mat.unit,
        },
      });
    }
  }

  for (const prod of products) {
    const product = await prisma.product.findUnique({
      where: { barcode: prod.barcode },
    });
    
    if (product) {
      await prisma.stockSummary.upsert({
        where: { barcode: prod.barcode },
        update: {},
        create: {
          barcode: prod.barcode,
          productId: product.id,
          currentStock: Math.floor(Math.random() * 100) + 20,
          unit: prod.unit,
        },
      });
    }
  }

  console.log('✅ Stock summary created');

  // Create sample transactions
  const material1 = await prisma.material.findUnique({ where: { barcode: 'MAT-001' } });
  const product1 = await prisma.product.findUnique({ where: { barcode: 'PRD-001' } });

  if (material1) {
    await prisma.inventoryTransaction.create({
      data: {
        transactionNo: 'INB-20240101-0001',
        type: 'INBOUND',
        itemType: 'MATERIAL',
        barcode: material1.barcode,
        materialId: material1.id,
        quantity: 100,
        unit: 'kg',
        initialWeight: 100,
        currentWeight: 100,
        supplier: 'PT Supplier ABC',
        referenceNo: 'PO-2024-001',
        userId: admin.id,
      },
    });
  }

  if (product1) {
    await prisma.inventoryTransaction.create({
      data: {
        transactionNo: 'OUT-20240101-0001',
        type: 'OUTBOUND',
        itemType: 'PRODUCT',
        barcode: product1.barcode,
        productId: product1.id,
        quantity: 50,
        unit: 'box',
        initialWeight: 50,
        currentWeight: 49.5,
        shrinkage: 0.5,
        destination: 'Toko XYZ',
        referenceNo: 'DO-2024-001',
        userId: operator.id,
      },
    });
  }

  console.log('✅ Sample transactions created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
