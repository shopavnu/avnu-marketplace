import React from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import useCartStore from '@/stores/useCartStore';

interface CartIconProps {
  className?: string;
}

const CartIcon: React.FC<CartIconProps> = ({ className = '' }) => {
  const { getCartCount, openCart } = useCartStore();
  const itemCount = getCartCount();

  return (
    <button
      onClick={openCart}
      className={`relative p-2 transition-colors hover:text-sage ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingBagIcon className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-sage rounded-full">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
