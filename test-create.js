const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreate() {
  try {
    console.log('Finding user...');
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found in database.');
      return;
    }
    console.log('Testing transaction creation for user:', user.id);
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: 1000,
        plan: 'EKONOM',
        provider: 'CLICK',
        status: 'PENDING',
      },
    });
    console.log('Success! Created transaction:', transaction);
  } catch (error) {
    console.error('Failure! Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreate();
