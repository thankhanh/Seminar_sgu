import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu thêm CÁC POI MỚI gần Đại học Sài Gòn...');

  // Lấy merchant thứ hai làm chủ (để phong phú hơn)
  const merchants = await prisma.merchant.findMany();
  if (merchants.length === 0) {
    throw new Error('Không tìm thấy merchant nào trong database.');
  }
  const merchant = merchants.length > 1 ? merchants[1] : merchants[0];

  // Tọa độ ĐH Sài Gòn: 10.7599, 106.6822
  const centerLat = 10.7599;
  const centerLng = 106.6822;

  const poiData = [
    {
      name: 'Bánh Mực Kute SGU',
      address: 'Vỉa hè 273 An Dương Vương, Phường 3, Quận 5, TP.HCM',
      latOffset: 0.0003,
      lngOffset: 0.0002,
      menu: [
        { name: 'Bánh mực khổng lồ', price: 35000 },
        { name: 'Xúc xích phô mai', price: 15000 },
      ],
      narration: 'Món bánh mực Kute nổi tiếng ngay vỉa hè SGU, cắn một miếng là cảm nhận ngay lớp vỏ giòn rụm và nhân mực sần sật tuyệt vời.',
    },
    {
      name: 'Phúc Long Coffee & Tea',
      address: '264 An Dương Vương, Phường 4, Quận 5, TP.HCM',
      latOffset: -0.0004,
      lngOffset: -0.0002,
      menu: [
        { name: 'Trà Đào Cam Sả', price: 55000 },
        { name: 'Trà Sữa Phúc Long', price: 45000 },
      ],
      narration: 'Phúc Long An Dương Vương mang đậm hương vị trà truyền thống kết hợp không gian hiện đại, điểm hẹn quen thuộc của giới trẻ.',
    },
    {
      name: 'Bò Lá Lốt Cô Út',
      address: 'Hẻm 270 An Dương Vương, Phường 4, Quận 5, TP.HCM',
      latOffset: -0.0001,
      lngOffset: -0.0004,
      menu: [
        { name: 'Phần bò lá lốt đặc biệt', price: 40000 },
        { name: 'Bánh mì nướng bơ tỏi', price: 10000 },
      ],
      narration: 'Bò lá lốt Cô Út với mùi thơm nức mũi bay dọc con hẻm, cuộn cùng bánh tráng, rau rừng và mắm nêm đậm vị.',
    },
    {
      name: 'Trái Cây Tô Sinh Viên',
      address: '282 An Dương Vương, Phường 4, Quận 5, TP.HCM',
      latOffset: 0.0006,
      lngOffset: -0.0001,
      menu: [
        { name: 'Trái cây tô khổng lồ', price: 30000 },
        { name: 'Sinh tố bơ', price: 25000 },
      ],
      narration: 'Trái cây tô mát lạnh, tươi ngon, đầy ắp các loại hoa quả nhiệt đới, là món giải nhiệt số một của sinh viên SGU những ngày hè.',
    }
  ];

  const viLang = await prisma.language.findUnique({ where: { code: 'vi' } });

  for (const item of poiData) {
    const lat = centerLat + item.latOffset;
    const lng = centerLng + item.lngOffset;

    const store = await prisma.store.create({
      data: {
        merchantId: merchant.id,
        name: item.name,
        address: item.address,
        lat,
        lng,
        openTime: '15:00',
        closeTime: '23:00',
        status: 'active',
      },
    });

    console.log(`✅ Đã tạo quán: ${store.name}`);

    // Create QR Code
    await prisma.qrCode.create({
      data: {
        storeId: store.id,
        code: `SGU_${store.id.substring(0, 6).toUpperCase()}_NEW`,
      }
    });

    // Create Menus
    for (const m of item.menu) {
      await prisma.menu.create({
        data: {
          storeId: store.id,
          name: m.name,
          description: `Đặc sản: ${m.name}`,
          price: m.price,
          isAvailable: true,
        },
      });
    }

    // Create Narration
    if (viLang) {
      await prisma.narration.create({
        data: {
          storeId: store.id,
          languageId: viLang.id,
          textContent: item.narration,
        }
      });
    }
  }

  console.log('🎉 Hoàn tất thêm 4 POI mới gần ĐH Sài Gòn!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
