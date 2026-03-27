import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function main() {
  const storeId = '76311777-67ab-4c87-b304-e81fea255284'; // Chè Ngon
  const languageId = 'd41992cd-78b2-46e0-916f-16807e5f9593'; // Vietnamese

  const narration = await prisma.narration.create({
    data: {
      storeId,
      languageId,
      textContent: 'Chào mừng bạn đến với quán Chè Ngon. Chúng tôi có rất nhiều loại chè truyền thống thơm ngon.',
      isActive: true,
    }
  });
  console.log('Created narration:', JSON.stringify(narration, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
