import React from "react";

interface SkipLink {
  /**
   * The target ID to skip to
   */
  targetId: string;

  /**
   * The text to display for the skip link
   */
  text: string;
}

interface SkipLinksProps {
  /**
   * Array of skip links to display
   */
  links: SkipLink[];
}

/**
 * Skip links component for keyboard users to bypass navigation
 * and jump directly to main content or specific sections
 */
const SkipLinks: React.FC<SkipLinksProps> = ({ links }) => {
  return (
    <div className="skip-links">
      {/* Visually hidden until focused */}
      <style jsx>{`
        .skip-links {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 9999;
        }

        .skip-link {
          position: absolute;
          top: -9999px;
          left: 0;
          padding: 16px;
          background: #fff;
          color: #333;
          font-weight: 600;
          border: 2px solid #333;
          outline: none;
          transition: top 0.2s ease;
        }

        .skip-link:focus {
          top: 0;
        }
      `}</style>

      {links.map((link, index) => (
        <a
          key={index}
          href={`#${link.targetId}`}
          className="skip-link"
          onClick={(e) => {
            // Prevent default to handle focus manually
            e.preventDefault();

            // Find the target element
            const target = document.getElementById(link.targetId);

            if (target) {
              // Scroll to the target
              target.scrollIntoView({ behavior: "smooth" });

              // Set focus to the target
              target.setAttribute("tabindex", "-1");
              target.focus({ preventScroll: true });

              // Update URL hash
              window.history.pushState(null, "", `#${link.targetId}`);
            }
          }}
        >
          {link.text}
        </a>
      ))}
    </div>
  );
};

export default SkipLinks;
