// src/context/ThemeContext.js
import React, { createContext, useState, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import Colors from "../constants/Colors";
import { useCurrentUser } from "../hooks/queries/useAuth";

const ThemeContext = createContext();

const PERFORMER_PRIMARY = Colors.primary;
const BOOKER_PRIMARY = "#00BCD4";

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === "dark");

  const { data: userResp } = useCurrentUser();
  const role = userResp?.data?.role ?? null;

  const rolePrimary = useMemo(() => {
    if (role === "booker") return BOOKER_PRIMARY;
    if (role === "performer") return PERFORMER_PRIMARY;
    return PERFORMER_PRIMARY;
  }, [role]);

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
            primary: rolePrimary,
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
            primary: rolePrimary,
            secondary: Colors.secondary,
            tint: Colors.textPrimary,
          },
    }),
    [isDarkMode, rolePrimary]
  );

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
