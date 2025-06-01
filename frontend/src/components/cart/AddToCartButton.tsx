import React, { useState } from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import useCart from '@/hooks/useCart';
import { ProductSummary } from '@/types/cart';
import { motion } from 'framer-motion';

interface AddToCartButtonProps {
  product: ProductSummary;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'minimal';
  showQuantity?: boolean;
  onSuccess?: () => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  className = '',
  variant = 'primary',
  showQuantity = false,
  onSuccess,
}) => {
  const { addToCart, addToCartWithQuantity, isInCart, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  const alreadyInCart = isInCart(product.id);
  const currentQuantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    if (showQuantity) {
      addToCartWithQuantity(product, quantity);
    } else {
      addToCart(product);
    }
    
    // Show success animation
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  // Button variants
  const buttonStyles = {
    primary: 'bg-sage text-white hover:bg-sage-dark',
    secondary: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    outline: 'border border-sage text-sage hover:bg-sage hover:text-white',
    minimal: 'text-sage hover:text-sage-dark',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {showQuantity && (
        <div className="flex items-center mr-2 border rounded-md">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-2 py-1 text-gray-500 hover:text-gray-700"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="px-2">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-2 py-1 text-gray-500 hover:text-gray-700"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}
      
      <motion.button
        onClick={handleAddToCart}
        className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${buttonStyles[variant]}`}
        whileTap={{ scale: 0.95 }}
        disabled={added}
      >
        {added ? (
          <CheckIcon className="w-5 h-5 mr-1" />
        ) : (
          <ShoppingBagIcon className="w-5 h-5 mr-1" />
        )}
        
        <span>
          {added ? 'Added!' : alreadyInCart 
            ? `Add More (${currentQuantity} in cart)` 
            : 'Add to Cart'}
        </span>
      </motion.button>
    </div>
  );
};

export default AddToCartButton;
