import { motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <>
      <Head>
        <title>About Us | av | nu - Curated Independent Brands</title>
        <meta name="description" content="Learn about av | nu's mission to connect curious shoppers with independent brands." />
      </Head>

      <main className="min-h-screen bg-warm-white">
        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&q=80&w=1500"
              alt="Young artisans collaborating"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>
          <div className="relative h-full flex flex-col justify-end">
            <div className="container mx-auto px-4 pb-16 md:pb-24">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-3xl"
              >
                Our Story
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-white/90 max-w-2xl"
              >
                Connecting curious shoppers with independent brands
              </motion.p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                <motion.div variants={fadeIn} className="prose prose-lg">
                  <p className="text-xl leading-relaxed text-gray-800">
                    At <span className="font-semibold">av | nu</span>, we believe shopping should feel less like scrolling and more like discovery. We built this marketplace to connect curious, thoughtful shoppers with fresh, independent brands—giving creators a platform to showcase their passion, creativity, and originality.
                  </p>
                </motion.div>

                <motion.div variants={fadeIn}>
                  <p className="text-lg leading-relaxed text-gray-700 mb-8">
                    The big marketplaces are crowded and overwhelming, making it tough for authentic brands to stand out and even tougher for customers to find products they&apos;ll truly love. We&apos;re changing that.
                  </p>
                </motion.div>

                <motion.div variants={fadeIn}>
                  <p className="text-lg leading-relaxed text-gray-700">
                    Every brand featured on <span className="font-semibold">av | nu</span> is handpicked, thoughtfully curated, and genuinely independent—so every purchase you make supports real people, not faceless corporations or endless resellers. Whether you&apos;re a shopper looking for something unique, or a creator eager to share your craft, we&apos;re here to make the experience simple, meaningful, and fun.
                  </p>
                </motion.div>

                <motion.div 
                  variants={fadeIn}
                  className="text-center pt-8"
                >
                  <p className="text-2xl font-medium text-charcoal">
                    Welcome to <span className="font-bold">av | nu</span>
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gradient-to-b from-warm-white to-sage/5">
          <div className="container mx-auto px-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-center text-charcoal mb-16"
            >
              Our Values
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Authenticity",
                  description: "We celebrate genuine craftsmanship and the stories behind each product.",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )
                },
                {
                  title: "Community",
                  description: "We're building connections between creators and the people who appreciate their work.",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )
                },
                {
                  title: "Sustainability",
                  description: "We prioritize brands that care about their environmental and social impact.",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                }
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-charcoal mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-center text-charcoal mb-6"
            >
              Meet Our Team
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center text-gray-600 max-w-2xl mx-auto mb-16"
            >
              The passionate people behind av | nu, dedicated to connecting independent brands with curious shoppers.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: "Alex Rivera",
                  role: "Founder & CEO",
                  image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&q=80&w=400"
                },
                {
                  name: "Jordan Chen",
                  role: "Head of Curation",
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&q=80&w=400"
                },
                {
                  name: "Taylor Morgan",
                  role: "Brand Relations",
                  image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&q=80&w=400"
                }
              ].map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="relative w-48 h-48 mx-auto mb-4 overflow-hidden rounded-full">
                    <Image 
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-sage/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-charcoal mb-6"
              >
                Join Our Community
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg text-gray-700 mb-8"
              >
                Whether you&apos;re a shopper or a brand, we&apos;d love to have you as part of the av | nu family.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/interests" className="px-8 py-3 bg-sage text-white rounded-full font-medium hover:bg-sage/90 transition-colors">
                  Discover Your Interests
                </Link>
                <Link href="/contact" className="px-8 py-3 border border-sage text-sage rounded-full font-medium hover:bg-sage/10 transition-colors">
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
