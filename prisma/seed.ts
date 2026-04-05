import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Uzbekistan locations...')

  // Regions (Viloyatlar)
  const regions = [
    { name: 'Toshkent shahri', type: 'region' },
    { name: 'Toshkent viloyati', type: 'region' },
    { name: 'Andijon viloyati', type: 'region' },
    { name: 'Buxoro viloyati', type: 'region' },
    { name: 'Fargʻona viloyati', type: 'region' },
    { name: 'Jizzax viloyati', type: 'region' },
    { name: 'Xorazm viloyati', type: 'region' },
    { name: 'Namangan viloyati', type: 'region' },
    { name: 'Navoiy viloyati', type: 'region' },
    { name: 'Qashqadaryo viloyati', type: 'region' },
    { name: 'Samarqand viloyati', type: 'region' },
    { name: 'Sirdaryo viloyati', type: 'region' },
    { name: 'Surxondaryo viloyati', type: 'region' },
    { name: 'Qoraqalpogʻiston Respublikasi', type: 'region' },
  ]

  for (const regionData of regions) {
    const region = await prisma.location.upsert({
      where: { id: regionData.name }, // Simple name mapping for seed or cuid
      update: {},
      create: {
        name: regionData.name,
        type: regionData.type,
      },
    })

    // Districts (Tumanlar) - Sample for Toshkent shahri
    if (region.name === 'Toshkent shahri') {
      const districts = [
        'Yunusobod tumani', 'Mirzo Ulugʻbek tumani', 'Chilonzor tumani', 
        'Shayxontohur tumani', 'Olmazor tumani', 'Yashnobod tumani',
        'Mirobod tumani', 'Yakkasaroy tumani', 'Uchtepa tumani',
        'Sergeli tumani', 'Bektemir tumani', 'Yangihayot tumani'
      ]
      for (const districtName of districts) {
        await prisma.location.create({
          data: {
            name: districtName,
            type: 'district',
            parentId: region.id
          }
        })
      }
    }
  }

  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
