import React from 'react';

interface FilterButtonProps {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, children }) => (
  <button
    type="button"
    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
      active
        ? 'bg-sage text-white'
        : 'bg-sage/10 text-sage hover:bg-sage/20'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);
