"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Plus,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  UtensilsCrossed,
  MoreHorizontal,
} from "lucide-react"
import { ColumnDef, Row } from "@tanstack/react-table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTable } from "@/components/ui/data-table"
import { MenuItem, Category } from "@/types"
import { useSettings } from "@/hooks/use-settings"
import { formatPrice } from "@/lib/format"

interface CategoryWithItems extends Category {
  items: MenuItem[]
  _count?: {
    items: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [error, setError] = useState("")
  const { settings } = useSettings()
  const currency = settings?.currency || "EGP"

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  function openAddDialog() {
    setEditingCategory(null)
    setCategoryName("")
    setError("")
    setDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    setCategoryName(category.name)
    setError("")
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!categoryName.trim()) {
      setError("Category name is required")
      return
    }

    const url = editingCategory
      ? `/api/categories/${editingCategory.id}`
      : "/api/categories"
    const method = editingCategory ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim() }),
      })

      if (response.ok) {
        setDialogOpen(false)
        fetchCategories()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to save category")
      }
    } catch (error) {
      console.error("Error saving category:", error)
      setError("Failed to save category")
    }
  }

  async function handleDeleteCategory(category: Category) {
    if (
      !confirm(
        `Are you sure you want to delete "${category.name}"? This cannot be undone.`
      )
    )
      return

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCategories()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete category")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Failed to delete category")
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
      })
      fetchCategories()
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  async function handleDeleteItem(itemId: number) {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const response = await fetch(`/api/menu/${itemId}`, { method: "DELETE" })
      if (response.ok) {
        fetchCategories()
      }
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const columns: ColumnDef<CategoryWithItems>[] = [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              row.toggleExpanded()
            }}
            className="p-1 hover:bg-zinc-100 rounded transition-colors"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )
      },
      enableHiding: false,
    },
    {
      id: "icon",
      header: () => null,
      cell: () => (
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
          <FolderOpen className="h-4 w-4 text-emerald-500" />
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => (
        <div className="font-medium text-zinc-800">{row.getValue("name")}</div>
      ),
    },
    {
      id: "itemCount",
      header: "Items",
      cell: ({ row }) => (
        <div className="text-zinc-500">
          {row.original._count?.items ?? row.original.items?.length ?? 0} items
        </div>
      ),
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => {
        const category = row.original

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openEditDialog(category)}>
                  Edit category
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteCategory(category)}
                  variant="destructive"
                >
                  Delete category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      enableHiding: false,
    },
  ]

  const renderSubComponent = ({ row }: { row: Row<CategoryWithItems> }) => {
    const items = row.original.items || []

    if (items.length === 0) {
      return (
        <div className="px-12 py-4 text-zinc-400 text-sm">
          No items in this category
        </div>
      )
    }

    return (
      <div className="px-4 py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-16 pl-12">Image</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead className="w-28">Price</TableHead>
              <TableHead className="w-20">Stock</TableHead>
              <TableHead className="w-24">Available</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-zinc-100/50">
                <TableCell className="pl-12">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-50 flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UtensilsCrossed className="h-3 w-3 text-emerald-300" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-zinc-700">
                  {item.name}
                </TableCell>
                <TableCell className="text-emerald-600 font-semibold">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleDeleteItem(item.id)}
                        variant="destructive"
                      >
                        Delete item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
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
            <BreadcrumbItem>
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-800">Categories</h1>
          <Button
            onClick={openAddDialog}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border">
            <FolderOpen className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-400">
              No categories yet. Add your first category to get started.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={categories}
            getRowCanExpand={() => true}
            renderSubComponent={renderSubComponent}
            showPagination={false}
          />
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-700">Name</label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
                required
                className="mt-1"
                autoFocus
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
