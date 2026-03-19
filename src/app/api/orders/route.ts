import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, total } = body;

    // Use a transaction to ensure stock is properly decremented
    const order = await prisma.$transaction(async (tx) => {
      // First, check and update stock for each item
      for (const item of items as { menuItemId: number; quantity: number; unitPrice: number }[]) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
        });

        if (!menuItem) {
          throw new Error(`Menu item ${item.menuItemId} not found`);
        }

        // If item has stock tracking (not null), check and decrement
        if (menuItem.stock !== null) {
          if (menuItem.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${menuItem.name}`);
          }

          await tx.menuItem.update({
            where: { id: item.menuItemId },
            data: {
              stock: menuItem.stock - item.quantity,
              // Auto-set unavailable if stock reaches 0
              isAvailable: menuItem.stock - item.quantity > 0 ? menuItem.isAvailable : false,
            },
          });
        }
      }

      // Create the order
      return tx.order.create({
        data: {
          total: parseFloat(total),
          items: {
            create: items.map(
              (item: { menuItemId: number; quantity: number; unitPrice: number }) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })
            ),
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
