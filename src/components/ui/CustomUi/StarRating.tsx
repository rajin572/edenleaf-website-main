import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  reviewsCount?: number;
}

export const StarRating = ({
  rating,
  maxStars = 5,
  size = 'md',
  className,
  showText = false,
  reviewsCount,
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const starSize = sizeClasses[size];
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[...Array(maxStars)].map((_, i) => {
          const isFilled = i + 1 <= rating;
          const isHalf = i < rating && i + 1 > rating;
          
          if (isHalf) {
            return (
              <div key={i} className="relative">
                <Star className={cn(starSize, "text-muted-foreground/30")} />
                <StarHalf className={cn(starSize, "absolute top-0 left-0 text-yellow-400 fill-yellow-400")} />
              </div>
            );
          }
          
          return (
            <Star 
              key={i} 
              className={cn(
                starSize,
                isFilled ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
              )} 
            />
          );
        })}
      </div>
      
      {showText && (
        <span className="text-sm font-medium ml-1">
          {rating.toFixed(1)} 
          {reviewsCount !== undefined && <span className="text-muted-foreground font-normal ml-1">({reviewsCount})</span>}
        </span>
      )}
    </div>
  );
};
