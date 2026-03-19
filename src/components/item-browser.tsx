"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ItemCard } from "@/components/item-card";
import { MenuItem } from "@/types";

interface ItemBrowserProps {
  items: MenuItem[];
  selectedCategory: number | null;
}

export function ItemBrowser({ items, selectedCategory }: ItemBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === null || item.categoryId === selectedCategory;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Search bar */}
      <div className="relative mb-6 flex-none">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <Input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-xl border-zinc-200 bg-white text-base"
        />
      </div>

      {/* Item grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="flex items-center justify-center h-64 text-zinc-400">
            <p>No items found</p>
          </div>
        )}
      </div>
    </div>
  );
}
