"use client";

import Link from "next/link";
import { ArrowRight, Zap, Globe, Users, Star } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { CATEGORY_LABELS } from "@/lib/mock-data";
import { useTrendingProducts, useFeaturedCreators } from "@/hooks/api-hooks";

import { authClient } from "@repo/auth/client";

const CATEGORY_LIST = Object.values(CATEGORY_LABELS);

const TESTIMONIALS = [
  {
    quote:
      "DigiStore helped me earn my first ₹1 online. Now I make a full-time living selling courses.",
    author: "Priya S.",
    role: "Course Creator",
  },
  {
    quote:
      "The simplest platform I've used. Upload, set a price, share the link. That's it.",
    author: "Arjun M.",
    role: "Developer",
  },
  {
    quote:
      "I went from 0 to 10,000 customers in 6 months. The tools just work.",
    author: "Neha G.",
    role: "Illustrator",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Sell Anything",
    desc: "Digital products, courses, memberships, software — if you can create it, you can sell it.",
    color: "bg-digi-pink",
  },
  {
    icon: Globe,
    title: "Sell Anywhere",
    desc: "Share a link on social media, embed on your site, or let customers discover you on DigiStore.",
    color: "bg-digi-yellow",
  },
  {
    icon: Users,
    title: "Sell to Anyone",
    desc: "Reach customers in 190+ countries. We handle payments, taxes, and delivery.",
    color: "bg-digi-mint",
  },
];

const STATS = [
  { value: "₹48,000Cr+", label: "Earned by Creators" },
  { value: "13M+", label: "Customers" },
  { value: "190+", label: "Countries" },
  { value: "750K+", label: "Products" },
];

export default function LandingPage() {
  const { data: session } = authClient.useSession();
  const { data: trendingProducts, loading } = useTrendingProducts(4);
  const { data: featuredCreators, loading: creatorsLoading } = useFeaturedCreators(6);

  const isLoggedIn = !!session?.user;

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
            DigiStore is the easiest way to sell digital products, courses,
            memberships, and more. Start earning from what you create.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="brutal-btn bg-primary text-primary-foreground text-lg px-10 py-4 font-bold inline-flex items-center justify-center gap-2"
            >
              {isLoggedIn ? "Go to Dashboard" : "Start Selling"}{" "}
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/discover"
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
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="font-heading font-black text-2xl md:text-3xl text-primary">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm mt-1">
                {stat.label}
              </div>
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
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="brutal-card p-8">
                  <div
                    className={`w-14 h-14 ${feature.color} brutal-border brutal-shadow flex items-center justify-center mb-6`}
                  >
                    <Icon size={24} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Ticker */}
      <section className="py-8 bg-digi-yellow brutal-border border-x-0 overflow-hidden">
        <div className="animate-ticker flex gap-6 whitespace-nowrap">
          {[...CATEGORY_LIST, ...CATEGORY_LIST].map((cat, i) => (
            <span
              key={i}
              className="font-heading font-bold text-lg text-primary-foreground flex items-center gap-2"
            >
              {cat}{" "}
              <Star
                size={12}
                className="fill-primary-foreground/40 text-primary-foreground/40"
              />
            </span>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading font-black text-3xl md:text-4xl">
              Trending Now
            </h2>
            <Link
              href="/discover"
              className="brutal-btn bg-card text-sm inline-flex items-center gap-2"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="brutal-card overflow-hidden">
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : trendingProducts && trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="brutal-card p-12 text-center">
              <p className="text-muted-foreground">
                No trending products yet.{" "}
                <Link href={isLoggedIn ? "/dashboard/products/new" : "/signup"} className="font-bold underline">
                  Be the first creator!
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Creators */}
      {(creatorsLoading || (featuredCreators && featuredCreators.length > 0)) && (
        <section className="py-20 px-4 bg-card">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-heading font-black text-3xl md:text-4xl">
                  Top Creators
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Discover the people behind the best digital products.
                </p>
              </div>
              <Link
                href="/discover"
                className="brutal-btn bg-background text-sm inline-flex items-center gap-2"
              >
                Browse All <ArrowRight size={16} />
              </Link>
            </div>

            {creatorsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="brutal-card p-5 flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted animate-pulse brutal-border" />
                    <div className="h-3 bg-muted animate-pulse rounded w-20" />
                    <div className="h-2 bg-muted animate-pulse rounded w-14" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {featuredCreators!.map((creator) => (
                  <Link
                    key={creator.id}
                    href={`/creator/${creator.username}`}
                    className="brutal-card p-5 flex flex-col items-center gap-3 text-center group hover:-translate-y-1 transition-transform"
                  >
                    {creator.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={creator.image}
                        alt={creator.name}
                        className="w-16 h-16 rounded-full brutal-border brutal-shadow object-cover"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full brutal-border brutal-shadow flex items-center justify-center shrink-0"
                        style={{ backgroundColor: creator.accentColor || "#FF90E8" }}
                      >
                        <span className="font-heading font-black text-xl text-white">
                          {creator.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm truncate max-w-[100px] group-hover:text-primary transition-colors">
                        {creator.name}
                      </p>
                      {creator.username && (
                        <p className="text-[10px] text-muted-foreground">@{creator.username}</p>
                      )}
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>{creator._count.products} products</span>
                      <span>{creator._count.followers} followers</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading font-black text-3xl md:text-4xl text-center mb-12">
            Loved by Creators
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="brutal-card p-8 bg-card">
                <p className="text-lg mb-6 leading-relaxed italic text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
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
            Join thousands of creators earning money from their skills and
            knowledge.
          </p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/signup"}
            className="brutal-btn bg-primary text-primary-foreground text-lg px-12 py-4 font-bold inline-flex items-center gap-2"
          >
            {isLoggedIn ? "Go to Dashboard" : "Start for Free"}{" "}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
