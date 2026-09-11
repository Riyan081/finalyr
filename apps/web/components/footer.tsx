import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Discover", href: "/discover" },
    { label: "University", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-card mt-auto brutal-border border-x-0 border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-heading font-black text-2xl mb-4">
              DigiStore
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The easiest way to sell digital products, memberships, and
              courses.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-muted-foreground">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 DigiStore. Built as a BTech Final Year Project.
          </p>
          <div className="flex gap-4">
            <span className="text-muted-foreground text-sm hover:text-primary cursor-pointer transition-colors">
              Twitter
            </span>
            <span className="text-muted-foreground text-sm hover:text-primary cursor-pointer transition-colors">
              YouTube
            </span>
            <span className="text-muted-foreground text-sm hover:text-primary cursor-pointer transition-colors">
              GitHub
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
