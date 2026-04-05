const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    console.log('Recent Transactions:', JSON.stringify(transactions, null, 2));

    const totalCompleted = await prisma.transaction.count({
      where: { status: 'COMPLETED' }
    });
    console.log('Total Completed Transactions:', totalCompleted);

    const clickTransactions = await prisma.transaction.count({
      where: { provider: 'CLICK' }
    });
    console.log('Total Click Transactions:', clickTransactions);

  } catch (error) {
    console.error('Error checking transactions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTransactions();
