"use client";

import { useMemo } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Search } from "lucide-react";
import { ItemCard } from "@/components/item-card";
import { MenuItem, Category } from "@/types";

interface ItemBrowserProps {
  items: MenuItem[];
  categories: Category[];
}

export function ItemBrowser({ items, categories }: ItemBrowserProps) {
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault("")
  );
  const [selectedCategory, setSelectedCategory] = useQueryState(
    "category",
    parseAsInteger
  );

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
    <div className="h-full flex flex-col p-4 bg-white overflow-visible">
      {/* Search bar */}
      <div className="relative mb-3 flex-none">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value || null)}
          className="w-full pl-10 pr-4 h-10 rounded-lg border border-zinc-200 outline-none bg-zinc-50 text-sm placeholder:text-zinc-400 focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-3 flex-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedCategory === null
              ? "bg-emerald-500 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === category.id
                ? "bg-emerald-500 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Item grid - scrollable area */}
      <div className="flex-1 overflow-y-auto overflow-x-visible">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2.5 p-2">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="flex items-center justify-center h-32 text-zinc-400">
            <p className="text-sm">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
}
