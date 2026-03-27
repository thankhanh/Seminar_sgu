const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const langCount = await prisma.language.count();
    const storeCount = await prisma.store.count();
    const narrationCount = await prisma.narration.count();
    console.log(`Languages: ${langCount}`);
    console.log(`Stores: ${storeCount}`);
    console.log(`Narrations: ${narrationCount}`);
    
    if (storeCount > 0) {
      const stores = await prisma.store.findMany({ take: 3 });
      console.log('Sample Stores:', stores.map(s => ({ name: s.name, lat: s.lat, lng: s.lng })));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
