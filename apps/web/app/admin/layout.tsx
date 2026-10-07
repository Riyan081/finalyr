"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Loader2, Shield } from "lucide-react";
import { authClient } from "@repo/auth/client";
import { useMe } from "@/hooks/api-hooks";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { data: me, loading: meLoading } = useMe();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isPending && !meLoading) {
      if (!session) {
        router.push("/login?redirect=/admin");
      } else if (me?.role !== "admin" && (session.user as any)?.role !== "admin") {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    }
  }, [session, isPending, me, meLoading, router]);

  if (isPending || meLoading || authorized === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="brutal-card p-8 text-center bg-card">
          <Loader2 size={36} className="animate-spin text-primary mx-auto mb-4" />
          <p className="font-heading font-bold text-sm">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="brutal-card p-8 max-w-md text-center bg-card">
          <ShieldAlert size={48} className="mx-auto mb-4 text-destructive" />
          <h1 className="font-heading font-black text-2xl mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You need administrative superuser privileges to view this portal.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard" className="brutal-btn bg-primary text-primary-foreground text-sm font-bold">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const user = session?.user || (me as any);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-40 border-b-2 border-border bg-card/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Logo & Admin Branding */}
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading font-black text-2xl tracking-tight hover:opacity-80 transition-opacity">
              Digi<span className="text-primary">Store</span>
            </Link>
            <div className="flex items-center gap-1.5 bg-destructive/15 text-destructive font-heading font-black text-[11px] uppercase tracking-wider px-2 py-0.5 brutal-border">
              <Shield size={13} />
              <span>Admin Console</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground ml-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Engine</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle showLabel={false} className="h-9 px-2.5" />

            {/* Exit Admin Button */}
            <Link
              href="/dashboard"
              className="brutal-btn bg-card text-xs font-bold flex items-center gap-1.5 py-2 px-3 hover:bg-muted transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Exit to Studio</span>
            </Link>

            {/* Admin User Chip */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l-2 border-border">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || "Admin"}
                  className="w-7 h-7 rounded-full brutal-border object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black">
                  {(user?.name || "A").charAt(0)}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-bold leading-tight line-clamp-1">{user?.name || "Administrator"}</p>
                <p className="text-[10px] text-muted-foreground font-mono leading-tight">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t-2 border-border bg-muted/40 py-4 px-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-[11px]">
            DigiStore Platform Operations &bull; 10% Protocol Fee &bull; High Reliability
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/dashboard" className="hover:underline">Creator Studio</Link>
            <Link href="/discover" className="hover:underline">Public Store</Link>
            <Link href="/pricing" className="hover:underline">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
