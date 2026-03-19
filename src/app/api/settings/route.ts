import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch settings (creates default if none exist)
export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          storeName: "My POS Store",
          storePhone: "",
          storeAddress: "",
          currency: "EGP",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { storeName, storePhone, storeAddress, currency } = body;

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        storeName,
        storePhone,
        storeAddress,
        currency,
      },
      create: {
        id: 1,
        storeName: storeName || "My POS Store",
        storePhone: storePhone || "",
        storeAddress: storeAddress || "",
        currency: currency || "EGP",
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
