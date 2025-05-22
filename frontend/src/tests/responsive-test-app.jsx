import React from 'react';
import { createRoot } from 'react-dom/client';
import ResponsiveTestPage from '../pages/ResponsiveTestPage';

// Simple CSS reset and base styles
const styles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
    color: #333;
  }
  
  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    margin-bottom: 1rem;
  }
  
  h2 {
    margin-bottom: 0.75rem;
  }
`;

// Create a style element and append it to the head
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

// Create a container for our app
const container = document.createElement('div');
container.className = 'container';
document.body.appendChild(container);

// Render our test page
const root = createRoot(container);
root.render(<ResponsiveTestPage />);

// Add device frame information
const deviceInfo = document.createElement('div');
deviceInfo.style.position = 'fixed';
deviceInfo.style.bottom = '20px';
deviceInfo.style.right = '20px';
deviceInfo.style.padding = '10px';
deviceInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
deviceInfo.style.color = 'white';
deviceInfo.style.borderRadius = '4px';
deviceInfo.style.fontSize = '14px';
deviceInfo.style.zIndex = '1000';

// Update device info on resize
const updateDeviceInfo = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  let deviceType = 'Desktop';
  let imageSize = '800x800';
  let cardHeight = '360px';
  
  if (width < 768) {
    deviceType = 'Mobile';
    imageSize = '400x400';
    cardHeight = '280px';
  } else if (width < 1024) {
    deviceType = 'Tablet';
    imageSize = '600x600';
    cardHeight = '~320px';
  }
  
  deviceInfo.innerHTML = `
    <div>Device: <strong>${deviceType}</strong></div>
    <div>Viewport: <strong>${width}px × ${height}px</strong></div>
    <div>Image Size: <strong>${imageSize}</strong></div>
    <div>Card Height: <strong>${cardHeight}</strong></div>
  `;
};

window.addEventListener('resize', updateDeviceInfo);
updateDeviceInfo(); // Initial update

document.body.appendChild(deviceInfo);

// Log test information to console
console.log('Responsive Product Card Test');
console.log('---------------------------');
console.log('This test app demonstrates the responsive behavior of product cards');
console.log('across different device sizes. Key features:');
console.log('');
console.log('1. Responsive card heights (280px on mobile, ~320px on tablet, 360px on desktop)');
console.log('2. Optimized image sizes for each device (400x400, 600x600, 800x800)');
console.log('3. Adaptive grid layout (2, 3, or 4 columns based on screen size)');
console.log('4. Text truncation based on device size');
console.log('');
console.log('Resize your browser window to see the responsive behavior in action!');
