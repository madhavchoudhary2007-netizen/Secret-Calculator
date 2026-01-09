/**
 * theme.ts
 * 
 * Centralized design tokens for the Secret Calculator app.
 * Defines colors, spacing, typography, and visual effects used throughout.
 * Supports both light and dark color schemes.
 */

import { Platform } from "react-native";

// Calculator-specific color palette for an authentic look
export const CalculatorColors = {
  primary: "#4A90E2",
  background: "#F5F5F7",
  surface: "#FFFFFF",
  textPrimary: "#1C1C1E",
  textSecondary: "#8E8E93",
  numberButton: "#E5E5EA",
  operatorButton: "#FF9500",
  equalsButton: "#34C759",
  functionButton: "#8E8E93",
  accent: "#34C759",
  destructive: "#FF3B30",
};

// Full theme definitions for light and dark modes
export const Colors = {
  light: {
    text: CalculatorColors.textPrimary,
    textSecondary: CalculatorColors.textSecondary,
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: CalculatorColors.primary,
    link: CalculatorColors.primary,
    backgroundRoot: CalculatorColors.background,
    backgroundDefault: CalculatorColors.surface,
    backgroundSecondary: "#E6E6E6",
    backgroundTertiary: "#D9D9D9",
    primary: CalculatorColors.primary,
    accent: CalculatorColors.accent,
    destructive: CalculatorColors.destructive,
    numberButton: CalculatorColors.numberButton,
    operatorButton: CalculatorColors.operatorButton,
    equalsButton: CalculatorColors.equalsButton,
    functionButton: CalculatorColors.functionButton,
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#0A84FF",
    link: "#0A84FF",
    backgroundRoot: "#1C1C1E",
    backgroundDefault: "#2C2C2E",
    backgroundSecondary: "#3A3A3C",
    backgroundTertiary: "#48484A",
    primary: "#0A84FF",
    accent: "#30D158",
    destructive: "#FF453A",
    numberButton: "#505050",
    operatorButton: "#FF9F0A",
    equalsButton: "#30D158",
    functionButton: "#636366",
  },
};

// Consistent spacing values used throughout the app
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  inputHeight: 48,
  buttonHeight: 52,
};

// Border radius presets for rounded corners
export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

// Typography scale with font sizes and weights
export const Typography = {
  display: {
    fontSize: 48,
    fontWeight: "500" as const,
  },
  button: {
    fontSize: 24,
    fontWeight: "400" as const,
  },
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

// Shadow styles for elevated UI elements
export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};

// Platform-specific font family definitions
export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
