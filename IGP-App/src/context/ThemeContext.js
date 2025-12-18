// src/context/ThemeContext.js
import React, { createContext, useState, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import Colors from "../constants/Colors";

const ThemeContext = createContext();

const PERFORMER_PRIMARY = Colors.primary;
const BOOKER_PRIMARY = Colors.secondary;
const NEUTRAL_PRIMARY = Colors.neutral;

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === "dark");
  const [primaryColor, setPrimaryColor] = useState(NEUTRAL_PRIMARY);

  /* ========= EXPLICIT API ========= */

  const setRoleTheme = (role) => {
    if (role === "performer") setPrimaryColor(PERFORMER_PRIMARY);
    else if (role === "booker") setPrimaryColor(BOOKER_PRIMARY);
    else setPrimaryColor(NEUTRAL_PRIMARY);
  };

  const resetTheme = () => {
    setPrimaryColor(NEUTRAL_PRIMARY);
    setIsDarkMode(systemScheme === "dark");
  };

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const theme = useMemo(
    () => ({
      isDark: isDarkMode,
      colors: isDarkMode
        ? {
            background: "#121212",
            card: "#1E1E1E",
            text: "#FFFFFF",
            textSecondary: "#A0A0A0",
            border: "#333333",
            inputBg: "#2C2C2C",
            primary: primaryColor,
            secondary: Colors.secondary,
            tint: "#FFF",
          }
        : {
            background: "#F9F9F9",
            card: "#FFFFFF",
            text: Colors.textPrimary,
            textSecondary: Colors.textSecondary,
            border: "#E0E0E0",
            inputBg: "#F5F5F5",
            primary: primaryColor,
            secondary: Colors.secondary,
            tint: Colors.textPrimary,
          },
    }),
    [isDarkMode, primaryColor]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setRoleTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
