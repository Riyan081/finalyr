import { Check, ArrowRight, Star, CreditCard, BarChart3, Key, Layers, Globe, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FEATURES = [
  { icon: Layers, title: "Create your storefront", desc: "Beautiful, customizable product pages that convert. No design skills needed.", color: "bg-digi-pink" },
  { icon: CreditCard, title: "Accept payments globally", desc: "Credit cards, debit cards, PayPal — we support all major payment methods in 190+ countries.", color: "bg-digi-yellow" },
  { icon: Star, title: "Memberships", desc: "Build a community with recurring memberships. Offer tiers, exclusive content, and more.", color: "bg-digi-mint" },
  { icon: BarChart3, title: "Powerful analytics", desc: "Track sales, revenue, conversion rates, and customer behavior in real-time.", color: "bg-digi-lavender" },
  { icon: Key, title: "License keys", desc: "Automatically generate and distribute unique license keys for your software.", color: "bg-digi-peach" },
  { icon: Globe, title: "Multi-format delivery", desc: "Sell PDFs, videos, audio, software, ZIP files — any digital format.", color: "bg-digi-pink" },
  { icon: Headphones, title: "Creator support", desc: "Our support team is here to help you succeed. Get answers fast.", color: "bg-digi-yellow" },
  { icon: Check, title: "No monthly fees", desc: "We only make money when you do. No subscription, no setup costs.", color: "bg-digi-mint" },
];

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="bg-digi-yellow text-primary-foreground brutal-border px-4 py-1 text-sm font-bold mb-6 inline-block">
            FEATURES
          </span>
          <h1 className="font-heading font-black text-5xl md:text-7xl leading-[0.9] mb-6">
            Built for new{" "}
            <span className="bg-digi-pink text-primary-foreground px-3 brutal-border brutal-shadow inline-block transform rotate-1">
              beginnings
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to start selling digital products. Simple, powerful tools that grow with you.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="brutal-card p-6">
                <div className={`w-12 h-12 ${feature.color} brutal-border brutal-shadow flex items-center justify-center mb-5`}>
                  <feature.icon size={20} className="text-primary-foreground" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-16 px-4 bg-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-heading font-bold text-2xl md:text-3xl leading-snug mb-6 italic text-muted-foreground">
            "DigiStore is the simplest way I've found to sell anything online. I went from idea to first sale in under an hour."
          </p>
          <p className="font-bold">— Creator on DigiStore</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-black text-4xl mb-6">Start selling today</h2>
          <Link
            to="/signup"
            className="brutal-btn bg-primary text-primary-foreground text-lg px-10 py-4 font-bold inline-flex items-center gap-2"
          >
            Create Your Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
