import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Product, formatPrice } from "@/data/mockData";

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
  "Audio": "bg-digi-lavender",
};

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const colorClass = CATEGORY_COLORS[product.category] || "bg-digi-pink";

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="brutal-card overflow-hidden group">
        {/* Cover Image */}
        <div className={`aspect-[4/3] ${colorClass} relative overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading font-bold text-primary-foreground/30 text-6xl select-none">
              {product.name.charAt(0)}
            </span>
          </div>
          {/* Price Tag */}
          <div className="absolute top-3 right-3 bg-card brutal-border px-3 py-1 font-bold text-sm">
            {formatPrice(product.price, product.currency)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              className="w-5 h-5 rounded-full brutal-border"
            />
            <span className="text-xs text-muted-foreground font-medium truncate">
              {product.seller.name}
            </span>
          </div>

          <h3 className="font-heading font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1">
            <Star size={12} className="fill-digi-yellow text-digi-yellow" />
            <span className="text-xs font-semibold">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
