import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            include: ['buffer'],
            globals: {
                Buffer: true,
            },
        }),
    ],
    server: {
        proxy: {
            '/ao:6363': {
                target: 'http://ao.upshot.cards:6363',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/ao:6363/, ''),
            },
            '/ao:3005': {
                target: 'http://ao.upshot.cards:3005',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/ao:3005/, ''),
            },
        },
    },
});
