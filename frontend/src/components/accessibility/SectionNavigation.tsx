import React, { useState, useEffect } from 'react';

interface Section {
  /**
   * ID of the section
   */
  id: string;
  
  /**
   * Title of the section
   */
  title: string;
}

interface SectionNavigationProps {
  /**
   * Array of sections to navigate between
   */
  sections: Section[];
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Whether to show the navigation
   * Can be 'always', 'hover', or 'focus'
   */
  showOn?: 'always' | 'hover' | 'focus';
  
  /**
   * Position of the navigation
   */
  position?: 'left' | 'right';
}

/**
 * Vertical section navigation component
 * Provides quick navigation between major sections of the page
 */
const SectionNavigation: React.FC<SectionNavigationProps> = ({
  sections,
  className = '',
  showOn = 'hover',
  position = 'right'
}) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(showOn === 'always');
  
  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Add offset for better UX
      
      // Find the section that is currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section) {
          const sectionTop = section.offsetTop;
          if (scrollPosition >= sectionTop) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize on mount
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections]);
  
  // Handle visibility based on showOn prop
  const handleMouseEnter = () => {
    if (showOn === 'hover' || showOn === 'focus') {
      setIsVisible(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (showOn === 'hover') {
      setIsVisible(false);
    }
  };
  
  const handleFocus = () => {
    if (showOn === 'focus' || showOn === 'hover') {
      setIsVisible(true);
    }
  };
  
  const handleBlur = (e: React.FocusEvent) => {
    if (showOn === 'focus' && !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsVisible(false);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown' && index < sections.length - 1) {
      e.preventDefault();
      const nextButton = document.querySelector(`[data-section-index="${index + 1}"]`) as HTMLElement;
      if (nextButton) nextButton.focus();
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      const prevButton = document.querySelector(`[data-section-index="${index - 1}"]`) as HTMLElement;
      if (prevButton) prevButton.focus();
    }
  };
  
  return (
    <nav
      className={`section-navigation ${className}`}
      aria-label="Page sections"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <style jsx>{`
        .section-navigation {
          position: fixed;
          ${position}: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 50;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: opacity 0.3s ease;
          opacity: ${isVisible ? 1 : 0};
        }
        
        .section-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          transition: all 0.2s ease;
          color: #333;
          text-align: ${position === 'left' ? 'right' : 'left'};
        }
        
        .section-button:hover .section-indicator,
        .section-button:focus .section-indicator {
          width: 12px;
          background-color: var(--color-sage, #4D7C6F);
        }
        
        .section-button:hover .section-title,
        .section-button:focus .section-title {
          opacity: 1;
          max-width: 200px;
          margin-${position === 'left' ? 'right' : 'left'}: 8px;
        }
        
        .section-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ccc;
          transition: all 0.2s ease;
          flex-shrink: 0;
          order: ${position === 'left' ? 2 : 1};
        }
        
        .section-title {
          opacity: 0;
          max-width: 0;
          overflow: hidden;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          order: ${position === 'left' ? 1 : 2};
        }
        
        .section-button.active .section-indicator {
          width: 12px;
          height: 12px;
          background-color: var(--color-sage, #4D7C6F);
        }
        
        @media (max-width: 768px) {
          .section-navigation {
            display: none;
          }
        }
      `}</style>
      
      {sections.map((section, index) => (
        <button
          key={section.id}
          className={`section-button ${activeSection === section.id ? 'active' : ''}`}
          onClick={() => {
            const element = document.getElementById(section.id);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              element.focus({ preventScroll: true });
            }
          }}
          aria-label={`Navigate to ${section.title} section`}
          aria-current={activeSection === section.id ? 'true' : 'false'}
          data-section-index={index}
          onKeyDown={(e) => handleKeyDown(e, index)}
        >
          <span className="section-indicator" aria-hidden="true"></span>
          <span className="section-title">{section.title}</span>
        </button>
      ))}
    </nav>
  );
};

export default SectionNavigation;
