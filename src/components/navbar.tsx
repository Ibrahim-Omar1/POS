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
    <nav className="h-16 bg-white border-b border-zinc-100 shadow-sm flex-none">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Logo and Category Tabs */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-500" />
            <span className="text-xl font-bold">
              <span className="text-emerald-500">My</span>
              <span className="text-zinc-800">POS</span>
            </span>
          </Link>

          {/* Category Tabs */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onCategoryChange(null)}
              className={`relative py-5 text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              All
              {selectedCategory === null && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`relative py-5 text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {category.name}
                {selectedCategory === category.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right side - Manage Menu Link */}
        <Link
          href="/menu"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-500 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          <span>Manage Menu</span>
        </Link>
      </div>
    </nav>
  );
}
