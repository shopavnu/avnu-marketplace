import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      className={`relative px-4 py-2 text-base font-medium transition-colors duration-200
                ${isActive ? 'text-sage' : 'text-charcoal hover:text-sage'}`}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
};

export default function Navigation() {
  return (
    <nav className="hidden md:flex items-center space-x-1">
      <NavLink href="/">Home</NavLink>
      <NavLink href="/shop">Shop</NavLink>
      <NavLink href="/brands">Brands</NavLink>
      <NavLink href="/about">About</NavLink>
    </nav>
  );
}
