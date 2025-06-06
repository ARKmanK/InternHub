import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './'),
			'@components': path.resolve(__dirname, './src/components'),
			'@pages': path.resolve(__dirname, './src/components/pages'),
			'@data': path.resolve(__dirname, './src/data'),
			'@hooks': path.resolve(__dirname, './src/hooks'),
			'@img': path.resolve(__dirname, './src/img'),
			'@services': path.resolve(__dirname, './src/services'),
			'@public': path.resolve(__dirname, './public'),
			'@lib': path.resolve(__dirname, './src/lib'),	
			'@UI': path.resolve(__dirname, './src/components/UI'),
		},
	},
})
