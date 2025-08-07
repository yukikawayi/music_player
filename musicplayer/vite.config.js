import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from'path'
// https://vite.dev/config/
export default defineConfig({
  base:"./",
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  entry: {
    main: 'src/renderer/main.js',
    preload: 'src/preload.js' // 确保有预加载入口
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
})
