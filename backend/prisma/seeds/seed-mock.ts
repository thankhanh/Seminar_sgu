import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed mock data...');

  // 1. Create a set of Users
  const passwordHash = await bcrypt.hash('Password@123', 10);
  console.log('  📍 Tạo Users...');
  const usersToCreate = Array.from({ length: 20 }).map((_, i) => ({
    name: `User Test ${i + 1}`,
    email: `user${i + 1}@test.com`,
    passwordHash,
    phone: `0901234${String(i).padStart(3, '0')}`,
    role: i < 5 ? 'merchant' : 'user',
    isActive: true,
  }));

  const createdUsers = [];
  for (const user of usersToCreate) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    createdUsers.push(created);
  }

  // 2. Create Merchants from first 5 users
  console.log('  📍 Tạo Merchants...');
  const merchants = [];
  for (let i = 0; i < 5; i++) {
    const merchantUser = createdUsers[i];
    const created = await prisma.merchant.upsert({
      where: { userId: merchantUser.id },
      update: {},
      create: {
        userId: merchantUser.id,
        businessName: `Quán ăn số ${i + 1}`,
        status: 'approved',
      },
    });
    merchants.push(created);
  }

  // 3. Create Stores & Menus & QRCodes for each merchant
  console.log('  📍 Tạo Stores, Menus, và QRCodes...');
  for (let i = 0; i < merchants.length; i++) {
    const merchant = merchants[i];
    
    // Each merchant has 2 stores
    for (let j = 0; j < 2; j++) {
      // Offset coords around Ho Chi Minh city (approx 10.762622, 106.660172)
      const lat = 10.762622 + (Math.random() - 0.5) * 0.05;
      const lng = 106.660172 + (Math.random() - 0.5) * 0.05;

      const store = await prisma.store.create({
        data: {
          merchantId: merchant.id,
          name: `Cửa hàng ${merchant.businessName} - Chi nhánh ${j + 1}`,
          address: `${Math.floor(Math.random() * 100) + 1} Đường ABC, Quận ${Math.floor(Math.random() * 10) + 1}, TP.HCM`,
          lat,
          lng,
          openTime: '08:00',
          closeTime: '22:00',
          status: 'active',
        },
      });

      // Create QR Code
      await prisma.qrCode.create({
        data: {
          storeId: store.id,
          code: `STORE_${store.id.substring(0, 8).toUpperCase()}`,
        }
      });

      // Create Menus
      for (let k = 0; k < 5; k++) {
        await prisma.menu.create({
          data: {
            storeId: store.id,
            name: `Món ăn ${k + 1}`,
            description: `Mô tả ngon miệng cho món ăn ${k + 1}`,
            price: Math.floor(Math.random() * 50 + 20) * 1000,
            isAvailable: true,
          },
        });
      }
    }
  }

  // 4. Create Listen History for test load
  console.log('  📍 Tạo ListenHistory...');
  const normalUsers = createdUsers.slice(5);
  const allStores = await prisma.store.findMany();
  // Assume default seeds has some narrations. If not, create some.
  let allNarrations = await prisma.narration.findMany();
  if (allNarrations.length === 0 && allStores.length > 0) {
    const viLang = await prisma.language.findUnique({ where: { code: 'vi' } });
    if (viLang) {
      for (const store of allStores) {
        await prisma.narration.create({
          data: {
            storeId: store.id,
            languageId: viLang.id,
            textContent: `Chào mừng bạn đến với ${store.name}`,
          }
        });
      }
      allNarrations = await prisma.narration.findMany();
    }
  }

  if (allNarrations.length > 0) {
    for (const user of normalUsers) {
      for (let i = 0; i < 3; i++) {
        const randomNarration = allNarrations[Math.floor(Math.random() * allNarrations.length)];
        await prisma.listenHistory.create({
          data: {
            userId: user.id,
            storeId: randomNarration.storeId,
            narrationId: randomNarration.id,
            source: Math.random() > 0.5 ? 'gps' : 'qr',
          }
        });
      }
    }
  }

  console.log('✅ Mock data seed hoàn thành!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed mock data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
