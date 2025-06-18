import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Cog6ToothIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import ClientOnly from "@/components/common/ClientOnly";
import CartDropdown from "@/components/cart/CartDropdown";

// Client-side only navigation component
const Navigation = dynamic(
  () => import("@/components/layout/Navigation").then((mod) => mod.default),
  { ssr: false },
);

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-warm-white/80 backdrop-blur-lg border-b border-neutral-gray/10 safe-top">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <ClientOnly>
            <Link
              href="/"
              className="text-2xl font-montserrat font-bold text-charcoal"
            >
              av | nu
            </Link>
          </ClientOnly>

          {/* Navigation */}
          <Navigation />

          {/* Right Actions */}
          <ClientOnly>
            <div className="flex items-center gap-2">
              <Link
                href="/favorites"
                className="p-2 text-charcoal hover:text-sage transition-colors duration-200"
              >
                <HeartIcon className="w-6 h-6" />
              </Link>

              <div className="relative">
                <button
                  className="p-2 text-charcoal hover:text-sage transition-colors duration-200"
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  aria-label="Open shopping cart"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  {/* Cart Item Count Badge */}
                  <span className="absolute -top-1 -right-1 bg-sage text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    2
                  </span>
                </button>
                <CartDropdown
                  isOpen={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                />
              </div>

              {/* Direct Admin Dashboard Link */}
              <Link
                href="/admin/analytics"
                className="p-2 text-charcoal hover:text-sage transition-colors duration-200"
                aria-label="Admin Dashboard"
              >
                <div className="w-6 h-6 rounded-full bg-sage/10 flex items-center justify-center">
                  <Cog6ToothIcon className="w-4 h-4 text-sage" />
                </div>
              </Link>

              {/* Clerk Authentication Components */}
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="p-2 text-charcoal hover:text-sage transition-colors duration-200">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="p-2 text-charcoal hover:text-sage transition-colors duration-200">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-6 h-6"
                    }
                  }}
                />
              </SignedIn>

              {/* Mobile Menu Button - Visible only on mobile */}
              <button
                  className="p-2 text-charcoal hover:text-sage transition-colors duration-200 md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
          </ClientOnly>
        </div>
      </div>
    {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      {isMobileMenuOpen && (
        <nav className="md:hidden fixed top-16 inset-x-0 z-50 bg-warm-white border-b border-neutral-gray/10 flex flex-col space-y-2 px-4 py-4 shadow-lg">
          <Link href="/" className="py-2 text-charcoal hover:text-sage" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/shop" className="py-2 text-charcoal hover:text-sage" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
          <Link href="/brand" className="py-2 text-charcoal hover:text-sage" onClick={() => setIsMobileMenuOpen(false)}>Brands</Link>
          <Link href="/interests" className="py-2 text-charcoal hover:text-sage" onClick={() => setIsMobileMenuOpen(false)}>Interests</Link>
          <Link href="/FreshRecommendations" className="py-2 text-charcoal hover:text-sage" onClick={() => setIsMobileMenuOpen(false)}>Discover</Link>
          <Link href="/about" className="py-2 text-charcoal hover:text-sage" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
        </nav>
      )}
    </header>
  );
}
