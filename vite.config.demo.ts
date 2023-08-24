import { resolve } from 'path'
import { defineConfig } from 'vite'
import { watchExtensions } from './vite/watchExtensions'
import pkg from './package.json' assert { type: 'json' }
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    outDir: 'docs'
  },
  esbuild: {
    minifyIdentifiers: false,
    keepNames: true,
  },
  define: {
    '__dirname': '"/"',
  }  
})