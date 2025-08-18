module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        Main: "#2B3B50",
        Box: "#EEF7F8",
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
