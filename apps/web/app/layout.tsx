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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('digistore-theme')||'dark';if(t==='light'){document.documentElement.classList.add('light');document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              border: "2px solid hsl(var(--border))",
              boxShadow: "var(--shadow-brutal)",
              borderRadius: "0",
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              fontFamily: "var(--font-body)",
            },
          }}
        />
      </body>
    </html>
  );
}
