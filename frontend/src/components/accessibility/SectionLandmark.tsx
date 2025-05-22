import React from "react";

interface SectionLandmarkProps {
  /**
   * ID for the section, used for skip links and navigation
   */
  id: string;

  /**
   * Title of the section
   */
  title: string;

  /**
   * Optional subtitle or description
   */
  subtitle?: string;

  /**
   * Optional ARIA label for the section
   * If not provided, title will be used
   */
  ariaLabel?: string;

  /**
   * Children to render inside the section
   */
  children: React.ReactNode;

  /**
   * Optional CSS class name
   */
  className?: string;

  /**
   * Whether this section is a main landmark
   */
  isMain?: boolean;

  /**
   * Optional "See all" link URL
   */
  seeAllUrl?: string;

  /**
   * Optional "See all" link text
   */
  seeAllText?: string;
}

/**
 * Accessible section landmark component
 * Provides proper ARIA landmarks, headings, and keyboard navigation
 */
const SectionLandmark: React.FC<SectionLandmarkProps> = ({
  id,
  title,
  subtitle,
  ariaLabel,
  children,
  className = "",
  isMain = false,
  seeAllUrl,
  seeAllText = "See all",
}) => {
  // Determine the appropriate role
  const role = isMain ? "main" : "region";

  return (
    <section
      id={id}
      role={role}
      aria-labelledby={`${id}-heading`}
      className={`mb-12 ${className}`}
      tabIndex={-1} // Makes the section focusable but not in the tab order
    >
      {/* Section header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 id={`${id}-heading`} className="text-2xl font-semibold">
            {title}
          </h2>
          {subtitle && (
            <p id={`${id}-description`} className="text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {seeAllUrl && (
          <a
            href={seeAllUrl}
            className="text-sage hover:text-sage/80 font-medium flex items-center transition-colors"
            aria-describedby={`${id}-heading`}
          >
            {seeAllText}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        )}
      </div>

      {/* Section content */}
      <div
        aria-labelledby={`${id}-heading`}
        {...(subtitle && { "aria-describedby": `${id}-description` })}
      >
        {children}
      </div>
    </section>
  );
};

export default SectionLandmark;
