import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const popularSearches = [
  { id: 1, term: 'Handmade Ceramics', category: 'Home' },
  { id: 2, term: 'Sustainable Fashion', category: 'Fashion' },
  { id: 3, term: 'Minimalist Jewelry', category: 'Accessories' },
  { id: 4, term: 'Organic Skincare', category: 'Beauty' },
  { id: 5, term: 'Modern Lighting', category: 'Home' },
  { id: 6, term: 'Artisan Textiles', category: 'Home' },
];

export default function SearchSection() {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative py-16 bg-warm-white">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Search Input */}
          <div className="relative">
            <motion.div
              className={`relative bg-white rounded-full shadow-lg transition-all duration-300 ${
                isFocused ? 'shadow-xl ring-2 ring-sage/20' : ''
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <input
                type="text"
                placeholder="Search for products, brands, or styles..."
                className="w-full px-8 py-6 rounded-full text-lg font-inter text-charcoal placeholder:text-neutral-gray/60 focus:outline-none"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <motion.button
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-sage text-white p-4 rounded-full hover:bg-opacity-90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </motion.button>
            </motion.div>

            {/* Popular Searches */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  className="absolute top-full left-0 right-0 bg-white mt-4 rounded-2xl shadow-xl p-6 z-20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h3 className="font-montserrat text-sm font-medium text-neutral-gray mb-4">
                    Popular Searches
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {popularSearches.map((item) => (
                      <motion.button
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-warm-white text-left transition-colors group"
                        whileHover={{ x: 5 }}
                      >
                        <div className="p-2 rounded-lg bg-warm-white group-hover:bg-white transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-sage">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-charcoal mb-1">{item.term}</p>
                          <p className="text-sm text-neutral-gray">{item.category}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
