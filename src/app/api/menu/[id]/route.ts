import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, price, categoryId, image, isAvailable, stock } = body;

    const item = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        image: image || null,
        isAvailable,
        stock: stock !== undefined && stock !== "" ? parseInt(stock) : null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.menuItem.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
