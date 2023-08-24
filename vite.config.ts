import { resolve } from 'path'
import { defineConfig } from 'vite'
import { watchExtensions } from './vite/watchExtensions'

export default defineConfig({
  build: {
    lib: {
      entry: [
        resolve(__dirname, 'lib/index.ts'),
      ],
      name: 'ShaclForm',
      fileName: 'ShaclForm',
    }
  },
  server: {
    port: 8007
  },
  plugins: [
    watchExtensions(['ttl'])
  ],
  define: {
    'import.meta.env.POSITIONSTACK': JSON.stringify(process.env.POSITIONSTACK),
    'import.meta.env.S3DOMAIN': JSON.stringify(process.env.S3DOMAIN),
    'import.meta.env.COMPANION': JSON.stringify(process.env.COMPANION),
    'import.meta.env.STORAGE_BACKEND': JSON.stringify(process.env.STORAGE_BACKEND),
    '__dirname': '"/"',
  }  
})