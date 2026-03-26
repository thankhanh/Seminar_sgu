import { PrismaClient, UserRole, MerchantStatus, StoreStatus, SubscriptionPlan, MerchantPlan, SubscriptionStatus, TransactionType, PaymentMethod, TransactionStatus, ListenSource, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu nạp dữ liệu mẫu toàn diện (Full Sample Data)...');

  try {
    // 1. Ngôn ngữ
    console.log('  -> Đang nạp Ngôn ngữ...');
    const languagesData = [
      { code: 'vi', name: 'Tiếng Việt', flagIcon: '🇻🇳' },
      { code: 'en', name: 'English', flagIcon: '🇺🇸' },
      { code: 'zh', name: 'Chinese', flagIcon: '🇨🇳' },
      { code: 'ko', name: 'Korean', flagIcon: '🇰🇷' },
      { code: 'ja', name: 'Japanese', flagIcon: '🇯🇵' },
      { code: 'fr', name: 'French', flagIcon: '🇫🇷' },
    ];

    const languages = [];
    for (const lang of languagesData) {
      const l = await prisma.language.upsert({
        where: { code: lang.code },
        update: {},
        create: lang,
      });
      languages.push(l);
    }
    console.log('  ✅ Đã nạp Ngôn ngữ');

    // 2. Tài khoản Admin
    console.log('  -> Đang nạp Admin...');
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    await prisma.user.upsert({
      where: { email: 'admin@vinhkhanh.vn' },
      update: {},
      create: {
        name: 'Super Admin',
        email: 'admin@vinhkhanh.vn',
        passwordHash,
        role: 'admin' as UserRole,
        isActive: true,
      },
    });
    console.log('  ✅ Admin: admin@vinhkhanh.vn / Admin@123');

    // 3. Merchants & Users
    console.log('  -> Đang nạp Merchants & Subscriptions...');
    for (let i = 1; i <= 2; i++) {
        const email = `merchant${i}@example.com`;
        const u = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                name: `Chủ quán ${i}`,
                email,
                passwordHash,
                role: 'merchant' as UserRole,
                isActive: true,
            },
        });

        const m = await prisma.merchant.upsert({
            where: { userId: u.id },
            update: {},
            create: {
                userId: u.id,
                businessName: i === 1 ? 'Vinh Khanh Coffee' : 'Thanh Khanh Food',
                status: 'approved' as MerchantStatus,
                taxCode: `TX-${1000 + i}`,
            },
        });

        await prisma.merchantSubscription.upsert({
            where: { id: `m-sub-${i}` },
            update: {},
            create: {
                id: `m-sub-${i}`,
                merchantId: m.id,
                plan: 'business' as MerchantPlan,
                maxStore: 5,
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                status: 'active' as SubscriptionStatus,
            }
        });
    }
    console.log('  ✅ Đã nạp Merchants & Subscriptions');

    // 4. Stores, Images, Menus, QR
    console.log('  -> Đang nạp Stores, Menus, QR, Narrations...');
    const allMerchants = await prisma.merchant.findMany();
    const stores = [];
    
    for (const m of allMerchants) {
        const storesData = [
            { name: `${m.businessName} Flagship`, lat: 10.4967 + (Math.random() - 0.5) * 0.01, lng: 105.1167 + (Math.random() - 0.5) * 0.01 },
            { name: `${m.businessName} Express`, lat: 10.4967 + (Math.random() - 0.5) * 0.01, lng: 105.1167 + (Math.random() - 0.5) * 0.01 },
        ];

        for (const sData of storesData) {
            const store = await prisma.store.create({
                data: {
                    merchantId: m.id,
                    name: sData.name,
                    address: 'Vĩnh Khánh, Thoại Sơn, An Giang',
                    description: `Một địa điểm tuyệt vời thuộc hệ thống ${m.businessName}`,
                    lat: sData.lat,
                    lng: sData.lng,
                    status: 'active' as StoreStatus,
                    openTime: '07:00',
                    closeTime: '21:00',
                    coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
                },
            });
            stores.push(store);

            await prisma.storeImage.create({
                data: { storeId: store.id, imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8', sortOrder: 1 }
            });

            await prisma.menu.create({
                data: {
                    storeId: store.id,
                    name: 'Đặc sản địa phương',
                    price: new Prisma.Decimal(45000),
                    description: 'Món ăn truyền thống đậm đà bản sắc.',
                }
            });

            await prisma.qrCode.create({
                data: {
                    storeId: store.id,
                    code: `QR-${store.id.slice(0, 8)}`,
                    qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TOUR-${store.id}`,
                },
            });

            // Narrations in multiple languages
            for (let i = 0; i < 2; i++) {
                await prisma.narration.create({
                    data: {
                        storeId: store.id,
                        languageId: languages[i].id,
                        textContent: `Chào mừng bạn đến với ${store.name}. Đây là điểm dừng chân lý tưởng dành cho du khách.`,
                        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                        duration: 180,
                    },
                });
            }
        }
    }
    console.log(`  ✅ Đã nạp ${stores.length} Stores & dữ liệu liên quan`);

    // 5. Users, Transactions & Listen History
    console.log('  -> Đang nạp Users, Transactions, Listen History...');
    const userData = [
        { name: 'Nguyễn Văn A', email: 'vana@gmail.com' },
        { name: 'Trần Thị B', email: 'thib@gmail.com' },
        { name: 'Lê Văn C', email: 'vanc@gmail.com' },
    ];

    for (const uData of userData) {
        const u = await prisma.user.upsert({
            where: { email: uData.email },
            update: {},
            create: {
                name: uData.name,
                email: uData.email,
                passwordHash,
                role: 'user' as UserRole,
            },
        });

        // Add Subscription for user
        await prisma.subscription.create({
            data: {
                userId: u.id,
                plan: 'monthly' as SubscriptionPlan,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'active' as SubscriptionStatus,
            },
        });

        // Add Transactions
        const tx = await prisma.transaction.create({
            data: {
                userId: u.id,
                amount: new Prisma.Decimal(50000),
                type: 'user_subscription' as TransactionType,
                paymentMethod: 'vnpay' as PaymentMethod,
                status: 'success' as TransactionStatus,
                description: 'Đăng ký gói tháng người dùng (VNPAY)',
            }
        });

        await prisma.paymentVnpay.create({
            data: {
                transactionId: tx.id,
                vnpTxnRef: `VNP-${tx.id.slice(0, 8)}`,
                vnpAmount: BigInt(5000000), 
                vnpResponseCode: '00',
                vnpTransactionNo: `TRANS-${Math.floor(Math.random() * 1000000)}`,
            }
        });

        // Add dummy MoMo Transaction
        const txMomo = await prisma.transaction.create({
            data: {
                userId: u.id,
                amount: new Prisma.Decimal(100000),
                type: 'user_subscription' as TransactionType,
                paymentMethod: 'momo' as PaymentMethod,
                status: 'success' as TransactionStatus,
                description: 'Đăng ký gói đặc biệt (MoMo)',
            }
        });

        await prisma.paymentMomo.create({
            data: {
                transactionId: txMomo.id,
                orderId: `MOMO-${txMomo.id.slice(0, 8)}`,
                amount: BigInt(100000),
                resultCode: 0,
                message: 'Success',
            }
        });


        // Add Listen History
        for (let i = 0; i < 3; i++) {
            const randomStore = stores[Math.floor(Math.random() * stores.length)];
            const narrations = await prisma.narration.findMany({ where: { storeId: randomStore.id } });
            if (narrations.length > 0) {
                await prisma.listenHistory.create({
                    data: {
                        userId: u.id,
                        storeId: randomStore.id,
                        narrationId: narrations[0].id,
                        source: 'gps' as ListenSource,
                    }
                });
            }
        }
    }
    console.log('  ✅ Đã nạp Users, Transactions & Listen History');

    console.log('\n🚀 HOÀN TẤT NẠP DỮ LIỆU MẪU TOÀN DIỆN!');

  } catch (error) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH SEED:');
    console.error(error);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
