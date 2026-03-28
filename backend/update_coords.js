const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateStoreCoords() {
  try {
    const stores = await prisma.store.findMany();
    const baseLat = 10.2825;
    const baseLng = 105.5180;

    for (let i = 0; i < stores.length; i++) {
      await prisma.store.update({
        where: { id: stores[i].id },
        data: {
          lat: baseLat + i * 0.0005,
          lng: baseLng + i * 0.0008,
          address: 'Phố đi bộ Vĩnh Khánh, Thoại Sơn, An Giang',
        },
      });
      console.log(`Updated store: ${stores[i].name}`);
    }
    console.log('All stores updated successfully.');
  } catch (error) {
    console.error('Error updating stores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStoreCoords();
