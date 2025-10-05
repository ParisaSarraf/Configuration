/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",

    content: ["./src/**/*.{js,jsx,ts,tsx}"],

    theme: {
        extend: {
            colors: {
                Main: "#1B1725",
                Box: "rgba(150, 150, 200, 0.08)",

                Neon: {
                    Primary: "#C37BF5",
                    Accent: "#4A148C",
                },

                light: {
                    primary: "#F5F5F5",
                    secondary: "#FFFFFF",
                    accent: "#007BFF",
                    text: {
                        primary: "#36454F",
                        secondary: "#888888",
                    },
                },

                dark: {
                    primary: "#1B1725",
                    secondary: "#2E2A3A",
                    accent: "#C37BF5",
                    text: {
                        primary: "#8686bd",
                        secondary: "#4c4f5a",
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
        function ({addComponents}) {
            addComponents({
                ".layout": {
                    "@apply flex flex-col min-h-screen bg-dark-primary":
                        {},
                },

                ".AeroBox": {
                    "@apply bg-Box rounded-2xl p-6 shadow-2xl border border-opacity-20 transition-all duration-300":
                        {},
                    "backdrop-filter": "blur(10px)",
                    "box-shadow": "0 4px 30px rgba(0, 0, 0, 0.4)",
                    "border-color": "rgba(195, 123, 245, 0.4)",
                },

                ".GlassInput": {
                    "@apply bg-Box rounded-xl border border-opacity-30 text-dark-text-primary placeholder-dark-text-secondary focus:border-Neon-Primary focus:ring-0 transition-all duration-300":
                        {},
                    "backdrop-filter": "blur(5px)",
                },

                ".NeonButton": {
                    "@apply bg-Neon-Primary text-dark-primary font-bold rounded-xl border-none h-12 shadow-xl transition-all duration-300":
                        {},
                    "box-shadow": "0 0 15px rgba(195, 123, 245, 0.7)",
                    "&:hover": {
                        "box-shadow": "0 0 25px rgba(0, 212, 255, 0.9)",
                    },
                },

                ".NeonText": {
                    "@apply text-Neon-Primary hover:text-white transition-all duration-300":
                        {},
                },

                ".modal-button": {
                    "@apply NeonButton p-4 my-4":
                        {},
                },
                ".card": {
                    "@apply AeroBox border-none shadow-lg":
                        {},
                },
                ".BrandButton": {
                    "@apply NeonButton":
                        {},
                },
                ".CardItem": {
                    "@apply AeroBox flex items-center justify-center h-40 text-Neon-Primary text-lg font-medium":
                        {},
                },
                ".AeroMenuItem": {
                    "@apply !rounded-lg !my-1 !p-2 transition-colors bg-Box hover:!bg-Neon-Accent/40":
                        {},
                },
            });
        },
    ],
};