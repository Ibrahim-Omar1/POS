import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");

const adapter = new PrismaLibSql({
  url: `file:${dbPath}`,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const foods = await prisma.category.create({ data: { name: "Foods" } });
  const beverages = await prisma.category.create({ data: { name: "Beverages" } });

  // Create menu items with EGP prices
  await prisma.menuItem.createMany({
    data: [
      // Foods
      { name: "Beef Steak", price: 20000, categoryId: foods.id },
      { name: "Fried Chicken", price: 19000, categoryId: foods.id },
      { name: "Japanese Onigiri", price: 30000, categoryId: foods.id },
      { name: "Kabob Kubideh", price: 31000, categoryId: foods.id },
      { name: "Mexican Tacos", price: 26000, categoryId: foods.id },
      { name: "Fried Beef", price: 25000, categoryId: foods.id },
      { name: "Happy Burger", price: 16000, categoryId: foods.id },
      { name: "Grilled Salmon", price: 35000, categoryId: foods.id },
      // Beverages
      { name: "Fresh Orange Juice", price: 8000, categoryId: beverages.id },
      { name: "Iced Coffee", price: 12000, categoryId: beverages.id },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
