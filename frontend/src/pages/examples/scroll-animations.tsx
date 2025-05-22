import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  ScrollSection,
  ScrollItem,
  ScrollProgressBar,
} from "@/components/common";
import { products } from "@/data/products";
import MasonryProductCard from "@/components/products/MasonryProductCard";

export default function ScrollAnimationsExample() {
  return (
    <div className="min-h-screen bg-warm-white">
      <Head>
        <title>Scroll Animations | Avnu Marketplace</title>
        <meta
          name="description"
          content="Demonstration of scroll-based animations and interactions"
        />
      </Head>

      {/* Scroll Progress Indicator */}
      <ScrollProgressBar color="bg-sage" height={3} position="top" />

      {/* Hero Section */}
      <section className="h-[80vh] flex items-center justify-center bg-sage/10 relative overflow-hidden">
        <motion.div
          className="text-center z-10 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl font-montserrat font-medium text-charcoal mb-4">
            Scroll Animations
          </h1>
          <p className="text-lg md:text-xl text-neutral-gray max-w-2xl mx-auto">
            Explore how scroll-based animations enhance the vertical discovery
            experience
          </p>
          <motion.div
            className="mt-8 animate-bounce"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mx-auto text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-sage/10"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </section>

      {/* Fade In Section */}
      <ScrollSection
        fadeIn={true}
        slideUp={true}
        bgColor="bg-white"
        className="py-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-montserrat font-medium text-charcoal mb-4">
            Fade In & Slide Up
          </h2>
          <p className="text-neutral-gray max-w-2xl mx-auto">
            Elements fade in and slide up as they enter the viewport
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <ScrollItem key={item} delay={item * 0.1}>
              <div className="bg-sage/5 p-8 rounded-xl">
                <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-sage font-medium">{item}</span>
                </div>
                <h3 className="text-xl font-montserrat font-medium text-charcoal mb-2">
                  Feature {item}
                </h3>
                <p className="text-neutral-gray">
                  This element fades in and slides up when it enters the
                  viewport. The animation is staggered based on the item's
                  position.
                </p>
              </div>
            </ScrollItem>
          ))}
        </div>
      </ScrollSection>

      {/* Parallax Section */}
      <ScrollSection bgColor="bg-sage/10" className="py-20 overflow-hidden">
        <div className="relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-montserrat font-medium text-charcoal mb-4">
              Parallax Effect
            </h2>
            <p className="text-neutral-gray max-w-2xl mx-auto">
              Elements move at different speeds as you scroll
            </p>
          </div>

          <div className="relative h-[60vh] overflow-hidden">
            {[1, 2, 3, 4, 5].map((layer) => (
              <motion.div
                key={layer}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  zIndex: 6 - layer,
                }}
                initial={{ y: 0 }}
                whileInView={{
                  y: layer * 20,
                  transition: { duration: 0.8, ease: "easeOut" },
                }}
                viewport={{ once: false, margin: "-100px" }}
              >
                <div
                  className="w-40 h-40 rounded-full bg-white/80 flex items-center justify-center"
                  style={{
                    transform: `scale(${1 + layer * 0.5})`,
                    opacity: 1 - layer * 0.15,
                  }}
                >
                  <span className="text-sage font-montserrat font-medium text-2xl">
                    Layer {layer}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* Masonry Grid with Scroll Reveal */}
      <ScrollSection bgColor="bg-white" className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-montserrat font-medium text-charcoal mb-4">
            Masonry Grid with Scroll Reveal
          </h2>
          <p className="text-neutral-gray max-w-2xl mx-auto">
            Products appear as you scroll down the page
          </p>
        </div>

        <div className="masonry-grid">
          <style jsx>{`
            .masonry-grid {
              column-count: 1;
              column-gap: 1.5rem;
            }
            @media (min-width: 640px) {
              .masonry-grid {
                column-count: 2;
              }
            }
            @media (min-width: 768px) {
              .masonry-grid {
                column-count: 3;
              }
            }
          `}</style>

          {products.slice(0, 6).map((product, index) => (
            <ScrollItem
              key={product.id}
              delay={index * 0.1}
              className="break-inside-avoid mb-6"
            >
              <MasonryProductCard
                product={product}
                size={
                  index % 3 === 0
                    ? "large"
                    : index % 3 === 1
                      ? "medium"
                      : "small"
                }
                showDescription={index % 3 === 0}
              />
            </ScrollItem>
          ))}
        </div>
      </ScrollSection>

      {/* Conclusion Section */}
      <ScrollSection bgColor="bg-sage/5" className="py-20">
        <div className="text-center">
          <h2 className="text-3xl font-montserrat font-medium text-charcoal mb-4">
            Ready to Implement
          </h2>
          <p className="text-neutral-gray max-w-2xl mx-auto mb-8">
            These scroll-based animations are ready to be integrated into the
            Avnu Marketplace homepage
          </p>
          <ScrollItem>
            <motion.a
              href="/"
              className="inline-block px-8 py-3 bg-sage text-white rounded-full font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return to Homepage
            </motion.a>
          </ScrollItem>
        </div>
      </ScrollSection>
    </div>
  );
}
