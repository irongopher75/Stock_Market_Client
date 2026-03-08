import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
// Force restart
export default defineConfig({
    plugins: [react()],
    css: {
        postcss: {
            plugins: [
                tailwindcss(),
                autoprefixer(),
            ],
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    geospatial: ['@deck.gl/react', '@deck.gl/layers', 'maplibre-gl'],
                    charts: ['lightweight-charts'],
                    vendor: ['react', 'react-dom', 'zustand', 'react-router-dom'],
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    }
})
