import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

const preferenceStorageKey = "user_preferences";

const defaultPreferences = {
  colorScheme: "light",
  language: "english",
};

const paletteByScheme = {
  sepia: {
    primary: "#b88953",
    background: "#f4ecd8",
    text: "#3e2c1b",
  },
  red: {
    primary: "#c62828",
    background: "#ffe8e8",
    text: "#3b0d0d",
  },
  green: {
    primary: "#2e7d32",
    background: "#e9f5e9",
    text: "#123018",
  },
  blue: {
    primary: "#1565c0",
    background: "#e8f1fb",
    text: "#0a2c57",
  },
  dark: {
    primary: "#179992",
    background: "#121212",
    text: "#f5f5f5",
  },
  light: {
    primary: "#179992",
    background: "#f5f5f5",
    text: "#111111",
  },
};

const PreferencesContext = createContext({
  preferences: defaultPreferences,
  setColorScheme: () => {},
  setLanguage: () => {},
});

const readPreferences = () => {
  const stored = localStorage.getItem(preferenceStorageKey);
  if (!stored) return defaultPreferences;

  try {
    const parsed = JSON.parse(stored);
    return {
      ...defaultPreferences,
      ...parsed,
    };
  } catch (error) {
    return defaultPreferences;
  }
};

const writePreferences = (preferences) => {
  localStorage.setItem(preferenceStorageKey, JSON.stringify(preferences));
};

export const usePreferences = () => useContext(PreferencesContext);

const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(() => readPreferences());

  useEffect(() => {
    writePreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    const palette = paletteByScheme[preferences.colorScheme] || paletteByScheme.light;
    document.body.style.backgroundColor = palette.background;
    document.body.style.color = palette.text;
    document.documentElement.setAttribute("data-color-scheme", preferences.colorScheme);
  }, [preferences.colorScheme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", preferences.language);
  }, [preferences.language]);

  const setColorScheme = (scheme) => {
    setPreferences((current) => ({ ...current, colorScheme: scheme }));
  };

  const setLanguage = (language) => {
    setPreferences((current) => ({ ...current, language }));
  };

  const theme = useMemo(() => {
    const palette = paletteByScheme[preferences.colorScheme] || paletteByScheme.light;
    return createMuiTheme({
      typography: {
        fontFamily: "Roboto, Arial",
      },
      palette: {
        primary: {
          main: palette.primary,
        },
        background: {
          default: palette.background,
          paper: preferences.colorScheme === "dark" ? "#1f1f1f" : "#ffffff",
        },
        text: {
          primary: palette.text,
        },
      },
    });
  }, [preferences.colorScheme]);

  return (
    <PreferencesContext.Provider value={{ preferences, setColorScheme, setLanguage }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </PreferencesContext.Provider>
  );
};

export default PreferencesProvider;
