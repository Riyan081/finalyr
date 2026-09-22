"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut,
  ShoppingCart,
  ShoppingBag,
  Tag,
  Shield,
  Users,
  BookOpen,
} from "lucide-react";
import { authClient } from "@repo/auth/client";
import { useMe } from "@/hooks/api-hooks";
import { toast } from "sonner";

const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Package, label: "Products", href: "/dashboard/products" },
  { icon: PlusCircle, label: "New Product", href: "/dashboard/products/new" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: ShoppingCart, label: "Sales", href: "/dashboard/orders" },
  { icon: ShoppingBag, label: "Purchases", href: "/dashboard/purchases" },
  { icon: BookOpen, label: "Library", href: "/library" },
  { icon: Users, label: "Following", href: "/dashboard/following" },
  { icon: Tag, label: "Discounts", href: "/dashboard/discounts" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useMe();

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Logged out");
    router.push("/");
  };

  return (
    <aside className="hidden md:flex flex-col w-56 bg-card brutal-border border-t-0 border-l-0 border-b-0 p-4">
      <nav className="space-y-1 flex-1">
        {SIDEBAR_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground brutal-border"
                  : "hover:bg-muted"
              }`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}

        {me?.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold bg-destructive/10 text-destructive brutal-border mt-4 hover:bg-destructive/20 transition-colors"
          >
            <Shield size={18} />
            Admin Portal
          </Link>
        )}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-auto"
      >
        <LogOut size={18} />
        Log out
      </button>
    </aside>
  );
}
