"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { usePremiumFeatures } from "@/hooks/api-hooks";

const FAQS = [
  {
    q: "What can I sell on DigiStore?",
    a: "Anything digital — ebooks, courses, software, music, art, templates, memberships, and more. If you can create it digitally, you can sell it here.",
  },
  {
    q: "How do payments work?",
    a: "We handle everything: credit cards, debit cards, PayPal, and more. Funds are deposited to your bank account on a weekly schedule.",
  },
  {
    q: "What are the fees?",
    a: "10% flat fee + ₹50 per transaction. No monthly fees, no setup costs. You only pay when you earn.",
  },
  {
    q: "Can I sell from India?",
    a: "Absolutely! DigiStore supports creators in 190+ countries, including India. You can price in INR or any other currency.",
  },
  {
    q: "What about taxes?",
    a: "As Merchant of Record, we handle VAT, GST, and sales tax collection and remittance in supported regions.",
  },
  {
    q: "Can I offer refunds?",
    a: "Yes, you have full control over your refund policy. You can issue refunds directly from your dashboard.",
  },
];

const PRICING_FEATURES = [
  "Unlimited products",
  "Unlimited customers",
  "Instant payouts",
  "Custom product pages",
  "Analytics dashboard",
  "Email marketing tools",
  "Affiliate system",
  "No monthly fees",
];

import { authClient } from "@repo/auth/client";

export default function PricingPage() {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data: dynamicFeatures } = usePremiumFeatures();

  const allFeatures = dynamicFeatures && dynamicFeatures.length > 0
    ? [...new Set([...PRICING_FEATURES, ...dynamicFeatures])]
    : PRICING_FEATURES;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="bg-digi-pink text-primary-foreground brutal-border px-4 py-1 text-sm font-bold mb-6 inline-block">
            PRICING
          </span>
          <h1 className="font-heading font-black text-5xl md:text-7xl leading-[0.9] mb-6">
            Simple,{" "}
            <span className="bg-digi-yellow text-primary-foreground px-3 brutal-border brutal-shadow inline-block">
              fair
            </span>{" "}
            pricing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            No monthly fees. No hidden costs. We only make money when you do.
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="px-4 pb-20">
        <div className="max-w-lg mx-auto">
          <div className="brutal-card brutal-shadow-lg p-8 md:p-10 bg-card">
            <div className="text-center mb-8">
              <p className="font-heading font-black text-6xl mb-2">10%</p>
              <p className="text-xl text-muted-foreground">
                + ₹50 per transaction
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {allFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-digi-mint brutal-border flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-primary-foreground">
                      ✓
                    </span>
                  </div>
                  <span className="font-medium text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="w-full brutal-btn bg-primary text-primary-foreground text-lg font-bold py-4 flex items-center justify-center gap-2"
            >
              {isLoggedIn ? "Go to Dashboard" : "Start Selling Free"}{" "}
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Marketplace Fee */}
      <section className="py-16 px-4 bg-card brutal-border border-x-0">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-black text-3xl mb-4">
            DigiStore Discover
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            Products featured on our Discover marketplace have a 30% fee on
            sales that come through DigiStore&rsquo;s own traffic. Direct sales
            from your links remain at 10%.
          </p>
          <div className="inline-block bg-digi-yellow/20 brutal-border px-6 py-3">
            <span className="font-heading font-bold text-xl text-digi-yellow">
              30% Discover fee
            </span>
            <span className="text-muted-foreground ml-2">
              on marketplace sales
            </span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading font-black text-3xl md:text-4xl text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="brutal-card">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-bold pr-4">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
