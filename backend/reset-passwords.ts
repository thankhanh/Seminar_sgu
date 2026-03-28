import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

async function main() {
    const prisma = new PrismaClient();
    const newPassword = 'StrongPass123!';
    const passwordHash = await bcrypt.hash(newPassword, 12);

    const emails = ['admin@vinhkhanh.vn', 'tiny@example.com', 'vana@gmail.com'];
    
    for (const email of emails) {
        await prisma.user.update({
            where: { email },
            data: { passwordHash }
        });
        console.log(`Password reset for: ${email}`);
    }

    console.log(`\nAll reset to: ${newPassword}`);
    await prisma.$disconnect();
}

main();
