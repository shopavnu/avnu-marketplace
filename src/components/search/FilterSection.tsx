import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  expanded,
  onToggle,
  children,
}) => (
  <div className="border-b border-gray-200 pb-4">
    <button
      type="button"
      className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-900"
      onClick={onToggle}
    >
      <span>{title}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pt-4 pl-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
