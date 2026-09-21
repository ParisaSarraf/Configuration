module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        Main: "#172033",
        Box: "#EEF2FF",
        brand: {
          DEFAULT: "#315CFF",
          hover: "#2447D8",
          soft: "#EEF2FF",
        },
        semantic: {
          success: "#16A36A",
          warning: "#D97706",
          error: "#DC4C4C",
          info: "#315CFF",
        },
        light: {
          primary: "#f3f4f6",
          secondary: "#e5e7eb",
          accent: "#3b82f6",
          text: {
            primary: "#1f2937",
            secondary: "#6b7280",
          },
        },
        dark: {
          primary: "#111827",
          secondary: "#1f2937",
          accent: "#60a5fa",
          text: {
            primary: "#f9fafb",
            secondary: "#d1d5db",
          },
        },
      },
      fontFamily: {
        vazir: ["Vazir", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "12px",
        "2xl": "12px",
        "3xl": "12px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(16, 24, 40, 0.05)",
        DEFAULT: "0 1px 2px rgba(16, 24, 40, 0.05), 0 4px 12px rgba(16, 24, 40, 0.04)",
        lg: "0 1px 2px rgba(16, 24, 40, 0.05), 0 8px 24px rgba(16, 24, 40, 0.07)",
        xl: "0 1px 2px rgba(16, 24, 40, 0.05), 0 8px 24px rgba(16, 24, 40, 0.07)",
      },
      screens: {
        xs: "425px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1440px",
        "3xl": "1920px",
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".modal-button": {
          "@apply bg-blue-500 text-white p-4 my-4 rounded-lg hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800":
            {},
        },
        ".card": {
          "@apply text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 p-4 border border-gray-400 shadow-sm drop-shadow-xl rounded-lg":
            {},
        },
        ".layout": {
          "@apply flex flex-col h-screen bg-Main":
            {},
        },
        ".BrandButton": {
          "@apply bg-blue-500 hover:bg-blue-600 text-white":
            {},
        },
        ".CardItem": {
          "@apply flex items-center justify-center h-40 bg-white shadow-lg hover:shadow-xl transition-shadow text-purple-500 hover:text-white hover:bg-purple-500 text-lg font-medium rounded-sm rounded-tl-3xl rounded-br-3xl":
            {},
        },
      });
    },
  ],
};
