import { copyFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* Vite's HMR ping uses a blob-backed SharedWorker, which the production CSP deliberately forbids.
   Widen the existing worker-src instead of adding a second one: a repeated directive makes the
   browser drop it and log "Ignoring duplicate Content-Security-Policy directive 'worker-src'". */
const devCsp = () => ({
    name: "dev-csp",
    apply: "serve",
    transformIndexHtml(html) {
        return html
            .replace(/require-trusted-types-for\s+'script';\s*/i, "")
            .replace(/worker-src\s+'self';/i, "worker-src 'self' blob:;");
    },
});

/*
    GitHub Pages serves 404.html for any path it does not have a file for. Shipping the
    app shell under that name lets BrowserRouter resolve deep links such as
    /Portfolio/projects/lifepilot instead of showing GitHub's 404 page.
*/
const spaFallback = () => {
    let outDir;

    return {
        name: "spa-fallback-404",
        apply: "build",
        configResolved(config) {
            outDir = path.resolve(config.root, config.build.outDir);
        },
        closeBundle() {
            copyFileSync(path.join(outDir, "index.html"), path.join(outDir, "404.html"));
        },
    };
};

export default defineConfig(({ mode }) => ({
    server: {

        host: '127.0.0.1',
        port: 30000,

        watch: {
            ignored: ['**/.vs/**'],
        },

        headers: mode === "production" ? {
            'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy':
                "default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none';"
        } : {}
    },
    plugins: [react(), devCsp(), spaFallback()],
    base: mode === "production" ? "/Portfolio/" : "/",
}));
