"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Receipt,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Printer,
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
import { Order, OrderItem } from "@/types"
import { useSettings } from "@/hooks/use-settings"
import { formatPrice } from "@/lib/format"

interface OrderWithCount extends Order {
  _count?: {
    items: number
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()
  const currency = settings?.currency || "EGP"

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteOrder(order: Order) {
    if (
      !confirm(
        `Are you sure you want to delete Order #${order.id}? This cannot be undone.`
      )
    )
      return

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchOrders()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete order")
      }
    } catch (error) {
      console.error("Error deleting order:", error)
      alert("Failed to delete order")
    }
  }

  function formatDateTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const columns: ColumnDef<OrderWithCount>[] = [
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
          <Receipt className="h-4 w-4 text-emerald-500" />
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "Order #",
      cell: ({ row }) => (
        <div className="font-medium text-zinc-800">#{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date & Time",
      cell: ({ row }) => (
        <div className="text-zinc-500">
          {formatDateTime(row.getValue("createdAt"))}
        </div>
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
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <div className="font-semibold text-emerald-600">
          {formatPrice(row.getValue("total"), currency)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => {
        const order = row.original

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
                <DropdownMenuItem asChild>
                  <Link href={`/receipt/${order.id}`}>
                    View receipt
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open(`/receipt/${order.id}`, '_blank')}
                >
                  Print receipt
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteOrder(order)}
                  variant="destructive"
                >
                  Delete order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      enableHiding: false,
    },
  ]

  const renderSubComponent = ({ row }: { row: Row<OrderWithCount> }) => {
    const items = row.original.items || []

    if (items.length === 0) {
      return (
        <div className="px-12 py-4 text-zinc-400 text-sm">
          No items in this order
        </div>
      )
    }

    return (
      <div className="px-4 py-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-12">Item Name</TableHead>
              <TableHead className="w-28">Unit Price</TableHead>
              <TableHead className="w-20">Qty</TableHead>
              <TableHead className="w-28 text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: OrderItem) => (
              <TableRow key={item.id} className="hover:bg-zinc-100/50">
                <TableCell className="pl-12 font-medium text-zinc-700">
                  {item.menuItem?.name || `Item #${item.menuItemId}`}
                </TableCell>
                <TableCell className="text-zinc-500">
                  {formatPrice(item.unitPrice, currency)}
                </TableCell>
                <TableCell className="text-zinc-500">
                  x{item.quantity}
                </TableCell>
                <TableCell className="text-right font-semibold text-emerald-600">
                  {formatPrice(item.unitPrice * item.quantity, currency)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="hover:bg-transparent border-t-2">
              <TableCell colSpan={3} className="pl-12 font-semibold text-zinc-800">
                Total
              </TableCell>
              <TableCell className="text-right font-bold text-emerald-600">
                {formatPrice(row.original.total, currency)}
              </TableCell>
            </TableRow>
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
              <BreadcrumbPage>Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-800">Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border">
            <Receipt className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-400">
              No orders yet. Orders will appear here once customers make purchases.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            getRowCanExpand={() => true}
            renderSubComponent={renderSubComponent}
            showPagination={true}
          />
        )}
      </div>
    </div>
  )
}
