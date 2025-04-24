import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, Cog6ToothIcon, HeartIcon, ShoppingBagIcon, ArrowRightOnRectangleIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import ClientOnly from '@/components/common/ClientOnly';
import CartDropdown from '@/components/cart/CartDropdown';

// Client-side only navigation component
const Navigation = dynamic(
  () => import('@/components/layout/Navigation').then(mod => mod.default),
  { ssr: false }
);

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);
  return (
    <header className="sticky top-0 z-50 bg-warm-white/80 backdrop-blur-lg border-b border-neutral-gray/10 safe-top">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <ClientOnly>
            <Link href="/" className="text-2xl font-montserrat font-bold text-charcoal">
              av | nu
            </Link>
          </ClientOnly>

          {/* Navigation */}
          <Navigation />

          {/* Right Actions */}
          <ClientOnly>
            <div className="flex items-center gap-2">
              <Link href="/favorites" className="p-2 text-charcoal hover:text-sage transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </Link>
              <div className="relative">
                <button 
                  className="p-2 text-charcoal hover:text-sage transition-colors duration-200"
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  aria-label="Open shopping cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  {/* Cart Item Count Badge */}
                  <span className="absolute -top-1 -right-1 bg-sage text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    2
                  </span>
                </button>
                <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
              </div>
              
              {/* User Profile Icon & Dropdown */}
              <div className="relative" ref={profileRef}>
                <button 
                  className="p-2 text-charcoal hover:text-sage transition-colors duration-200"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-label="Open user menu"
                >
                  <div className="w-6 h-6 rounded-full bg-sage/10 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-sage" />
                  </div>
                </button>
                
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center mr-3">
                            <UserIcon className="w-6 h-6 text-sage" />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal">Guest User</p>
                            <p className="text-xs text-gray-500">Sign in to your account</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link 
                          href="/account" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <UserIcon className="w-5 h-5 mr-3 text-gray-500" />
                          My Account
                        </Link>
                        <Link 
                          href="/favorites" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <HeartIcon className="w-5 h-5 mr-3 text-gray-500" />
                          My Favorites
                        </Link>
                        <Link 
                          href="/orders" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <ShoppingBagIcon className="w-5 h-5 mr-3 text-gray-500" />
                          My Orders
                        </Link>
                        <Link 
                          href="/settings" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-500" />
                          Settings
                        </Link>
                      </div>
                      
                      <div className="py-2 border-t border-gray-100">
                        <Link 
                          href="/login" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-gray-500" />
                          Sign In
                        </Link>
                        <Link 
                          href="/merchant/login" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <BuildingStorefrontIcon className="w-5 h-5 mr-3 text-gray-500" />
                          Merchant Portal
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button className="p-2 text-charcoal hover:text-sage transition-colors duration-200 md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </ClientOnly>
        </div>
      </div>
    </header>
  );
}
