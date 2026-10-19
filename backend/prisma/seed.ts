// backend/prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Usaha Baru Cycle database...');

  // 1. Seed Admin User
  const defaultAdminEmail = 'admin@usahabarucycle.com';
  const hashedPassword = await bcrypt.hash('AdminSepeda123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: defaultAdminEmail },
    update: {},
    create: {
      email: defaultAdminEmail,
      name: 'Pemilik Toko Usaha Baru Cycle',
      password: hashedPassword,
      role: Role.MSME_ADMIN,
    },
  });
  console.log(`✅ Admin created: ${admin.email} (Password: AdminSepeda123!)`);

  // 2. Seed Categories
  const categoriesData = [
    { name: 'Sepeda Gunung (MTB)', slug: 'sepeda-gunung-mtb' },
    { name: 'Sepeda Lipat (Folding Bike)', slug: 'sepeda-lipat' },
    { name: 'Sepeda Balap (Road Bike)', slug: 'sepeda-balap' },
    { name: 'Spare Parts & Komponen', slug: 'spare-parts' },
    { name: 'Aksesoris & Apparel', slug: 'aksesoris-apparel' },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );
  console.log(`✅ Seeded ${categories.length} categories.`);

  // 3. Seed Sample Products
  const mtbCategory = categories.find((c) => c.slug === 'sepeda-gunung-mtb');
  const foldingCategory = categories.find((c) => c.slug === 'sepeda-lipat');
  const partsCategory = categories.find((c) => c.slug === 'spare-parts');
  const accCategory = categories.find((c) => c.slug === 'aksesoris-apparel');

  const productsData = [
    {
      name: 'Polygon Premier 5 MTB 27.5"',
      categoryId: mtbCategory?.id || categories[0].id,
      price: 4950000,
      stock: 4,
      isAvailable: true,
      description: 'Sepeda gunung serbaguna dengan frame AL6 Alloy yang ringan dan kokoh, groupset Shimano 2x9 speed, dan hydraulic disc brake untuk pengereman optimal di segala medan.',
      imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'United Clovis 3.10 Trail MTB',
      categoryId: mtbCategory?.id || categories[0].id,
      price: 6200000,
      stock: 2,
      isAvailable: true,
      description: 'Sepeda trail dengan travel fork 120mm lock-out, frame hydroformed boost, dan drivetrain Shimano Deore 1x10 speed.',
      imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Pacific Noris 2.8 20" Folding Bike',
      categoryId: foldingCategory?.id || categories[1].id,
      price: 3650000,
      stock: 5,
      isAvailable: true,
      description: 'Sepeda lipat sporty 20 inci dengan 8 kecepatan, mechanical disc brake, dan frame alloy ringan yang mudah dilipat untuk mobilitas harian.',
      imageUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Element Troy 10 Speed Gold Edition',
      categoryId: foldingCategory?.id || categories[1].id,
      price: 4200000,
      stock: 0,
      isAvailable: false,
      description: 'Sepeda lipat 16 inci Chromoly frame, hollowtech crankset, dan 10-speed drivetrain Sensah Empire.',
      imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Shimano Deore M5100 Rear Derailleur 11-Speed',
      categoryId: partsCategory?.id || categories[3].id,
      price: 580000,
      stock: 12,
      isAvailable: true,
      description: 'Rear derailleur original Shimano Deore dengan teknologi Shadow RD+ untuk rantai stabil tanpa getaran berlebih di lintasan kasar.',
      imageUrl: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Helm Sepeda Cairbull All-Road Aerodynamic',
      categoryId: accCategory?.id || categories[4].id,
      price: 275000,
      stock: 15,
      isAvailable: true,
      description: 'Helm ultralight dengan ventilasi udara 21 lubang, visor magnetik anti-silau, dan sertifikasi keamanan CE EN 1078.',
      imageUrl: 'https://images.unsplash.com/photo-1557803172-e56b46e3be47?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const prod of productsData) {
    const existing = await prisma.product.findFirst({ where: { name: prod.name } });
    if (!existing) {
      await prisma.product.create({ data: prod });
    }
  }
  console.log(`✅ Sample products seeded.`);

  // 4. Seed Initial Visitor Logs & Sample Orders
  const sampleOrders = [
    {
      customerName: 'Budi Santoso',
      customerWa: '6281283301830',
      productName: 'Polygon Premier 5 MTB 27.5"',
      totalAmount: 4950000,
      status: 'CONFIRMED' as const,
      notes: 'Customer berminat COD langsung di toko Usaha Baru Cycle.',
    },
    {
      customerName: 'Rina Wijaya',
      customerWa: '6285712345678',
      productName: 'Pacific Noris 2.8 20" Folding Bike',
      totalAmount: 3650000,
      status: 'COMPLETED' as const,
      notes: 'Sudah dibayar dan diambil di toko.',
    },
  ];

  for (const ord of sampleOrders) {
    await prisma.order.create({ data: ord });
  }

  // Seed 42 initial visits
  for (let i = 0; i < 42; i++) {
    await prisma.visitorLog.create({
      data: {
        userAgent: 'Mozilla/5.0 Sample Browser',
        visitedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      },
    });
  }
  console.log(`✅ Sample orders and visitor logs created.`);
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
