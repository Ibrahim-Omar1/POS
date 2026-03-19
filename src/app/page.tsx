"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { ItemBrowser } from "@/components/item-browser";
import { OrderSummary } from "@/components/order-summary";
import { CartProvider } from "@/hooks/use-cart";
import { Category, MenuItem } from "@/types";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, menuRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/menu"),
        ]);

        const [categoriesData, menuData] = await Promise.all([
          categoriesRes.json(),
          menuRes.json(),
        ]);

        setCategories(categoriesData);
        setMenuItems(menuData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel - Item browser (65%) */}
          <div className="w-[65%] h-full overflow-hidden bg-zinc-50">
            <ItemBrowser
              items={menuItems}
              selectedCategory={selectedCategory}
            />
          </div>

          {/* Right panel - Order summary (35%) */}
          <div className="w-[35%] h-full overflow-hidden">
            <OrderSummary />
          </div>
        </div>
      </div>
    </CartProvider>
  );
}
