import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const freePlan = await prisma.planMetadata.upsert({
    where: { planKey: 'customer_free' },
    update: {},
    create: {
      planKey: 'customer_free',
      name: 'Gói Miễn phí',
      price: 0,
      description: 'Gói mặc định cho người dùng khám phá tính năng cơ bản.',
      features: ['Nghe nội dung cơ bản', 'Lưu lịch sử nghe'],
      maxPOI: 0, // Not applicable for regular users
      maxStore: 0, // Not applicable for regular users
      color: 'bg-slate-100',
      icon: 'Zap',
    },
  });

  console.log('Created/Updated Customer Free Plan:', freePlan);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
