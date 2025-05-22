import { useState, useEffect, useRef } from "react";

interface LazyImageOptions {
  src: string;
  placeholderSrc?: string;
  rootMargin?: string;
  threshold?: number;
  delay?: number;
}

interface LazyImageResult {
  isLoaded: boolean;
  isInView: boolean;
  currentSrc: string;
  ref: React.RefObject<HTMLElement>;
  onLoad: () => void;
  onError: () => void;
}

/**
 * A hook for lazy loading images when they enter the viewport
 * Uses Intersection Observer API for efficient detection
 *
 * @param options Configuration options for lazy loading
 * @returns Image loading state and ref to attach to the container
 */
export function useLazyImage({
  src,
  placeholderSrc = "",
  rootMargin = "200px 0px",
  threshold = 0.1,
  delay = 0,
}: LazyImageOptions): LazyImageResult {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
  const ref = useRef<HTMLElement>(null);

  // Set up intersection observer to detect when image enters viewport
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Element is in view
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  // Start loading the image when it comes into view
  useEffect(() => {
    if (!isInView) return;

    // Optional delay before loading the image
    const timer = setTimeout(() => {
      const img = new Image();

      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
      };

      img.onerror = () => {
        // Keep placeholder on error
        console.error(`Failed to load image: ${src}`);
      };

      img.src = src;
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [isInView, src, delay]);

  // Handlers for manual control
  const onLoad = () => {
    setIsLoaded(true);
  };

  const onError = () => {
    console.error(`Failed to load image: ${src}`);
  };

  return {
    isLoaded,
    isInView,
    currentSrc,
    ref,
    onLoad,
    onError,
  };
}

export default useLazyImage;
