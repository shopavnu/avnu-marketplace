import React, { createContext, useState, useEffect, useContext } from "react";

// Define our color palettes
export const colorPalettes = {
  current: {
    name: "Avnu Default",
    primary: "#00B87E",
    secondary: "#4A6CF7",
    accent: "#FF385C",
    background: "#FFFFFF",
    backgroundAlt: "#F9F9F9",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    text: "#333333",
    textSecondary: "#666666",
    border: "#EEEEEE",
    success: "#00B87E",
    warning: "#FFB800",
    error: "#FF5252",
  },
  feminine: {
    name: "Soft & Feminine",
    primary: "#F8BBD0",
    secondary: "#B39DDB",
    accent: "#FFAB91",
    background: "#FFF9FA",
    backgroundAlt: "#FCF2F4",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    text: "#6D4C41",
    textSecondary: "#8D6E63",
    border: "#F8BBD0",
    success: "#A5D6A7",
    warning: "#FFE082",
    error: "#EF9A9A",
  },
  modern: {
    name: "Clean Modern",
    primary: "#3B82F6",
    secondary: "#64748B",
    accent: "#3B82F6",
    background: "#F8FAFC",
    backgroundAlt: "#F1F5F9",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    text: "#1E293B",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  masculine: {
    name: "Bold & Masculine",
    primary: "#1E3A8A",
    secondary: "#334155",
    accent: "#B91C1C",
    background: "#0F172A",
    backgroundAlt: "#1E293B",
    surface: "#334155",
    surfaceElevated: "#475569",
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    border: "#475569",
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
  },
  vibrant: {
    name: "Vibrant & Colorful",
    primary: "#8B5CF6",
    secondary: "#EC4899",
    accent: "#F97316",
    background: "#FFFFFF",
    backgroundAlt: "#F9FAFB",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    text: "#111827",
    textSecondary: "#4B5563",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#FBBF24",
    error: "#EF4444",
  },
};

export type PaletteType = keyof typeof colorPalettes;
export type ColorPalette = typeof colorPalettes.current;

interface ThemeContextType {
  paletteType: PaletteType;
  palette: ColorPalette;
  setPaletteType: (type: PaletteType) => void;
}

// Create the context with default values
export const ThemeContext = createContext<ThemeContextType>({
  paletteType: "current",
  palette: colorPalettes.current,
  setPaletteType: () => {},
});

// Custom hook for using the theme
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [paletteType, setPaletteType] = useState<PaletteType>("current");

  // Load user preference on mount
  useEffect(() => {
    const savedPalette = localStorage.getItem("userTheme") as PaletteType;
    if (savedPalette && colorPalettes[savedPalette]) {
      setPaletteType(savedPalette);
    }
  }, []);

  // Save user preference when changed
  const handlePaletteChange = (type: PaletteType) => {
    if (!colorPalettes[type]) {
      console.error(`Theme "${type}" not found, using default`);
      return;
    }

    setPaletteType(type);
    localStorage.setItem("userTheme", type);

    // In a real implementation, we would also update the user's preference in the backend
    // api.updateUserPreferences({ theme: type }).catch(error => {
    //   console.error('Failed to save theme preference', error);
    // });
  };

  // Apply CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    const palette = colorPalettes[paletteType];

    // Safely apply the theme with validation
    if (!palette) return;

    // Apply all color variables to CSS
    Object.entries(palette).forEach(([key, value]) => {
      if (key !== "name") {
        // Skip the name property
        root.style.setProperty(`--color-${key}`, value);
      }
    });

    // Set data-theme attribute for potential CSS selectors
    root.setAttribute("data-theme", paletteType);
  }, [paletteType]);

  return (
    <ThemeContext.Provider
      value={{
        paletteType,
        palette: colorPalettes[paletteType],
        setPaletteType: handlePaletteChange,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
