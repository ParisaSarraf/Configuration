import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProductThemeVariables, PRODUCT_THEMES } from "./productThemes";

const STORAGE_KEY = "product-workspace-theme:v1";
const ProductThemeContext = createContext(null);

const readThemePreferences = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const globalTheme = Object.hasOwn(PRODUCT_THEMES, saved.globalTheme)
      ? saved.globalTheme
      : "teal";
    const moduleThemes = Object.fromEntries(
      Object.entries(saved.moduleThemes || {}).filter(
        ([, themeId]) => Object.hasOwn(PRODUCT_THEMES, themeId),
      ),
    );

    return { globalTheme, moduleThemes };
  } catch {
    return { globalTheme: "teal", moduleThemes: {} };
  }
};

export const ProductThemeProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(readThemePreferences);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.appTheme = preferences.globalTheme;
    Object.entries(getProductThemeVariables(preferences.globalTheme)).forEach(
      ([name, value]) => root.style.setProperty(name, value),
    );
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
    }
  }, [preferences]);

  const value = useMemo(
    () => ({
      globalTheme: preferences.globalTheme,
      moduleThemes: preferences.moduleThemes,
      setGlobalTheme: (themeId) => {
        if (!Object.hasOwn(PRODUCT_THEMES, themeId)) return;
        setPreferences((current) => ({ ...current, globalTheme: themeId }));
      },
      setModuleTheme: (moduleKey, themeId) => {
        if (!moduleKey) return;
        setPreferences((current) => {
          const moduleThemes = { ...current.moduleThemes };
          if (Object.hasOwn(PRODUCT_THEMES, themeId)) {
            moduleThemes[moduleKey] = themeId;
          } else {
            delete moduleThemes[moduleKey];
          }
          return { ...current, moduleThemes };
        });
      },
      getThemeForModule: (moduleKey) =>
        preferences.moduleThemes[moduleKey] || preferences.globalTheme,
    }),
    [preferences],
  );

  return (
    <ProductThemeContext.Provider value={value}>
      {children}
    </ProductThemeContext.Provider>
  );
};

export const useProductTheme = () => {
  const context = useContext(ProductThemeContext);
  if (!context) {
    throw new Error("useProductTheme must be used within ProductThemeProvider");
  }
  return context;
};