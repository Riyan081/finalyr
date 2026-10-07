"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@repo/auth/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/navbar";
import DashboardSidebar from "@/components/dashboard-sidebar";

const CREATOR_ONLY_ROUTES = [
  "/dashboard/products",
  "/dashboard/analytics",
  "/dashboard/orders",
  "/dashboard/discounts",
  "/dashboard/memberships",
];

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

    const user = session.user as any;
    const isCreator = user.role === "creator" || Boolean(user.username);

    // If user is not a creator and visits root /dashboard, send them to their purchases library
    if (!isCreator && pathname === "/dashboard") {
      router.push("/dashboard/purchases");
      return;
    }

    // If trying to access creator-only tools without being a creator, redirect to setup
    const isCreatorOnlyRoute = CREATOR_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (!isCreator && isCreatorOnlyRoute && !isSetupRoute) {
      toast.info("Set up your creator profile to access seller features");
      router.push("/dashboard/creator-setup");
      return;
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
