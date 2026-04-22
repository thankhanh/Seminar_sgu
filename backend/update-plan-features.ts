import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePlanFeatures() {
  console.log('🔄 Đang cập nhật features cho các gói...');

  try {
    // Cập nhật customer_free
    await prisma.planMetadata.update({
      where: { planKey: 'customer_free' },
      data: {
        features: ['Nghe 10 bài/ngày', 'Tính năng cơ bản']
      }
    });
    console.log('✅ Đã cập nhật customer_free');

    // Cập nhật customer_monthly
    await prisma.planMetadata.update({
      where: { planKey: 'customer_monthly' },
      data: {
        features: ['Nghe thuyết minh 30 bài/ngày', 'Lưu lịch sử nghe', 'Giao diện không quảng cáo']
      }
    });
    console.log('✅ Đã cập nhật customer_monthly');

    // Cập nhật customer_yearly
    await prisma.planMetadata.update({
      where: { planKey: 'customer_yearly' },
      data: {
        features: ['Nghe không giới hạn', 'Lưu lịch sử nghe', 'Ưu đãi dịch vụ']
      }
    });
    console.log('✅ Đã cập nhật customer_yearly');

    console.log('🎉 Hoàn thành cập nhật features!');
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePlanFeatures();