import { Button } from '../button';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const QuantitySelector = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  disabled = false,
}: QuantitySelectorProps) => {
  return (
    <div className="flex items-center border rounded-md w-fit">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none border-r"
        onClick={onDecrease}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <div className="w-12 text-center text-sm font-medium">
        {quantity}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none border-l"
        onClick={onIncrease}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};
