import { resolve } from 'path'
import { defineConfig } from 'vite'
import { watchExtensions } from './vite/watchExtensions'
import pkg from './package.json' assert { type: 'json' }
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: [
        resolve(__dirname, 'lib/ShaclForm.ts'),
      ],
      formats: ['es'],
      name: 'ShaclForm',
      fileName: 'ShaclForm',
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies), // don't bundle dependencies
        /^node:.*/, // don't bundle built-in Node.js modules (use protocol imports!)
      ],
    },
    target: 'esnext',
  },
  server: {
    port: 8007
  },
  plugins: [
    watchExtensions(['ttl']),
    dts()
  ],
  esbuild: {
    minifyIdentifiers: false,
    keepNames: true,
  },
  define: {
    'import.meta.env.POSITIONSTACK': JSON.stringify(process.env.POSITIONSTACK),
    'import.meta.env.S3DOMAIN': JSON.stringify(process.env.S3DOMAIN),
    'import.meta.env.COMPANION': JSON.stringify(process.env.COMPANION),
    'import.meta.env.STORAGE_BACKEND': JSON.stringify(process.env.STORAGE_BACKEND),
    '__dirname': '"/"',
  }  
})