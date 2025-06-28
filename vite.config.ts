import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/neo4j': {
        target: 'http://localhost:7474',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/neo4j/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Remove X-Frame-Options and Content-Security-Policy headers to allow iframe embedding
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['X-Frame-Options'];
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['Content-Security-Policy'];
          });
        },
      },
      '/jupyter': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/jupyter/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Remove X-Frame-Options header to allow iframe embedding
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['X-Frame-Options'];
          });
        },
      },
      '/prefect': {
        target: 'http://localhost:4200',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/prefect/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Remove X-Frame-Options header to allow iframe embedding
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['X-Frame-Options'];
          });
        },
      },
    },
  },
});
