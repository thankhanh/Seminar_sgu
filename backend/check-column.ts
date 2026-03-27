import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result: any = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'plan_metadata' AND column_name = 'features';
  `;
  console.log('Column info:', JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
