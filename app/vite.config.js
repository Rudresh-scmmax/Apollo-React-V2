import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "../build",
		emptyOutDir: true,
		// Optimize for production
		minify: 'terser',
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					router: ['react-router-dom'],
					query: ['@tanstack/react-query'],
					ui: ['antd', 'framer-motion']
				}
			}
		}
	},
	base: "/",
	// Environment variables
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
	},
	// Proxy configuration for development
	server: {
		proxy: {
			'/api': {
				target: 'http://apollo-v2-alb-977636636.us-east-1.elb.amazonaws.com',
				changeOrigin: true,
				secure: false
			}
		}
	}
});
