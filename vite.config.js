import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
    server: {
        headers: mode === "production" ? {
            'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy':
                "default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self'; script-src 'self';"
        } : {}
    },
    plugins: [react()],
    base: mode === "production" ? "/Portfolio/" : "/",
}));




