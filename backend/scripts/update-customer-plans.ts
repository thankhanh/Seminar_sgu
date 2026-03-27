import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update Customer Free
  await prisma.planMetadata.upsert({
    where: { planKey: 'customer_free' },
    update: {
      name: 'Gói Miễn phí',
      price: 0,
    },
    create: {
      planKey: 'customer_free',
      name: 'Gói Miễn phí',
      price: 0,
      description: 'Gói mặc định cho người dùng khám phá tính năng cơ bản.',
      features: ['Nghe nội dung cơ bản', 'Lưu lịch sử nghe'],
      maxPOI: 0,
      maxStore: 0,
      color: 'bg-slate-100',
      icon: 'Zap',
    },
  });

  // Update Customer Monthly
  await prisma.planMetadata.upsert({
    where: { planKey: 'customer_monthly' },
    update: {
      name: 'Gói Tháng',
      price: 49000,
    },
    create: {
      planKey: 'customer_monthly',
      name: 'Gói Tháng',
      price: 49000,
      description: 'Nghe toàn bộ nội dung không giới hạn trong 1 tháng.',
      features: ['Mở khóa tất cả bài thuyết minh', 'Chất lượng âm thanh cao cấp', 'Không quảng cáo'],
      maxPOI: 0,
      maxStore: 0,
      color: 'bg-indigo-100',
      icon: 'Shield',
    },
  });

  // Update Customer Yearly
  await prisma.planMetadata.upsert({
    where: { planKey: 'customer_yearly' },
    update: {
      name: 'Gói Năm',
      price: 499000,
    },
    create: {
      planKey: 'customer_yearly',
      name: 'Gói Năm',
      price: 499000,
      description: 'Tiết kiệm hơn với gói năm, đầy đủ quyền lợi ưu việt.',
      features: ['Toàn bộ tính năng gói Tháng', 'Tiết kiệm 15%', 'Ưu tiên hỗ trợ 24/7'],
      maxPOI: 0,
      maxStore: 0,
      color: 'bg-amber-100',
      icon: 'Crown',
    },
  });

  console.log('Customer plans updated successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
