import React from 'react';
import { render } from '@testing-library/react';
import ProductCardSkeleton from '../ProductCardSkeleton';

describe('ProductCardSkeleton Component', () => {
  // Mock window.innerWidth to test different device sizes
  const mockWindowSize = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    });
    window.dispatchEvent(new Event('resize'));
  };

  it('renders with correct dimensions for desktop', () => {
    mockWindowSize(1200); // Desktop size
    
    const { container } = render(<ProductCardSkeleton />);
    const skeleton = container.querySelector('.product-card-skeleton');
    
    expect(skeleton).toBeInTheDocument();
    expect(window.getComputedStyle(skeleton!).height).toBe('360px');
  });

  it('renders with correct dimensions for tablet', () => {
    mockWindowSize(800); // Tablet size
    
    const { container } = render(<ProductCardSkeleton />);
    const skeleton = container.querySelector('.product-card-skeleton');
    
    expect(skeleton).toBeInTheDocument();
    expect(window.getComputedStyle(skeleton!).height).toBe('320px');
  });

  it('renders with correct dimensions for mobile', () => {
    mockWindowSize(480); // Mobile size
    
    const { container } = render(<ProductCardSkeleton />);
    const skeleton = container.querySelector('.product-card-skeleton');
    
    expect(skeleton).toBeInTheDocument();
    expect(window.getComputedStyle(skeleton!).height).toBe('280px');
  });

  it('has the correct structure with image and content sections', () => {
    const { container } = render(<ProductCardSkeleton />);
    
    const imageSkeleton = container.querySelector('.skeleton-image');
    const brandSkeleton = container.querySelector('.skeleton-brand');
    const titleSkeleton = container.querySelector('.skeleton-title');
    const descriptionSkeleton = container.querySelector('.skeleton-description');
    const priceSkeleton = container.querySelector('.skeleton-price');
    
    expect(imageSkeleton).toBeInTheDocument();
    expect(brandSkeleton).toBeInTheDocument();
    expect(titleSkeleton).toBeInTheDocument();
    expect(descriptionSkeleton).toBeInTheDocument();
    expect(priceSkeleton).toBeInTheDocument();
  });
});
