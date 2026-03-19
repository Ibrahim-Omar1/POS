"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Utensils,
  ShoppingCart,
  UtensilsCrossed,
  FolderOpen,
  Receipt,
  Settings,
} from "lucide-react"
import { Category } from "@/types"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [categories, setCategories] = React.useState<Category[]>([])

  React.useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories")
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  const navMain = [
    {
      title: "Point of Sale",
      url: "/",
      icon: ShoppingCart,
    },
    {
      title: "Menu Items",
      url: "/menu",
      icon: UtensilsCrossed,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: FolderOpen,
      items: categories.map((cat) => ({
        title: cat.name,
        url: `/categories/${cat.id}`,
      })),
    },
    {
      title: "Orders",
      url: "/orders",
      icon: Receipt,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Utensils className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">
                  <span className="text-emerald-600">My</span>
                  <span>POS</span>
                </span>
                <span className="text-xs text-muted-foreground">Point of Sale</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={pathname === item.url}
                  render={<Link href={item.url} className="font-medium" />}
                >
                  <item.icon className="size-4" />
                  {item.title}
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          isActive={pathname === subItem.url}
                          render={<Link href={subItem.url} />}
                        >
                          {subItem.title}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
