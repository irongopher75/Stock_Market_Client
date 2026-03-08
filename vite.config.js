export default defineConfig({
    plugins: [react()],
    worker: { format: 'es' },
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
                    'deck-gl': ['@deck.gl/react', '@deck.gl/layers'],
                    'charts': ['lightweight-charts'],
                    'map': ['react-map-gl'],
                    'state': ['zustand', 'react-router-dom'],
                }
            }
        },
        chunkSizeWarningLimit: 1200,
    },
    optimizeDeps: {
        exclude: ['@deck.gl/react']
    }
})
