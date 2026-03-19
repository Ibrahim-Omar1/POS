"use client";

import { useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ItemBrowser } from "@/components/item-browser";
import { OrderSummary } from "@/components/order-summary";
import { MenuItem, Category } from "@/types";

export default function Page() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchData() {
    try {
      const [menuRes, categoriesRes] = await Promise.all([
        fetch("/api/menu"),
        fetch("/api/categories"),
      ]);

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setItems(menuData);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header with breadcrumbs */}
      <header className="flex h-14 shrink-0 items-center gap-2 px-4 border-b border-zinc-100 bg-white">
        <SidebarTrigger className="-ml-1" />
        <div className="mr-2 h-4 w-px bg-border" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Point of Sale</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Cashier</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main content - Two panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Item browser (65%) */}
        <div className="flex-[65] overflow-y-auto overflow-x-visible">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-zinc-400">Loading menu...</div>
            </div>
          ) : (
            <ItemBrowser items={items} categories={categories} />
          )}
        </div>

        {/* Right panel - Order summary (35%) */}
        <div className="flex-[35] overflow-hidden">
          <OrderSummary onOrderPlaced={fetchData} />
        </div>
      </div>
    </div>
  );
}
