require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestListing() {
  try {
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { images: true }
    });

    if (listings.length === 0) {
      console.log("No listings found in Render DB.");
      return;
    }

    console.log(`Found ${listings.length} listings in Render DB:`);
    listings.forEach((listing, index) => {
      console.log(`Listing ${index + 1}:`, {
        id: listing.id,
        title: listing.title,
        createdAt: listing.createdAt,
        imageCount: listing.images.length,
        images: listing.images.map(img => img.url)
      });
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestListing();
