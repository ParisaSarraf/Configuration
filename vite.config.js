import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@component": path.resolve(__dirname, "src/component"),
            "@utils": path.resolve(__dirname, "src/utils"),
            "@QueryServices": path.resolve(__dirname, "src/QueryServices"),
            "@assets": path.resolve(__dirname, "src/assets"),
        },
    },
});
