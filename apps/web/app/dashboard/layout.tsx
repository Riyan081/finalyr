"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@repo/auth/client";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/navbar";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const isSetupRoute = pathname === "/dashboard/creator-setup";

  useEffect(() => {
    if (isPending) return;

    // Not logged in → redirect to login
    if (!session?.user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Logged in but not a creator yet → redirect to setup
    // (unless already on the setup page)
    const user = session.user as any;
    const isCreator = user.role === "creator" || Boolean(user.username);
    if (!isCreator && !isSetupRoute) {
      router.push("/dashboard/creator-setup");
    }
  }, [session, isPending, router, pathname, isSetupRoute]);

  // Show full-screen spinner while checking auth
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not logged in — show nothing while redirect happens
  if (!session?.user) {
    return null;
  }

  // Creator setup page doesn't use the dashboard shell
  if (isSetupRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
