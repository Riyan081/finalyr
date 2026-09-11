"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Users, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { authClient } from "@repo/auth/client";
import { useMe } from "@/hooks/api-hooks";

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
        <Loader2 size={36} className="animate-spin text-primary mb-4" />
        <p className="font-heading font-bold text-sm">Verifying Admin Access...</p>
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
            You need administrative privileges to view this portal.
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Admin Header */}
      <header className="border-b-2 border-border bg-digi-yellow/15 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-destructive text-destructive-foreground text-xs font-black px-2.5 py-1 brutal-border uppercase tracking-wider">
            ADMIN PORTAL
          </span>
          <h1 className="font-heading font-black text-xl hidden sm:inline">Platform Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="brutal-btn bg-card text-xs font-bold flex items-center gap-1.5 py-2 px-3"
          >
            <ArrowLeft size={14} /> Exit Admin
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">{children}</main>
    </div>
  );
}
