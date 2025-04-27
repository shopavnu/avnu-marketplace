import React, { useEffect, useRef } from 'react';

interface CardDebuggerProps {
  productId: string;
  title: string;
}

const CardDebugger: React.FC<CardDebuggerProps> = ({ productId, title }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (cardRef.current) {
      const height = cardRef.current.offsetHeight;
      console.log(`Product Card "${title}" (ID: ${productId}) - Height: ${height}px`);
      
      // Add a colored border to help visualize the card boundaries
      cardRef.current.style.border = '2px solid red';
      
      // Log all parent elements and their heights
      let parent = cardRef.current.parentElement;
      let depth = 1;
      while (parent) {
        console.log(`Parent ${depth} of "${title}" - Height: ${parent.offsetHeight}px, Class: ${parent.className}`);
        parent.style.border = `2px solid ${depth % 2 === 0 ? 'blue' : 'green'}`;
        parent = parent.parentElement;
        depth++;
      }
    }
  }, [productId, title]);
  
  return <div ref={cardRef} className="card-debugger" />;
};

export default CardDebugger;
