import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Globe,
  LogOut,
  Menu,
  X,
  FolderTree,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { t, language, setLanguage, direction } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: t("admin.dashboard") },
    { href: "/admin/products", icon: Package, label: t("admin.products") },
    { href: "/admin/categories", icon: FolderTree, label: language === "ar" ? "الفئات" : "Categories" },
    { href: "/admin/orders", icon: ShoppingCart, label: t("admin.orders") },
    { href: "/admin/customers", icon: Users, label: t("admin.customers") },
    { href: "/admin/blog", icon: FileText, label: t("admin.blog post") },
    { href: "/admin/newsletter", icon: Mail, label: language === "ar" ? "النشرة البريدية" : "Newsletter" },
    { href: "/admin/settings", icon: Settings, label: t("admin.settings") },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className={cn("min-h-screen flex", direction === "rtl" && "font-arabic")}>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col bg-sidebar transition-transform duration-300 lg:relative lg:translate-x-0",
          direction === "rtl" ? "right-0" : "left-0",
          sidebarOpen ? "translate-x-0" : direction === "rtl" ? "translate-x-full" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <span className="text-sm font-bold text-sidebar-primary-foreground">P</span>
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">
              {language === "ar" ? "لوحة التحكم" : "Admin"}
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          >
            <Globe className="h-5 w-5" />
            {language === "ar" ? "English" : "العربية"}
          </Button>
          <Link to="/">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-5 w-5" />
              {language === "ar" ? "العودة للموقع" : "Back to Site"}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-sm font-medium">Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-muted/30">{children}</main>
      </div>
    </div>
  );
}
