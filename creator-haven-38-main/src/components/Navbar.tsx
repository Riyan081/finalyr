import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Discover", href: "/discover" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card brutal-border border-t-0 border-x-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-heading font-black text-2xl tracking-tight">
            <span className="bg-primary text-primary-foreground px-2 py-0.5 brutal-border brutal-shadow text-lg">D</span>
            <span>DigiStore</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 font-medium text-sm transition-colors hover:bg-primary/20 ${
                  location.pathname === link.href ? "bg-primary/20 font-bold" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 font-semibold text-sm hover:bg-muted transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="brutal-btn bg-primary text-primary-foreground text-sm"
            >
              Start Selling
            </Link>
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
              to={link.href}
              className="block px-4 py-3 font-medium hover:bg-primary/20"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Link to="/login" className="brutal-btn bg-card flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>
              Login
            </Link>
            <Link to="/signup" className="brutal-btn bg-primary text-primary-foreground flex-1 text-center text-sm" onClick={() => setMobileOpen(false)}>
              Start Selling
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
