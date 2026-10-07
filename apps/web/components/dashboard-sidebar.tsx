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
  Sparkles,
  ExternalLink,
  Repeat,
} from "lucide-react";
import { authClient } from "@repo/auth/client";
import { useMe } from "@/hooks/api-hooks";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

const CREATOR_LINKS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Package, label: "Products", href: "/dashboard/products" },
  { icon: PlusCircle, label: "New Product", href: "/dashboard/products/new" },
  { icon: Repeat, label: "Memberships", href: "/dashboard/memberships" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: ShoppingCart, label: "Sales", href: "/dashboard/orders" },
  { icon: Tag, label: "Discounts", href: "/dashboard/discounts" },
];

const BUYER_LINKS = [
  { icon: ShoppingBag, label: "Purchases", href: "/dashboard/purchases" },
  { icon: Users, label: "Following", href: "/dashboard/following" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: me } = useMe();

  const user = (session?.user || me) as any;
  const isCreator =
    user?.role === "creator" ||
    Boolean(user?.username) ||
    me?.role === "creator" ||
    Boolean(me?.username);

  const username = user?.username || me?.username;

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Logged out");
    router.push("/");
  };

  const renderNavLink = (link: { icon: any; label: string; href: string }) => {
    const Icon = link.icon;
    const isActive =
      pathname === link.href ||
      (link.href !== "/dashboard" && pathname.startsWith(link.href));

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
  };

  return (
    <aside className="hidden md:flex flex-col w-56 bg-card brutal-border border-t-0 border-l-0 border-b-0 p-4">
      <nav className="space-y-4 flex-1">
        {isCreator ? (
          <>
            <div>
              <p className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Creator Studio
              </p>
              <div className="space-y-1">
                {CREATOR_LINKS.map(renderNavLink)}
              </div>
            </div>

            <div>
              <p className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Personal
              </p>
              <div className="space-y-1">
                {BUYER_LINKS.map(renderNavLink)}
              </div>
            </div>

            {username && (
              <div className="pt-2">
                <Link
                  href={`/creator/${username}`}
                  target="_blank"
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground brutal-border bg-muted/30 hover:bg-muted transition-colors"
                >
                  <span className="truncate">My Storefront</span>
                  <ExternalLink size={12} className="shrink-0" />
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <p className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                My Account
              </p>
              <div className="space-y-1">
                {BUYER_LINKS.map(renderNavLink)}
              </div>
            </div>

            <div className="p-4 brutal-card bg-primary/10 border-2 border-dashed border-primary mt-6">
              <div className="flex items-center gap-1.5 font-heading font-black text-xs uppercase tracking-wider mb-1 text-primary">
                <Sparkles size={14} /> Sell On DigiStore
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Want to sell digital products, art, or courses?
              </p>
              <Link
                href="/dashboard/creator-setup"
                className="w-full brutal-btn bg-primary text-primary-foreground text-xs font-bold py-2 flex items-center justify-center gap-1.5"
              >
                Become a Creator
              </Link>
            </div>
          </>
        )}

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

      <div className="mt-auto pt-4 border-t-2 border-border space-y-1.5">
        <ThemeToggle showLabel className="w-full justify-start px-3 py-2 text-xs" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
