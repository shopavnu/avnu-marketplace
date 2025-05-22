import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const NotFound: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Head>
        <title>Page Not Found | Avnu Marketplace</title>
      </Head>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
      >
        <motion.h1 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-6xl font-bold text-charcoal mb-2"
        >
          404
        </motion.h1>
        <h2 className="text-2xl font-semibold text-charcoal mb-4">Page Not Found</h2>
        <p className="text-lg text-neutral-gray mb-6">
          We couldn't find the page you were looking for. It might have been moved or doesn't exist.
        </p>
        <Link 
          href="/" 
          className="inline-block px-6 py-3 bg-sage text-white font-medium rounded-lg transition-colors duration-200 hover:bg-sage/90"
        >
          Return to Homepage
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
