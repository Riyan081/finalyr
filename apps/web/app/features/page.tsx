"use client";

import Link from "next/link";
import {
  Check,
  ArrowRight,
  Star,
  CreditCard,
  BarChart3,
  Key,
  Layers,
  Globe,
  Headphones,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { authClient } from "@repo/auth/client";

const FEATURES = [
  {
    icon: Layers,
    title: "Create your storefront",
    desc: "Beautiful, customizable product pages that convert. No design skills needed.",
    color: "bg-digi-pink",
  },
  {
    icon: CreditCard,
    title: "Accept payments globally",
    desc: "Credit cards, debit cards, PayPal — we support all major payment methods in 190+ countries.",
    color: "bg-digi-yellow",
  },
  {
    icon: Star,
    title: "Memberships",
    desc: "Build a community with recurring memberships. Offer tiers, exclusive content, and more.",
    color: "bg-digi-mint",
  },
  {
    icon: BarChart3,
    title: "Powerful analytics",
    desc: "Track sales, revenue, conversion rates, and customer behavior in real-time.",
    color: "bg-digi-lavender",
  },
  {
    icon: Key,
    title: "License key generation",
    desc: "Automatically generate and validate license keys for your software products.",
    color: "bg-digi-sky",
  },
  {
    icon: Globe,
    title: "Custom domains",
    desc: "Connect your own domain to keep your brand front and center.",
    color: "bg-digi-coral",
  },
  {
    icon: Headphones,
    title: "Content dripping",
    desc: "Release course modules over time to keep students engaged and reduce refund rates.",
    color: "bg-digi-yellow",
  },
  {
    icon: Check,
    title: "Discount codes",
    desc: "Create percentage or fixed-amount discounts with usage limits and expiration dates.",
    color: "bg-digi-mint",
  },
];

export default function FeaturesPage() {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="bg-primary text-primary-foreground px-4 py-1 font-bold text-sm brutal-border brutal-shadow inline-block mb-6">
            Everything You Need
          </span>
          <h1 className="font-heading font-black text-5xl md:text-6xl mb-6">
            Built for creators who mean business
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From your first sale to millions in revenue, DigiStore has every tool
            you need to build and scale your digital business.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="brutal-card p-6 flex flex-col">
              <div
                className={`w-12 h-12 ${feature.color} brutal-border flex items-center justify-center mb-4 shrink-0`}
              >
                <feature.icon size={24} className="text-foreground" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm flex-1">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Quote */}
      <section className="py-16 px-4 bg-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-heading font-bold text-2xl md:text-3xl leading-snug mb-6 italic text-muted-foreground">
            &ldquo;DigiStore is the simplest way I&rsquo;ve found to sell
            anything online. I went from idea to first sale in under an
            hour.&rdquo;
          </p>
          <p className="font-bold">— Creator on DigiStore</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-black text-4xl mb-6">
            Start selling today
          </h2>
          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="brutal-btn bg-primary text-primary-foreground text-lg px-10 py-4 font-bold inline-flex items-center gap-2"
          >
            {isLoggedIn ? "Go to Dashboard" : "Create Your Account"}{" "}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
