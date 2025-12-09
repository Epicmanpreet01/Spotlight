import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = {
    isDark: isDarkMode,
    colors: isDarkMode ? {
      background: '#121212',
      card: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#A0A0A0',
      border: '#333333',
      inputBg: '#2C2C2C',
      primary: Colors.primary, 
      secondary: Colors.secondary,
      tint: '#FFF'
    } : {
      background: '#F9F9F9',
      card: '#FFFFFF',
      text: Colors.textPrimary,
      textSecondary: Colors.textSecondary,
      border: '#E0E0E0',
      inputBg: '#F5F5F5',
      primary: Colors.primary,
      secondary: Colors.secondary,
      tint: Colors.textPrimary
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);