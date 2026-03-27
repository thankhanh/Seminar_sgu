import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      planKey: 'merchant_starter',
      name: 'Miễn phí (Starter)',
      price: 0,
      description: 'Mặc định cho mọi cửa hàng.',
      features: ['Tối đa 1 địa điểm (POI)', 'Thuyết minh đa ngôn ngữ', 'Quản lý thực đơn cơ bản'],
      maxPOI: 1,
      maxStore: 1,
      color: 'bg-slate-50',
      icon: 'Zap',
    },
    {
      planKey: 'merchant_business',
      name: 'Nâng cấp 1 (Business)',
      price: 499000,
      description: 'Dành cho chuỗi cửa hàng nhỏ.',
      features: ['Tối đa 5 địa điểm (POI)', 'Ưu tiên hiển thị trên bản đồ', 'Phân tích lượt nghe chi tiết'],
      maxPOI: 5,
      maxStore: 2,
      color: 'bg-primary-50',
      icon: 'Shield',
    },
    {
      planKey: 'merchant_premium',
      name: 'Nâng cấp 2 (Premium)',
      price: 999000,
      description: 'Giải pháp toàn diện cho doanh nghiệp.',
      features: ['Tối đa 10 địa điểm (POI)', 'API tích hợp riêng', 'Tư vấn nội dung thuyết minh'],
      maxPOI: 10,
      maxStore: 5,
      color: 'bg-indigo-50',
      icon: 'Crown',
    },
    {
      planKey: 'customer_monthly',
      name: 'Gói Cơ Bản (Tháng)',
      price: 0,
      description: 'Mặc định cho mọi khách hàng.',
      features: ['Truy cập cơ bản', 'Hỗ trợ email', 'Lưu trữ 1GB'],
      maxPOI: 0,
      maxStore: 0,
      color: 'bg-slate-50',
      icon: 'Zap',
    },
    {
      planKey: 'customer_yearly',
      name: 'Gói Năm (Yearly)',
      price: 150000,
      description: 'Gói nâng cao cho khách hàng chuyên nghiệp.',
      features: ['Truy cập đầy đủ', 'Hỗ trợ ưu tiên', 'Lưu trữ 10GB'],
      maxPOI: 0,
      maxStore: 0,
      color: 'bg-primary-50',
      icon: 'Shield',
    },
  ];

  for (const plan of plans) {
    await prisma.planMetadata.upsert({
      where: { planKey: plan.planKey },
      update: plan,
      create: plan,
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
