import React from 'react';
import useCart from '@/hooks/useCart';
import { mockProducts } from '@/utils/mockData';

const CartTester: React.FC = () => {
  const { addToCart, clearCart, items } = useCart();

  const handleAddAllProducts = () => {
    mockProducts.forEach(product => {
      addToCart(product);
    });
  };

  const handleAddRandomProduct = () => {
    const randomIndex = Math.floor(Math.random() * mockProducts.length);
    addToCart(mockProducts[randomIndex]);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4">🧪 Cart Testing Tools</h2>
      
      <div className="flex flex-wrap gap-3 mb-4">
        <button 
          onClick={handleAddRandomProduct} 
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Add Random Product
        </button>
        
        <button 
          onClick={handleAddAllProducts} 
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Add All Test Products
        </button>
        
        <button 
          onClick={clearCart} 
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Clear Cart
        </button>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>Cart has {items.length} item(s)</p>
        <p className="mt-2">Note: This component is for testing purposes only.</p>
      </div>
    </div>
  );
};

export default CartTester;
