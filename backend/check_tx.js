const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTx() {
  const tx = await prisma.transaction.findFirst({ 
    orderBy: { createdAt: 'desc' },
    include: { paymentVnpay: true } 
  }).catch(() => null);

  if (!tx) {
    const backupTx = await prisma.transaction.findFirst({ orderBy: { createdAt: 'desc' } });
    console.dir(backupTx, { depth: null });
  } else {
    console.dir(tx, { depth: null });
  }
}

checkTx().finally(() => prisma.$disconnect());
