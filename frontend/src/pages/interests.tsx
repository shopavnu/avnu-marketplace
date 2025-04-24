import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Head from 'next/head';
import { primaryCategories, secondaryCategories, PrimaryCategory, SecondaryCategory } from '@/data/interests/index';

// Step types for our survey
type Step = 'primary' | 'secondary' | 'signup';

export default function InterestsPage() {
  // Debug logging
  console.log('Primary Categories:', primaryCategories);

  // State for tracking survey progress
  const [step, setStep] = useState<Step>('primary');
  const [selectedPrimaryCategories, setSelectedPrimaryCategories] = useState<string[]>([]);
  const [selectedSecondaryCategories, setSelectedSecondaryCategories] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPrimaryCategory, setCurrentPrimaryCategory] = useState<string | null>(null);

  // Handle primary category selection
  const handlePrimarySelection = (categoryId: string) => {
    if (selectedPrimaryCategories.includes(categoryId)) {
      setSelectedPrimaryCategories(selectedPrimaryCategories.filter(id => id !== categoryId));
    } else {
      setSelectedPrimaryCategories([...selectedPrimaryCategories, categoryId]);
    }
  };

  // Handle secondary category selection
  const handleSecondarySelection = (categoryId: string) => {
    if (selectedSecondaryCategories.includes(categoryId)) {
      setSelectedSecondaryCategories(selectedSecondaryCategories.filter(id => id !== categoryId));
    } else {
      setSelectedSecondaryCategories([...selectedSecondaryCategories, categoryId]);
    }
  };

  // Move to secondary categories for a specific primary category
  const showSecondaryCategories = (primaryCategoryId: string) => {
    setCurrentPrimaryCategory(primaryCategoryId);
    setStep('secondary');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to the server
    console.log({
      primaryInterests: selectedPrimaryCategories,
      secondaryInterests: selectedSecondaryCategories,
      email,
      password
    });
    
    // For demo purposes, just show an alert
    alert('Account created successfully! Your interests have been saved.');
  };

  // Get relevant secondary categories for the current primary category
  const relevantSecondaryCategories = secondaryCategories.filter(
    category => category.primaryCategoryId === currentPrimaryCategory
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <>
      <Head>
        <title>Discover Your Interests | avnu</title>
        <meta name="description" content="Tell us what you're interested in and we'll personalize your shopping experience." />
      </Head>

      <main className="min-h-screen bg-warm-white py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-charcoal mb-4"
            >
              Discover Your Interests
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Tell us what you&apos;re interested in and we&apos;ll personalize your shopping experience.
            </motion.p>
          </div>

          {/* Progress Indicator */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${step === 'primary' ? 'bg-sage' : 'bg-sage/30'}`} />
              <div className="h-0.5 w-8 bg-gray-200" />
              <div className={`h-3 w-3 rounded-full ${step === 'secondary' ? 'bg-sage' : 'bg-sage/30'}`} />
              <div className="h-0.5 w-8 bg-gray-200" />
              <div className={`h-3 w-3 rounded-full ${step === 'signup' ? 'bg-sage' : 'bg-sage/30'}`} />
            </div>
          </motion.div>

          {/* Survey Steps */}
          <AnimatePresence mode="wait">
            {/* Step 1: Primary Categories */}
            {step === 'primary' && (
              <motion.div
                key="primary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-6xl mx-auto"
              >
                <h2 className="text-2xl font-semibold text-charcoal mb-6 text-center">
                  What are you interested in?
                </h2>
                <p className="text-gray-600 mb-8 text-center">
                  Select all that apply. You can always change these later.
                </p>

                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {primaryCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 
                        ${selectedPrimaryCategories.includes(category.id) 
                          ? 'ring-4 ring-sage shadow-lg' 
                          : 'ring-1 ring-gray-200 hover:shadow-md'}`}
                      onClick={() => handlePrimarySelection(category.id)}
                    >
                      <div className="relative w-full h-48 md:h-56 overflow-hidden rounded-t-xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10" />
                        <div 
                          className="absolute inset-0 bg-cover bg-center" 
                          style={{ backgroundImage: `url(${category.image})` }}
                        />
                        <div className="absolute inset-0 flex flex-col justify-end p-4 z-20">
                          <h3 className="text-white text-xl font-semibold">{category.name}</h3>
                          <p className="text-white/80 text-sm mt-1 line-clamp-2">{category.description}</p>
                        </div>
                      </div>

                      {/* Selected indicator */}
                      {selectedPrimaryCategories.includes(category.id) && (
                        <div className="absolute top-3 right-3 bg-sage text-white rounded-full p-1 z-30">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                <div className="mt-10 flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-8 py-3 rounded-full font-medium text-white transition-colors
                      ${selectedPrimaryCategories.length > 0 
                        ? 'bg-sage hover:bg-sage/90' 
                        : 'bg-gray-300 cursor-not-allowed'}`}
                    disabled={selectedPrimaryCategories.length === 0}
                    onClick={() => {
                      if (selectedPrimaryCategories.length > 0) {
                        showSecondaryCategories(selectedPrimaryCategories[0]);
                      }
                    }}
                  >
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Secondary Categories */}
            {step === 'secondary' && currentPrimaryCategory && (
              <motion.div
                key="secondary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-6xl mx-auto"
              >
                <h2 className="text-2xl font-semibold text-charcoal mb-6 text-center">
                  {primaryCategories.find(c => c.id === currentPrimaryCategory)?.name} - Select Specific Interests
                </h2>
                <p className="text-gray-600 mb-8 text-center">
                  Choose the specific areas that interest you most.
                </p>

                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {relevantSecondaryCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 
                        ${selectedSecondaryCategories.includes(category.id) 
                          ? 'ring-4 ring-sage shadow-lg' 
                          : 'ring-1 ring-gray-200 hover:shadow-md'}`}
                      onClick={() => handleSecondarySelection(category.id)}
                    >
                      <div className="relative w-full h-48 md:h-56 overflow-hidden rounded-t-xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10" />
                        <div 
                          className="absolute inset-0 bg-cover bg-center" 
                          style={{ backgroundImage: `url(${category.image})` }}
                        />
                        <div className="absolute inset-0 flex flex-col justify-end p-4 z-20">
                          <h3 className="text-white text-xl font-semibold">{category.name}</h3>
                          <p className="text-white/80 text-sm mt-1 line-clamp-2">{category.description}</p>
                        </div>
                      </div>

                      {/* Selected indicator */}
                      {selectedSecondaryCategories.includes(category.id) && (
                        <div className="absolute top-3 right-3 bg-sage text-white rounded-full p-1 z-30">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                <div className="mt-10 flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-full font-medium text-gray-600 border border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      // Go back to primary categories
                      setStep('primary');
                    }}
                  >
                    Back
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-full font-medium text-white bg-sage hover:bg-sage/90"
                    onClick={() => {
                      // Check if there are more primary categories to explore
                      const currentIndex = selectedPrimaryCategories.indexOf(currentPrimaryCategory);
                      if (currentIndex < selectedPrimaryCategories.length - 1) {
                        // Show next primary category's secondary categories
                        showSecondaryCategories(selectedPrimaryCategories[currentIndex + 1]);
                      } else {
                        // Move to signup step
                        setStep('signup');
                      }
                    }}
                  >
                    {selectedPrimaryCategories.indexOf(currentPrimaryCategory) < selectedPrimaryCategories.length - 1
                      ? 'Next Category'
                      : 'Continue to Signup'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Signup */}
            {step === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md mx-auto"
              >
                <h2 className="text-2xl font-semibold text-charcoal mb-6 text-center">
                  Create Your Account
                </h2>
                <p className="text-gray-600 mb-8 text-center">
                  Save your preferences and get personalized recommendations.
                </p>

                <motion.form 
                  onSubmit={handleSubmit}
                  className="bg-white rounded-xl shadow-md p-6 md:p-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div className="mb-4" variants={itemVariants}>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </motion.div>

                  <motion.div className="mb-6" variants={itemVariants}>
                    <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
                      placeholder="Create a password"
                      required
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3 rounded-lg font-medium text-white bg-sage hover:bg-sage/90 transition-colors"
                    >
                      Create Account
                    </motion.button>
                  </motion.div>
                </motion.form>

                <div className="mt-6 flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 rounded-full font-medium text-gray-600 hover:text-gray-800"
                    onClick={() => {
                      // Go back to the last primary category's secondary categories
                      if (selectedPrimaryCategories.length > 0) {
                        showSecondaryCategories(selectedPrimaryCategories[selectedPrimaryCategories.length - 1]);
                      }
                    }}
                  >
                    Back
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
