import React, { useEffect } from 'react';

/**
 * DOMInspector component that adds a script to the page to inspect and diagnose DOM issues
 */
const DOMInspector: React.FC = () => {
  useEffect(() => {
    // This script will run once the component is mounted
    const script = document.createElement('script');
    script.innerHTML = `
      // Wait for the page to fully load
      window.addEventListener('load', function() {
        setTimeout(function() {
          console.log('DOM Inspector running...');
          
          // Find all product cards on the page
          const productCards = document.querySelectorAll('.grid > div > div');
          
          if (productCards.length === 0) {
            console.log('No product cards found on the page');
            return;
          }
          
          console.log('Found ' + productCards.length + ' potential product cards');
          
          // Analyze each card's height
          const heights = {};
          productCards.forEach((card, index) => {
            const height = card.getBoundingClientRect().height;
            const title = card.querySelector('h3')?.textContent || 'Unknown product';
            const truncatedTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
            
            console.log(\`Card \${index}: "\${truncatedTitle}" - Height: \${height}px\`);
            
            // Add to heights object for analysis
            if (!heights[height]) {
              heights[height] = [];
            }
            heights[height].push({ index, title: truncatedTitle });
            
            // Add a colored border to visualize the card's dimensions
            const hasDescription = card.textContent.includes('Ceramic Vase') || 
                                  card.textContent.includes('Pillowcase') || 
                                  card.textContent.includes('Serving Board');
            
            card.style.border = hasDescription ? '3px solid red' : '3px solid green';
            
            // Add height label
            const label = document.createElement('div');
            label.style.position = 'absolute';
            label.style.top = '0';
            label.style.right = '0';
            label.style.background = 'black';
            label.style.color = 'white';
            label.style.padding = '2px 5px';
            label.style.fontSize = '10px';
            label.style.zIndex = '1000';
            label.textContent = Math.round(height) + 'px';
            
            // Make sure the card has position relative for absolute positioning
            if (window.getComputedStyle(card).position === 'static') {
              card.style.position = 'relative';
            }
            
            card.appendChild(label);
          });
          
          // Analyze the heights
          console.log('Height analysis:');
          Object.keys(heights).sort((a, b) => a - b).forEach(height => {
            console.log(\`Height \${height}px: \${heights[height].length} cards\`);
            heights[height].forEach(card => {
              console.log(\`  - Card \${card.index}: "\${card.title}"\`);
            });
          });
          
          // Check parent elements for any that might be affecting height
          const problematicCards = Array.from(productCards).filter(card => 
            card.textContent.includes('Ceramic Vase') || 
            card.textContent.includes('Pillowcase') || 
            card.textContent.includes('Serving Board')
          );
          
          if (problematicCards.length > 0) {
            console.log('Analyzing parent elements of problematic cards:');
            
            problematicCards.forEach(card => {
              let parent = card.parentElement;
              let depth = 1;
              
              while (parent && depth <= 5) {
                const style = window.getComputedStyle(parent);
                console.log(\`Parent \${depth} of problematic card: \${parent.tagName}\`);
                console.log(\`  - Class: \${parent.className}\`);
                console.log(\`  - Height: \${style.height}\`);
                console.log(\`  - Display: \${style.display}\`);
                console.log(\`  - Position: \${style.position}\`);
                console.log(\`  - Overflow: \${style.overflow}\`);
                
                // Add a border to visualize
                parent.style.border = \`\${depth}px dashed blue\`;
                
                parent = parent.parentElement;
                depth++;
              }
            });
          }
        }, 2000); // Wait 2 seconds after load to ensure everything is rendered
      });
    `;
    
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default DOMInspector;
