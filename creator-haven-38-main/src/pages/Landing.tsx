import { Link } from "react-router-dom";
import { ArrowRight, Zap, Globe, Users, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CATEGORIES, MOCK_PRODUCTS } from "@/data/mockData";
import ProductCard from "@/components/ProductCard";

const TESTIMONIALS = [
  { quote: "DigiStore helped me earn my first ₹1 online. Now I make a full-time living selling courses.", author: "Priya S.", role: "Course Creator" },
  { quote: "The simplest platform I've used. Upload, set a price, share the link. That's it.", author: "Arjun M.", role: "Developer" },
  { quote: "I went from 0 to 10,000 customers in 6 months. The tools just work.", author: "Neha G.", role: "Illustrator" },
];

const Landing = () => {
  const featuredProducts = MOCK_PRODUCTS.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-heading font-black text-5xl md:text-7xl lg:text-8xl leading-[0.9] mb-6">
            Go from{" "}
            <span className="bg-digi-pink text-primary-foreground px-3 brutal-border brutal-shadow inline-block transform -rotate-1">
              zero
            </span>{" "}
            to{" "}
            <span className="bg-digi-yellow text-primary-foreground px-3 brutal-border brutal-shadow inline-block transform rotate-1">
              ₹1
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-body">
            DigiStore is the easiest way to sell digital products, courses, memberships,
            and more. Start earning from what you create.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="brutal-btn bg-primary text-primary-foreground text-lg px-10 py-4 font-bold inline-flex items-center justify-center gap-2"
            >
              Start Selling <ArrowRight size={20} />
            </Link>
            <Link
              to="/discover"
              className="brutal-btn bg-card text-foreground text-lg px-10 py-4 font-bold inline-flex items-center justify-center gap-2"
            >
              Discover Products
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card py-6 brutal-border border-x-0">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "₹48,000Cr+", label: "Earned by Creators" },
            { value: "13M+", label: "Customers" },
            { value: "190+", label: "Countries" },
            { value: "750K+", label: "Products" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-heading font-black text-2xl md:text-3xl text-primary">{stat.value}</div>
              <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading font-black text-4xl md:text-5xl text-center mb-16">
            Everything you need to{" "}
            <span className="text-gradient-pink">sell</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Sell Anything", desc: "Digital products, courses, memberships, software — if you can create it, you can sell it.", color: "bg-digi-pink" },
              { icon: Globe, title: "Sell Anywhere", desc: "Share a link on social media, embed on your site, or let customers discover you on DigiStore.", color: "bg-digi-yellow" },
              { icon: Users, title: "Sell to Anyone", desc: "Reach customers in 190+ countries. We handle payments, taxes, and delivery.", color: "bg-digi-mint" },
            ].map((feature) => (
              <div key={feature.title} className="brutal-card p-8">
                <div className={`w-14 h-14 ${feature.color} brutal-border brutal-shadow flex items-center justify-center mb-6`}>
                  <feature.icon size={24} className="text-primary-foreground" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Ticker */}
      <section className="py-8 bg-digi-yellow brutal-border border-x-0 overflow-hidden">
        <div className="animate-ticker flex gap-6 whitespace-nowrap">
          {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
            <span key={i} className="font-heading font-bold text-lg text-primary-foreground flex items-center gap-2">
              {cat} <Star size={12} className="fill-primary-foreground/40 text-primary-foreground/40" />
            </span>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading font-black text-3xl md:text-4xl">Trending Now</h2>
            <Link to="/discover" className="brutal-btn bg-card text-sm inline-flex items-center gap-2">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading font-black text-3xl md:text-4xl text-center mb-12">
            Loved by Creators
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="brutal-card p-8 bg-card">
                <p className="text-lg mb-6 leading-relaxed italic text-muted-foreground">"{t.quote}"</p>
                <div>
                  <p className="font-bold">{t.author}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-black text-4xl md:text-5xl mb-6">
            Ready to start selling?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators earning money from their skills and knowledge.
          </p>
          <Link
            to="/signup"
            className="brutal-btn bg-primary text-primary-foreground text-lg px-12 py-4 font-bold inline-flex items-center gap-2"
          >
            Start for Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
