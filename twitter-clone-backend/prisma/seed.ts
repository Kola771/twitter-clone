import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password1', 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      username: 'alice',
      name: 'Alice Martin',
      email: 'alice@example.com',
      password: hash,
      bio: 'Développeuse passionnée ☕',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      username: 'bob',
      name: 'Bob Dupont',
      email: 'bob@example.com',
      password: hash,
      bio: 'Fan de TypeScript 🚀',
    },
  });

  await prisma.tweet.createMany({
    data: [
      { content: 'Bonjour Twitter Clone ! 👋', authorId: alice.id },
      { content: 'NestJS + Next.js = combo parfait 🔥', authorId: bob.id },
      { content: 'Prisma ORM est incroyable pour PostgreSQL', authorId: alice.id },
    ],
    skipDuplicates: true,
  });

  console.log('Seed terminé ✅');
  console.log('alice@example.com / Password1');
  console.log('bob@example.com  / Password1');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
