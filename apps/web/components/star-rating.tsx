import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  size = 16,
  showValue = true,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? "fill-digi-yellow text-digi-yellow"
              : "text-muted-foreground/30"
          }
        />
      ))}
      {showValue && (
        <span className="text-sm font-semibold ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
