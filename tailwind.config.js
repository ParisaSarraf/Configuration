// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        indigo: {
          300: "#a5b4fc",
          500: "#6366f1",
          700: "#4338ca",
        },
      },
    },
  },
};
