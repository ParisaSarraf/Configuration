export const PRODUCT_THEMES = {
  teal: {
    id: "teal",
    label: "سبزآبی",
    accent: "#087f70",
    tokens: {
      canvas: "#f2f7f7",
      surface: "#ffffff",
      text: "#191d34",
      muted: "#555f7d",
      border: "#dce6e8",
      accent: "#087f70",
      accentStrong: "#006d5e",
      accentSoft: "#e5f5f2",
      accentBorder: "#afe4db",
      accentHover: "#f6faf9",
      controlBorder: "#cddcde",
      tableHead: "#f2f7f7",
      tableText: "#414d6e",
      focus: "#148e80",
    },
  },
  blue: {
    id: "blue",
    label: "آبی",
    accent: "#365fc5",
    tokens: {
      canvas: "#f3f6fb",
      surface: "#ffffff",
      text: "#1c2540",
      muted: "#596782",
      border: "#dce4f0",
      accent: "#365fc5",
      accentStrong: "#284b9f",
      accentSoft: "#e9efff",
      accentBorder: "#c1d0f5",
      accentHover: "#f4f7ff",
      controlBorder: "#ccd7eb",
      tableHead: "#f3f6fb",
      tableText: "#40516f",
      focus: "#4a6fd0",
    },
  },
  violet: {
    id: "violet",
    label: "بنفش",
    accent: "#7752b8",
    tokens: {
      canvas: "#f7f5fb",
      surface: "#ffffff",
      text: "#28213b",
      muted: "#665d7c",
      border: "#e5deef",
      accent: "#7752b8",
      accentStrong: "#5e3c9c",
      accentSoft: "#f0eafd",
      accentBorder: "#d7c8f2",
      accentHover: "#f8f5fe",
      controlBorder: "#d8cde8",
      tableHead: "#f7f5fb",
      tableText: "#52486c",
      focus: "#8765c3",
    },
  },
  rose: {
    id: "rose",
    label: "رزگلد",
    accent: "#bd5574",
    tokens: {
      canvas: "#faf5f6",
      surface: "#ffffff",
      text: "#33212a",
      muted: "#745967",
      border: "#eddde3",
      accent: "#bd5574",
      accentStrong: "#963c58",
      accentSoft: "#f9eaf0",
      accentBorder: "#ebc5d2",
      accentHover: "#fdf7f9",
      controlBorder: "#e7ced8",
      tableHead: "#faf5f6",
      tableText: "#634956",
      focus: "#c46682",
    },
  },
};

export const PRODUCT_THEME_OPTIONS = Object.values(PRODUCT_THEMES);

export const getProductTheme = (themeId) =>
  PRODUCT_THEMES[themeId] || PRODUCT_THEMES.teal;

export const getProductThemeVariables = (themeId) =>
  Object.fromEntries(
    Object.entries(getProductTheme(themeId).tokens).map(([name, value]) => [
      `--pw-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
      value,
    ]),
  );

export const getProductThemeConfig = (themeId) => {
  const theme = getProductTheme(themeId);

  return {
    token: {
      colorPrimary: theme.accent,
      colorLink: theme.accent,
      colorLinkHover: theme.tokens.accentStrong,
      borderRadius: 12,
    },
  };
};