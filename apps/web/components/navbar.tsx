"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard, LogOut, User, ShoppingBag, Users, BookOpen } from "lucide-react";
import { authClient } from "@repo/auth/client";
import { toast } from "sonner";

const navLinks = [
  { label: "Discover", href: "/discover" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Real session from Better Auth
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Logged out");
    router.push("/");
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card brutal-border border-t-0 border-x-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-heading font-black text-2xl tracking-tight"
          >
            <span className="bg-primary text-primary-foreground px-2 py-0.5 brutal-border brutal-shadow text-lg">
              D
            </span>
            <span>DigiStore</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 font-medium text-sm transition-colors hover:bg-primary/20 ${
                  pathname === link.href ? "bg-primary/20 font-bold" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isPending ? (
              // Loading skeleton
              <div className="w-32 h-9 bg-muted animate-pulse brutal-border" />
            ) : user ? (
              // Logged in — user avatar + dropdown
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 brutal-border hover:bg-muted transition-colors"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <User size={12} className="text-primary-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-semibold truncate max-w-[120px]">
                    {user.name}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card brutal-border brutal-shadow z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/purchases"
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ShoppingBag size={16} />
                      Purchases
                    </Link>
                    <Link
                      href="/library"
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <BookOpen size={16} />
                      Library
                    </Link>
                    <Link
                      href="/dashboard/following"
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Users size={16} />
                      Following
                    </Link>
                    <div className="border-t-2 border-border" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Logged out
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 font-semibold text-sm hover:bg-muted transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="brutal-btn bg-primary text-primary-foreground text-sm"
                >
                  Start Selling
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card brutal-border border-x-0 px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 font-medium hover:bg-primary/20"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="brutal-btn bg-card flex-1 text-center text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="brutal-btn bg-destructive text-destructive-foreground flex-1 text-center text-sm"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="brutal-btn bg-card flex-1 text-center text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="brutal-btn bg-primary text-primary-foreground flex-1 text-center text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Start Selling
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </nav>
  );
}
