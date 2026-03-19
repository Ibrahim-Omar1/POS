"use client";

import Link from "next/link";
import { Utensils, Settings2 } from "lucide-react";
import { Category } from "@/types";

interface NavbarProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export function Navbar({
  categories,
  selectedCategory,
  onCategoryChange,
}: NavbarProps) {
  return (
    <nav className="h-16 bg-white border-b border-zinc-100/50 flex-none">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Logo and Category Tabs */}
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-500" />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-emerald-500">My</span>
              <span className="text-zinc-800">Food</span>
            </span>
          </Link>

          {/* Category Tabs */}
          <div className="flex items-center gap-10">
            <button
              onClick={() => onCategoryChange(null)}
              className={`relative h-16 flex items-center text-sm transition-colors ${
                selectedCategory === null
                  ? "text-zinc-900 font-semibold"
                  : "text-zinc-400 hover:text-zinc-600 font-medium"
              }`}
            >
              All Cuisines
              {selectedCategory === null && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500 rounded-full" />
              )}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`relative h-16 flex items-center text-sm transition-colors ${
                  selectedCategory === category.id
                    ? "text-zinc-900 font-semibold"
                    : "text-zinc-400 hover:text-zinc-600 font-medium"
                }`}
              >
                {category.name}
                {selectedCategory === category.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right side - Manage Menu Link */}
        <Link
          href="/menu"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-500 transition-colors font-medium"
        >
          <Settings2 className="w-4 h-4" />
          <span>Manage Menu</span>
        </Link>
      </div>
    </nav>
  );
}
