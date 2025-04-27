import React, { useState, useEffect, useRef } from 'react';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

interface PriorityContentLoaderProps {
  /**
   * Content to render with high priority (above the fold)
   */
  priorityContent: React.ReactNode;
  
  /**
   * Content to render with lower priority (below the fold)
   */
  deferredContent: React.ReactNode;
  
  /**
   * Placeholder to show while deferred content is loading
   */
  placeholder?: React.ReactNode;
  
  /**
   * Delay before loading deferred content (ms)
   */
  deferDelay?: number;
  
  /**
   * Distance from viewport to start loading deferred content (px)
   */
  threshold?: number;
  
  /**
   * Class name for the container
   */
  className?: string;
}

/**
 * Component that prioritizes loading of above-fold content
 * and progressively loads below-fold content as the user scrolls
 */
const PriorityContentLoader: React.FC<PriorityContentLoaderProps> = ({
  priorityContent,
  deferredContent,
  placeholder,
  deferDelay = 200,
  threshold = 300,
  className = ''
}) => {
  const [isDeferredLoaded, setIsDeferredLoaded] = useState(false);
  const [isDeferredVisible, setIsDeferredVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up intersection observer for deferred content
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin: `${threshold}px 0px`,
    threshold: 0.1,
    triggerOnce: true
  });
  
  // Load deferred content when it's about to enter the viewport
  useEffect(() => {
    if (isIntersecting && !isDeferredLoaded) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a timeout to load deferred content
      timeoutRef.current = setTimeout(() => {
        setIsDeferredLoaded(true);
        
        // Add a small delay before making it visible for smoother transition
        setTimeout(() => {
          setIsDeferredVisible(true);
        }, 50);
      }, deferDelay);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isIntersecting, isDeferredLoaded, deferDelay]);
  
  return (
    <div className={className}>
      {/* Priority content (above the fold) */}
      <div className="priority-content">
        {priorityContent}
      </div>
      
      {/* Deferred content (below the fold) */}
      <div 
        ref={ref}
        className="deferred-content"
        style={{
          opacity: isDeferredVisible ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      >
        {isDeferredLoaded ? deferredContent : placeholder}
      </div>
    </div>
  );
};

export default PriorityContentLoader;
