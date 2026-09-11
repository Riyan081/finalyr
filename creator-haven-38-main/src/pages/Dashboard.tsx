import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, PlusCircle, BarChart3, Settings, LogOut,
  TrendingUp, DollarSign, ShoppingCart, Eye,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { MOCK_PRODUCTS, formatPrice } from "@/data/mockData";
import { useMyProducts } from "@/hooks/useMyProducts";

const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Package, label: "Products", href: "/dashboard/products" },
  { icon: PlusCircle, label: "New Product", href: "/dashboard/products/new" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const STATS = [
  { label: "Total Revenue", value: "₹4,82,500", icon: DollarSign, color: "bg-digi-pink" },
  { label: "Total Sales", value: "234", icon: ShoppingCart, color: "bg-digi-yellow" },
  { label: "This Month", value: "₹78,400", icon: TrendingUp, color: "bg-digi-mint" },
  { label: "Product Views", value: "12,456", icon: Eye, color: "bg-digi-lavender" },
];

const RECENT_SALES = [
  { product: "The Complete UI Design System", buyer: "Rahul K.", amount: 4999, date: "2 hours ago" },
  { product: "React & Node.js Masterclass", buyer: "Ananya S.", amount: 2999, date: "5 hours ago" },
  { product: "Lo-Fi Beats Sample Pack", buyer: "Vikram P.", amount: 1499, date: "1 day ago" },
  { product: "Startup Fundraising Playbook", buyer: "Meera R.", amount: 1999, date: "1 day ago" },
  { product: "Digital Watercolor Brushes", buyer: "Deepika M.", amount: 599, date: "2 days ago" },
];

const Dashboard = () => {
  const location = useLocation();
  const { products: myCreated } = useMyProducts();
  const myProducts = myCreated.length > 0 ? myCreated.slice(0, 5) : MOCK_PRODUCTS.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-card brutal-border border-t-0 border-l-0 border-b-0 p-4">
          <nav className="space-y-1 flex-1">
            {SIDEBAR_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground brutal-border"
                    : "hover:bg-muted"
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
          </nav>
          <button className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-auto">
            <LogOut size={18} />
            Log out
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="font-heading font-black text-3xl mb-1">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="brutal-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </span>
                  <div className={`w-8 h-8 ${stat.color} brutal-border flex items-center justify-center`}>
                    <stat.icon size={14} className="text-primary-foreground" />
                  </div>
                </div>
                <p className="font-heading font-black text-2xl">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Recent Sales */}
            <div className="lg:col-span-3 brutal-card">
              <div className="px-6 py-4 border-b-2 border-border">
                <h2 className="font-heading font-bold text-lg">Recent Sales</h2>
              </div>
              <div className="divide-y-2 divide-border">
                {RECENT_SALES.map((sale, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{sale.product}</p>
                      <p className="text-xs text-muted-foreground">{sale.buyer} • {sale.date}</p>
                    </div>
                    <span className="font-bold text-sm shrink-0 bg-digi-mint text-primary-foreground px-2 py-1 brutal-border text-xs">
                      +{formatPrice(sale.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Top Products */}
            <div className="lg:col-span-2 space-y-6">
              <div className="brutal-card p-6">
                <h2 className="font-heading font-bold text-lg mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link
                    to="/dashboard/products/new"
                    className="w-full brutal-btn bg-primary text-primary-foreground text-sm font-bold py-3 flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={16} /> New Product
                  </Link>
                  <Link
                    to="/dashboard/analytics"
                    className="w-full brutal-btn bg-card text-sm font-semibold py-3 flex items-center justify-center gap-2"
                  >
                    <BarChart3 size={16} /> View Analytics
                  </Link>
                </div>
              </div>

              <div className="brutal-card">
                <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between">
                  <h2 className="font-heading font-bold text-lg">Your Products</h2>
                  <Link to="/dashboard/products" className="text-xs font-semibold text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="divide-y-2 divide-border">
                  {myProducts.map((product) => (
                    <div key={product.id} className="px-6 py-3 flex items-center justify-between">
                      <span className="text-sm font-medium truncate pr-4">{product.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {"sales" in product ? product.sales : product.salesCount} sales
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
