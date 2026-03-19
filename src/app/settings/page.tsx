"use client";

import { useState, useEffect } from "react";
import { Save, Store } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Settings } from "@/types";

const CURRENCIES = [
  { code: "EGP", name: "Egyptian Pound", symbol: "EGP" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    storePhone: "",
    storeAddress: "",
    currency: "EGP",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      setSettings(data);
      setFormData({
        storeName: data.storeName || "",
        storePhone: data.storePhone || "",
        storeAddress: data.storeAddress || "",
        currency: data.currency || "EGP",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
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
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Store className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-800">Store Settings</h1>
              <p className="text-sm text-zinc-500">
                Configure your store information and receipt settings
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Store Name
                </label>
                <Input
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  placeholder="My POS Store"
                  className="h-11"
                />
                <p className="text-xs text-zinc-400 mt-1">
                  This will appear on receipts and the header
                </p>
              </div>

              {/* Store Address */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Store Address
                </label>
                <Input
                  value={formData.storeAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, storeAddress: e.target.value })
                  }
                  placeholder="123 Main St, City Center"
                  className="h-11"
                />
              </div>

              {/* Store Phone */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Store Phone
                </label>
                <Input
                  value={formData.storePhone}
                  onChange={(e) =>
                    setFormData({ ...formData, storePhone: e.target.value })
                  }
                  placeholder="+20 123 456 7890"
                  className="h-11"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-md border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-400 mt-1">
                  Currency used for prices on receipts and displays
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-zinc-100">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 px-6"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
                </Button>
                {saved && (
                  <span className="ml-3 text-sm text-emerald-600">
                    Settings saved successfully!
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
