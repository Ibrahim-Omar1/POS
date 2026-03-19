"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { UtensilsCrossed, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MenuItem, Category } from "@/types";
import { useSettings } from "@/hooks/use-settings";
import { formatPrice } from "@/lib/format";

interface CategoryWithItems extends Category {
  items: MenuItem[];
}

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [category, setCategory] = useState<CategoryWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { settings } = useSettings();
  const currency = settings?.currency || "EGP";

  useEffect(() => {
    fetchCategory();
  }, [id]);

  async function fetchCategory() {
    try {
      const res = await fetch(`/api/categories/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCategory(data);
      } else {
        setError("Category not found");
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      setError("Failed to load category");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAvailable(item: MenuItem) {
    try {
      await fetch(`/api/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          price: item.price,
          categoryId: item.categoryId,
          image: item.image,
          stock: item.stock,
          isAvailable: !item.isAvailable,
        }),
      });
      fetchCategory();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  }

  async function handleDelete(itemId: number) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/menu/${itemId}`, { method: "DELETE" });
      if (response.ok) {
        fetchCategory();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-zinc-400">{error || "Category not found"}</div>
        <Link href="/categories">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with sidebar trigger and breadcrumbs */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/categories">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">
                {category.name}
              </h1>
              <p className="text-sm text-zinc-500">
                {category.items.length} item
                {category.items.length !== 1 ? "s" : ""} in this category
              </p>
            </div>
          </div>
          <Link href="/menu">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
              Manage Items
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="w-20">Stock</TableHead>
                <TableHead className="w-24">Available</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {category.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-zinc-400"
                  >
                    No items in this category.{" "}
                    <Link
                      href="/menu"
                      className="text-emerald-500 hover:underline"
                    >
                      Add items from Menu Management
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                category.items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-zinc-50">
                    <TableCell>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-50 flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UtensilsCrossed className="w-4 h-4 text-emerald-300" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-emerald-500 font-semibold">
                      {formatPrice(item.price, currency)}
                    </TableCell>
                    <TableCell className="text-zinc-500">
                      {item.stock !== null ? item.stock : "∞"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() => handleToggleAvailable(item)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/menu?edit=${item.id}`}>
                          <button className="text-zinc-400 hover:text-emerald-500 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
