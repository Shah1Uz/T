const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const locations = [
    {
      name: "Andijon viloyati",
      type: "region",
      children: [
        "Andijon", "Asaka", "Baliqchi", "Bo‘z", "Buloqboshi", "Izboskan", "Jalaquduq", "Marhamat", "Oltinko‘l", "Paxtaobod", "Qo‘rg‘ontepa", "Shahrixon", "Ulug‘nor", "Xo‘jaobod"
      ]
    },
    {
      name: "Buxoro viloyati",
      type: "region",
      children: [
        "Buxoro", "Vobkent", "G‘ijduvon", "Jondor", "Kogon", "Olot", "Peshku", "Qorako‘l", "Qorovulbozor", "Romitan", "Shofirkon"
      ]
    },
    {
      name: "Fargʻona viloyati",
      type: "region",
      children: [
        "Beshariq", "Bag‘dod", "Buvayda", "Dang‘ara", "Farg‘ona", "Furqat", "Oltiariq", "Qo‘shtepa", "Rishton", "So‘x", "Toshloq", "Uchko‘prik", "Yozyovon", "Quva", "Quvasoy"
      ]
    },
    {
      name: "Namangan viloyati",
      type: "region",
      children: [
        "Chortoq", "Chust", "Kosonsoy", "Mingbuloq", "Namangan", "Norin", "Pop", "To‘raqo‘rg‘on", "Uychi", "Yangiqo‘rg‘on", "Davlatobod"
      ]
    },
    {
      name: "Samarqand viloyati",
      type: "region",
      children: [
        "Bulung‘ur", "Jomboy", "Ishtixon", "Kattaqo‘rg‘on", "Narpay", "Nurobod", "Oqdaryo", "Payariq", "Pastdarg‘om", "Paxtachi", "Samarqand", "Toyloq", "Urgut", "Qo‘shrabot"
      ]
    },
    {
      name: "Qashqadaryo viloyati",
      type: "region",
      children: [
        "Dehqonobod", "Kasbi", "Kitob", "Koson", "Mirishkor", "Muborak", "Nishon", "Chiroqchi", "Shahrisabz", "Yakkabog‘", "Qarshi", "G‘uzor", "Qamashi"
      ]
    },
    {
      name: "Surxondaryo viloyati",
      type: "region",
      children: [
        "Angor", "Bandixon", "Boysun", "Denov", "Jarqo‘rg‘on", "Muzrabot", "Oltinsoy", "Qiziriq", "Qumqo‘rg‘on", "Sherobod", "Sho‘rchi", "Termiz", "Uzun", "Sariosiyo"
      ]
    },
    {
      name: "Jizzax viloyati",
      type: "region",
      children: [
        "Arnasoy", "Baxmal", "Do‘stlik", "Forish", "G‘allaorol", "Sharof Rashidov", "Mirzacho‘l", "Paxtakor", "Yangiobod", "Zafarobod", "Zarbdor"
      ]
    },
    {
      name: "Navoiy viloyati",
      type: "region",
      children: [
        "Konimex", "Karmana", "Qiziltepa", "Navbahor", "Nurota", "Tomdi", "Uchquduq", "Zarafshon (atrof hudud)"
      ]
    },
    {
      name: "Xorazm viloyati",
      type: "region",
      children: [
        "Bog‘ot", "Gurlan", "Hazorasp", "Xiva", "Qo‘shko‘pir", "Shovot", "Urganch", "Yangiariq", "Yangibozor", "Tuproqqal’a", "Xonqa"
      ]
    },
    {
      name: "Sirdaryo viloyati",
      type: "region",
      children: [
        "Boyovut", "Guliston", "Mirzaobod", "Oqoltin", "Sardoba", "Sayxunobod", "Sirdaryo", "Xovos", "Yangiyer"
      ]
    },
    {
      name: "Toshkent viloyati",
      type: "region",
      children: [
        "Bekobod", "Bo‘ka", "Bo‘stonliq", "Chinoz", "Ohangaron", "Oqqo‘rg‘on", "Parkent", "Piskent", "Quyi Chirchiq", "O‘rta Chirchiq", "Yuqori Chirchiq", "Zangiota", "Qibray", "Toshkent tumani", "Yangiyo‘l"
      ]
    },
    {
      name: "Toshkent shahri",
      type: "region",
      children: [
        "Bektemir", "Chilonzor", "Yashnobod", "Mirobod", "Mirzo Ulug‘bek", "Sergeli", "Shayxontohur", "Olmazor", "Uchtepa", "Yakkasaroy", "Yunusobod", "Yangihayot"
      ]
    },
    {
      name: "Qoraqalpog‘iston Res.",
      type: "region",
      children: [
        "Amudaryo", "Beruniy", "Chimboy", "Ellikqal’a", "Kegeyli", "Mo‘ynoq", "Nukus", "Qanliko‘l", "Qo‘ng‘irot", "Qorao‘zak", "Shumanay", "Taxtako‘pir", "To‘rtko‘l", "Xo‘jayli"
      ]
    }
  ]

  console.log("Men avvalgi barcha hududlarni o'chiraman...")
  
  // Note: Since Location might be tied to Listings, we cannot blindly delete them if listings exist.
  // We should either update existing or just skip if they already exist.
  // Safe approach: create if not exists by name to avoid foreign key constraints errors,
  // but since we want clean exact names, let's try to upsert or check first.
  
  for (const reg of locations) {
    let region = await prisma.location.findFirst({
      where: { name: reg.name, type: "region" }
    })
    
    if (!region) {
      region = await prisma.location.create({
        data: {
           name: reg.name,
           type: "region"
        }
      })
      console.log(`Region created: ${reg.name}`)
    } else {
      console.log(`Region exists: ${reg.name}, skipping creation.`)
    }

    for (const dist of reg.children) {
      const existingDist = await prisma.location.findFirst({
        where: { name: dist, type: "district", parentId: region.id }
      })

      if (!existingDist) {
        await prisma.location.create({
          data: {
            name: dist,
            type: "district",
            parentId: region.id
          }
        })
      }
    }
  }

  console.log("Seeding finished - Uzbekistan Regions and Districts populated!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
