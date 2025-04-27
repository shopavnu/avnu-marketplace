import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Product } from '../types/product';

// Import components with SSR disabled to avoid window is not defined error
const ResponsiveProductGrid = dynamic(
  () => import('../components/product/ResponsiveProductGrid').then(mod => mod.default),
  { ssr: false }
);

// Sample products with responsive images
const sampleProducts: Product[] = [
  {
    id: 'product-1',
    title: 'Modern Minimalist Chair',
    description: 'Ergonomic design with premium materials for maximum comfort. Perfect for home office or living room.',
    price: 149.99,
    compareAtPrice: 199.99,
    images: ['https://via.placeholder.com/800x800?text=Chair+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Chair+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Chair+Tablet'],
    categories: ['Furniture', 'Chairs'],
    merchantId: 'merchant-1',
    brandName: 'Modern Living',
    externalId: 'ext-1',
    externalSource: 'manual',
    slug: 'modern-minimalist-chair',
    isOnSale: true,
    discountPercentage: 25
  },
  {
    id: 'product-2',
    title: 'Handcrafted Ceramic Mug Set',
    description: 'Set of 4 handcrafted ceramic mugs. Each piece is unique with subtle variations in glaze and texture.',
    price: 39.99,
    images: ['https://via.placeholder.com/800x800?text=Mugs+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Mugs+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Mugs+Tablet'],
    categories: ['Kitchen', 'Tableware'],
    merchantId: 'merchant-2',
    brandName: 'Artisan Crafts',
    externalId: 'ext-2',
    externalSource: 'manual',
    slug: 'handcrafted-ceramic-mug-set',
    featured: true
  },
  {
    id: 'product-3',
    title: 'Smart Home Security Camera',
    description: 'HD wireless security camera with motion detection, night vision, and two-way audio. Easy to install and connects to your smartphone.',
    price: 79.99,
    compareAtPrice: 99.99,
    images: ['https://via.placeholder.com/800x800?text=Camera+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Camera+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Camera+Tablet'],
    categories: ['Electronics', 'Smart Home'],
    merchantId: 'merchant-3',
    brandName: 'TechSmart',
    externalId: 'ext-3',
    externalSource: 'manual',
    slug: 'smart-home-security-camera',
    isOnSale: true,
    discountPercentage: 20
  },
  {
    id: 'product-4',
    title: 'Organic Cotton Throw Blanket',
    description: 'Soft, cozy throw blanket made from 100% organic cotton. Perfect for snuggling on the couch or adding warmth to your bed.',
    price: 59.99,
    images: ['https://via.placeholder.com/800x800?text=Blanket+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Blanket+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Blanket+Tablet'],
    categories: ['Home Decor', 'Bedding'],
    merchantId: 'merchant-4',
    brandName: 'Eco Home',
    externalId: 'ext-4',
    externalSource: 'manual',
    slug: 'organic-cotton-throw-blanket'
  },
  {
    id: 'product-5',
    title: 'Stainless Steel Water Bottle',
    description: 'Double-walled insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours. Leak-proof and eco-friendly.',
    price: 29.99,
    compareAtPrice: 34.99,
    images: ['https://via.placeholder.com/800x800?text=Bottle+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Bottle+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Bottle+Tablet'],
    categories: ['Kitchen', 'Drinkware'],
    merchantId: 'merchant-5',
    brandName: 'EcoVessel',
    externalId: 'ext-5',
    externalSource: 'manual',
    slug: 'stainless-steel-water-bottle',
    isOnSale: true,
    discountPercentage: 14
  },
  {
    id: 'product-6',
    title: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life. Comfortable over-ear design with memory foam ear cushions.',
    price: 199.99,
    images: ['https://via.placeholder.com/800x800?text=Headphones+Desktop'],
    mobileImages: ['https://via.placeholder.com/400x400?text=Headphones+Mobile'],
    tabletImages: ['https://via.placeholder.com/600x600?text=Headphones+Tablet'],
    categories: ['Electronics', 'Audio'],
    merchantId: 'merchant-6',
    brandName: 'SoundPro',
    externalId: 'ext-6',
    externalSource: 'manual',
    slug: 'wireless-bluetooth-headphones',
    featured: true
  }
];

const ResponsiveTestPage: React.FC = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  
  // Update device type and viewport width on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Simulate different device sizes
  const simulateDevice = (type: 'mobile' | 'tablet' | 'desktop') => {
    let width: number;
    
    switch (type) {
      case 'mobile':
        width = 375; // iPhone size
        break;
      case 'tablet':
        width = 768; // iPad size
        break;
      default:
        width = 1280; // Desktop size
        break;
    }
    
    // This is just for demonstration - in a real app, we'd use CSS media queries
    document.getElementById('device-simulator')!.style.width = `${width}px`;
    setDeviceType(type);
  };
  
  return (
    <div className="responsive-test-page" style={{ padding: '20px' }}>
      <h1>Responsive Product Card Test</h1>
      
      <div className="device-controls" style={{ marginBottom: '20px' }}>
        <h2>Test on Different Devices</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={() => simulateDevice('mobile')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: deviceType === 'mobile' ? '#4caf50' : '#e0e0e0',
              color: deviceType === 'mobile' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Mobile (375px)
          </button>
          <button 
            onClick={() => simulateDevice('tablet')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: deviceType === 'tablet' ? '#4caf50' : '#e0e0e0',
              color: deviceType === 'tablet' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tablet (768px)
          </button>
          <button 
            onClick={() => simulateDevice('desktop')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: deviceType === 'desktop' ? '#4caf50' : '#e0e0e0',
              color: deviceType === 'desktop' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Desktop (1280px)
          </button>
        </div>
        
        <div>
          <p>Current device: <strong>{deviceType}</strong></p>
          <p>Viewport width: <strong>{viewportWidth}px</strong></p>
          <p>Card height: <strong>{deviceType === 'mobile' ? '280px' : deviceType === 'tablet' ? '~320px' : '360px'}</strong></p>
          <p>Image size: <strong>{deviceType === 'mobile' ? '400x400' : deviceType === 'tablet' ? '600x600' : '800x800'}</strong></p>
        </div>
      </div>
      
      <div 
        id="device-simulator" 
        style={{ 
          width: '100%', 
          maxWidth: '1280px', 
          margin: '0 auto', 
          border: '2px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          transition: 'width 0.3s ease'
        }}
      >
        <ResponsiveProductGrid 
          products={sampleProducts} 
          title="Responsive Product Grid"
        />
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <h2>Key Features</h2>
        <ul>
          <li><strong>Mobile (375px):</strong> 280px card height, 400x400 images, 2 columns</li>
          <li><strong>Tablet (768px):</strong> ~320px card height, 600x600 images, 3 columns</li>
          <li><strong>Desktop (1280px):</strong> 360px card height, 800x800 images, 4 columns</li>
          <li>Responsive text truncation based on device size</li>
          <li>Consistent card heights with no layout shifts</li>
          <li>Optimized image loading for each device size</li>
        </ul>
      </div>
    </div>
  );
};

export default ResponsiveTestPage;
