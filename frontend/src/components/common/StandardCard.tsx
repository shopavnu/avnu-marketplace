import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface StandardCardProps {
  id: string;
  title: string;
  image: string;
  linkPath: string;
  badges?: React.ReactNode;
  content?: React.ReactNode;
}

const StandardCard: React.FC<StandardCardProps> = ({
  id,
  title,
  image,
  linkPath,
  badges,
  content
}) => {
  return (
    <motion.div
      className="h-[400px] group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link 
        href={linkPath} 
        className="block h-full flex flex-col"
      >
        <div className="relative w-full h-[240px] overflow-hidden flex-shrink-0">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Badges */}
          {badges && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {badges}
            </div>
          )}
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-montserrat font-medium text-charcoal text-sm sm:text-base mb-2 line-clamp-2">
            {title}
          </h3>
          
          {content}
        </div>
      </Link>
    </motion.div>
  );
};

export default StandardCard;
