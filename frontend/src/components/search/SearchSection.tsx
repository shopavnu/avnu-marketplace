import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import SearchBarWithSuggestions from './SearchBarWithSuggestions';
import { useRouter } from 'next/router';

const popularSearches = [
  { id: 1, term: 'Handmade Ceramics', category: 'Home' },
  { id: 2, term: 'Sustainable Fashion', category: 'Fashion' },
  { id: 3, term: 'Minimalist Jewelry', category: 'Accessories' },
  { id: 4, term: 'Organic Skincare', category: 'Beauty' },
  { id: 5, term: 'Modern Lighting', category: 'Home' },
  { id: 6, term: 'Artisan Textiles', category: 'Home' },
];

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        const parsedSearches = JSON.parse(savedSearches);
        setRecentSearches(Array.isArray(parsedSearches) ? parsedSearches : []);
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
        setRecentSearches([]);
      }
    }
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    // Save to recent searches
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative py-16 bg-warm-white">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Search Input with Suggestions */}
          <div className="relative">
            <SearchBarWithSuggestions
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              recentSearches={recentSearches}
              placeholder="Search for products, brands, or styles..."
              className="shadow-lg hover:shadow-xl transition-all duration-300"
            />
          </div>

          {/* Search Tags */}
          <motion.div
            className="mt-6 flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {['Trending', 'New Arrivals', 'Sustainable', 'Handcrafted', 'Local Artisans', 'Eco-friendly'].map((tag) => (
              <motion.button
                key={tag}
                className="px-4 py-2 rounded-full bg-white shadow-sm text-sm font-inter text-neutral-gray hover:text-sage hover:shadow-md transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tag}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
