import { useEffect, useRef, useState, useCallback } from "react";

interface UseKeyboardNavigationProps {
  rootElement: React.RefObject<HTMLElement>;
  selector?: string;
  enableVertical?: boolean;
  enableHorizontal?: boolean;
  wrapAround?: boolean;
  focusFirstOnMount?: boolean;
  onFocus?: (element: HTMLElement, index: number) => void;
  onToggleHelp?: () => void;
}

/**
 * A hook for keyboard navigation between elements
 * Supports arrow keys, Home/End, and custom help dialog
 */
export default function useKeyboardNavigation({
  rootElement,
  selector = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
  enableVertical = true,
  enableHorizontal = false,
  wrapAround = true,
  focusFirstOnMount = false,
  onFocus,
  onToggleHelp,
}: UseKeyboardNavigationProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // Get all focusable elements
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!rootElement.current) return [];

    const focusableElements = Array.from(
      rootElement.current.querySelectorAll<HTMLElement>(selector),
    ).filter((el) => {
      // Filter out hidden elements
      return el.offsetParent !== null && !el.hasAttribute("disabled");
    });

    return focusableElements;
  }, [rootElement, selector]);

  // Focus a specific element by index
  const focusElement = useCallback(
    (index: number) => {
      const elements = getFocusableElements();
      if (!elements[index]) return;

      elements[index].focus();
      setCurrentIndex(index);

      if (onFocus) {
        onFocus(elements[index], index);
      }
    },
    [getFocusableElements, onFocus],
  );

  // Focus the next element
  const focusNextElement = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const focusedElement = document.activeElement as HTMLElement;
    const currentIdx = elements.indexOf(focusedElement);
    let nextIndex = currentIdx + 1;

    // Wrap around to the beginning if at the end and wrapAround is true
    if (nextIndex >= elements.length) {
      nextIndex = wrapAround ? 0 : elements.length - 1;
    }

    focusElement(nextIndex);
  }, [getFocusableElements, wrapAround, focusElement]);

  // Focus the previous element
  const focusPreviousElement = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const focusedElement = document.activeElement as HTMLElement;
    const currentIdx = elements.indexOf(focusedElement);
    let prevIndex = currentIdx - 1;

    // Wrap around to the end if at the beginning and wrapAround is true
    if (prevIndex < 0) {
      prevIndex = wrapAround ? elements.length - 1 : 0;
    }

    focusElement(prevIndex);
  }, [getFocusableElements, wrapAround, focusElement]);

  // Focus first element on mount if enabled
  useEffect(() => {
    if (focusFirstOnMount) {
      const elements = getFocusableElements();
      if (elements.length > 0) {
        focusElement(0);
      }
    }
  }, [focusFirstOnMount, getFocusableElements, focusElement]);

  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.getAttribute("role") === "textbox" ||
        document.activeElement?.hasAttribute("contenteditable")
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          if (enableVertical) {
            e.preventDefault();
            focusNextElement();
          }
          break;
        case "ArrowUp":
          if (enableVertical) {
            e.preventDefault();
            focusPreviousElement();
          }
          break;
        case "ArrowRight":
          if (enableHorizontal) {
            e.preventDefault();
            focusNextElement();
          }
          break;
        case "ArrowLeft":
          if (enableHorizontal) {
            e.preventDefault();
            focusPreviousElement();
          }
          break;
        case "Home":
          e.preventDefault();
          focusElement(0);
          break;
        case "End":
          e.preventDefault();
          const elements = getFocusableElements();
          focusElement(elements.length - 1);
          break;
        case "/":
          // Toggle help dialog
          if (onToggleHelp && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onToggleHelp();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    enableVertical,
    enableHorizontal,
    focusNextElement,
    focusPreviousElement,
    focusElement,
    getFocusableElements,
    onToggleHelp,
  ]);

  return {
    currentIndex,
    focusElement,
    focusNextElement,
    focusPreviousElement,
    getFocusableElements,
  };
}
