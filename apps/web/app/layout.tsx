import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "DigiStore — Sell Digital Products",
  description:
    "DigiStore is the easiest way to sell digital products, courses, memberships, and more. Start earning from what you create.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              border: "2px solid hsl(50 6% 25%)",
              boxShadow: "4px 4px 0px hsl(50 6% 25%)",
              borderRadius: "0",
              fontFamily: "var(--font-body)",
            },
          }}
        />
      </body>
    </html>
  );
}
