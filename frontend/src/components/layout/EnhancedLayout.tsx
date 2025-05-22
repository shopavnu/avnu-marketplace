import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "./Header";
import { StickySearchBar } from "@/components/search";
import { ScrollProgressBar } from "@/components/common";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedLayoutProps {
  children: React.ReactNode;
}

export default function EnhancedLayout({ children }: EnhancedLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Handle route change loading states
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  // Handle search
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Scroll Progress Indicator */}
      <ScrollProgressBar color="bg-sage" height={3} position="top" />

      {/* Header */}
      <Header />

      {/* Sticky Search Bar */}
      <StickySearchBar onSearch={handleSearch} />

      {/* Page Transition */}
      <AnimatePresence mode="wait">
        <motion.main
          key={router.asPath}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Page Loading Indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="fixed inset-0 bg-warm-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-sage/20 border-t-sage rounded-full animate-spin"></div>
                  <p className="mt-4 text-sage font-medium">Loading...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {children}
        </motion.main>
      </AnimatePresence>

      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
}

// Back to Top Button Component
const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className="fixed bottom-8 right-8 p-3 bg-sage text-white rounded-full shadow-lg z-40"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
