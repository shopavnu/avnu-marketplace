import React, { ReactNode, useState, useEffect, useRef } from "react";
import Head from "next/head";
import SkipLinks from "@/components/accessibility/SkipLinks";
import SectionNavigation from "@/components/accessibility/SectionNavigation";
import useKeyboardNavigation from "@/hooks/useKeyboardNavigation";

interface Section {
  id: string;
  title: string;
}

interface AccessibleLayoutProps {
  /**
   * Page title
   */
  title: string;

  /**
   * Page description for SEO
   */
  description?: string;

  /**
   * Children to render inside the layout
   */
  children: ReactNode;

  /**
   * Skip links configuration
   */
  skipLinks?: Array<{ targetId: string; text: string }>;

  /**
   * Sections for navigation
   */
  sections?: Section[];

  /**
   * Whether to show section navigation
   */
  showSectionNavigation?: boolean;

  /**
   * Additional classes for the main content
   */
  mainClassName?: string;
}

/**
 * Accessible layout component that provides consistent accessibility features
 * across all pages in the platform
 */
const AccessibleLayout: React.FC<AccessibleLayoutProps> = ({
  title,
  description,
  children,
  skipLinks = [{ targetId: "main-content", text: "Skip to main content" }],
  sections = [],
  showSectionNavigation = true,
  mainClassName = "",
}) => {
  const [mounted, setMounted] = useState(false);

  // Set mounted state on client-side
  useEffect(() => {
    setMounted(true);

    // Add announcement for screen readers when page loads
    if (typeof window !== "undefined") {
      const announcer = document.createElement("div");
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.className = "sr-only";
      document.body.appendChild(announcer);

      // Announce page loaded
      setTimeout(() => {
        announcer.textContent = `${title} page loaded. Use tab to navigate or press slash key for keyboard shortcuts.`;
      }, 1000);

      return () => {
        document.body.removeChild(announcer);
      };
    }
  }, [title]);

  // Create ref for main content
  const mainRef = useRef<HTMLElement>(null);

  // Set up keyboard navigation
  useKeyboardNavigation({
    rootElement: mainRef,
    enableVertical: true,
    wrapAround: false,
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Slash key (/) opens keyboard shortcut help
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();

        // Show keyboard shortcuts modal (simplified implementation)
        alert(
          "Keyboard Shortcuts:\n\n" +
            "/ - Show this help\n" +
            "Tab - Navigate between elements\n" +
            "Arrow Down/Up - Navigate between sections\n" +
            "Home - Go to top of page\n" +
            "End - Go to bottom of page\n" +
            "Esc - Close dialogs or menus",
        );
      }
    };

    if (mounted) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted]);

  return (
    <>
      <Head>
        <title>{title} | Avnu Marketplace</title>
        {description && <meta name="description" content={description} />}
      </Head>

      {/* Skip Links */}
      <SkipLinks links={skipLinks} />

      {/* Section Navigation */}
      {showSectionNavigation && sections.length > 0 && (
        <SectionNavigation
          sections={sections}
          showOn="hover"
          position="right"
        />
      )}

      {/* Main Content */}
      <main
        id="main-content"
        className={`min-h-screen bg-white ${mainClassName}`}
        tabIndex={-1}
        ref={mainRef}
      >
        {children}

        {/* Scroll Progress Indicator */}
        <div
          className="fixed bottom-0 left-0 w-full h-1 bg-gray-200"
          aria-hidden="true"
        >
          <div
            id="scroll-progress"
            className="h-full bg-sage transition-all duration-100 ease-out"
            style={{ width: "0%" }}
          ></div>
        </div>

        {/* Script to update scroll progress */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const progressBar = document.getElementById('scroll-progress');
            
            window.addEventListener('scroll', function() {
              const scrollTop = window.scrollY;
              const docHeight = document.documentElement.scrollHeight - window.innerHeight;
              const scrollPercent = (scrollTop / docHeight) * 100;
              
              if (progressBar) {
                progressBar.style.width = scrollPercent + '%';
              }
            });
          });
        `,
          }}
        />
      </main>
    </>
  );
};

export default AccessibleLayout;
