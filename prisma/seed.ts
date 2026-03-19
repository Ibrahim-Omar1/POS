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
  const coffee = await prisma.category.create({ data: { name: "Coffee" } });
  const pastry = await prisma.category.create({ data: { name: "Pastry" } });
  const food = await prisma.category.create({ data: { name: "Food" } });

  // Create menu items
  await prisma.menuItem.createMany({
    data: [
      // Coffee
      { name: "Espresso", price: 2.5, categoryId: coffee.id },
      { name: "Americano", price: 3.0, categoryId: coffee.id },
      { name: "Cappuccino", price: 4.0, categoryId: coffee.id },
      { name: "Latte", price: 4.5, categoryId: coffee.id },
      // Pastry
      { name: "Croissant", price: 3.5, categoryId: pastry.id },
      { name: "Chocolate Muffin", price: 3.0, categoryId: pastry.id },
      { name: "Cinnamon Roll", price: 4.0, categoryId: pastry.id },
      // Food
      { name: "Avocado Toast", price: 8.5, categoryId: food.id },
      { name: "Grilled Cheese", price: 7.0, categoryId: food.id },
      { name: "Caesar Salad", price: 9.0, categoryId: food.id },
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
