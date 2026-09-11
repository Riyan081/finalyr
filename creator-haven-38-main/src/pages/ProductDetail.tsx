import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Star, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarRating from "@/components/StarRating";
import ProductCard from "@/components/ProductCard";
import { MOCK_PRODUCTS, MOCK_REVIEWS, formatPrice } from "@/data/mockData";
import { toast } from "sonner";

const CATEGORY_COLORS: Record<string, string> = {
  "Design": "bg-digi-pink",
  "Drawing & Painting": "bg-digi-peach",
  "Software Development": "bg-digi-yellow",
  "Self Improvement": "bg-digi-mint",
  "Fiction Books": "bg-digi-lavender",
  "Education": "bg-digi-yellow",
  "Comics & Graphic Novels": "bg-digi-peach",
  "Fitness & Health": "bg-digi-mint",
  "Music & Sound Design": "bg-digi-lavender",
  "Photography": "bg-digi-pink",
  "Business & Money": "bg-digi-yellow",
  "3D": "bg-digi-peach",
};

const ProductDetail = () => {
  const { id } = useParams();
  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading font-black text-4xl mb-4">Product not found</h1>
            <Link to="/discover" className="brutal-btn bg-primary text-primary-foreground inline-flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Discover
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const colorClass = CATEGORY_COLORS[product.category] || "bg-digi-pink";
  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  const handleBuy = () => {
    toast.success("Purchase successful! (Demo Mode)", {
      description: `You bought "${product.name}" for ${formatPrice(product.price, product.currency)}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/discover" className="hover:text-foreground transition-colors">Discover</Link>
          <span>/</span>
          <Link to={`/discover?category=${product.category}`} className="hover:text-foreground transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left - Image */}
          <div className="lg:col-span-3">
            <div className={`aspect-[16/10] ${colorClass} brutal-border brutal-shadow-lg flex items-center justify-center mb-6`}>
              <span className="font-heading font-black text-8xl text-foreground/20 select-none">
                {product.name.charAt(0)}
              </span>
            </div>

            {/* Description */}
            <div className="brutal-card p-8">
              <h2 className="font-heading font-bold text-xl mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {product.tags.map((tag) => (
                  <span key={tag} className="bg-muted px-3 py-1 text-xs font-semibold brutal-border">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="brutal-card p-8 mt-6">
              <h2 className="font-heading font-bold text-xl mb-6">
                Reviews ({product.reviewCount})
              </h2>
              <div className="space-y-6">
                {MOCK_REVIEWS.slice(0, 3).map((review) => (
                  <div key={review.id} className="pb-6 border-b border-muted last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={review.user.avatar} alt={review.user.name} className="w-8 h-8 rounded-full brutal-border" />
                      <div>
                        <p className="font-semibold text-sm">{review.user.name}</p>
                        <StarRating rating={review.rating} size={12} showValue={false} />
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Purchase Card */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <div className="brutal-card p-6">
                <h1 className="font-heading font-black text-2xl mb-2">{product.name}</h1>

                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={product.rating} size={16} />
                  <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <span>{product.salesCount.toLocaleString()} sales</span>
                  <span>•</span>
                  <span>{product.category}</span>
                </div>

                {/* Price */}
                <div className="bg-digi-yellow brutal-border p-4 mb-6 text-center">
                  <span className="font-heading font-black text-3xl">
                    {formatPrice(product.price, product.currency)}
                  </span>
                </div>

                <button
                  onClick={handleBuy}
                  className="w-full brutal-btn bg-primary text-primary-foreground text-lg font-bold py-4 flex items-center justify-center gap-2 mb-3"
                >
                  <ShoppingCart size={20} /> Buy Now
                </button>

                <button
                  onClick={() => toast.info("Added to wishlist!")}
                  className="w-full brutal-btn bg-card text-foreground text-sm font-semibold py-3 flex items-center justify-center gap-2"
                >
                  <Share2 size={16} /> Share
                </button>
              </div>

              {/* Creator Card */}
              <div className="brutal-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    className="w-12 h-12 rounded-full brutal-border"
                  />
                  <div>
                    <p className="font-bold">{product.seller.name}</p>
                    <p className="text-xs text-muted-foreground">Creator</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.seller.bio}</p>
                <Link
                  to={`/creator/${product.seller.id}`}
                  className="block mt-4 text-center brutal-btn bg-card text-sm font-semibold"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading font-black text-2xl mb-6">More in {product.category}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
