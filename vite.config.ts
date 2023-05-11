import { resolve } from 'path'
import { defineConfig } from 'vite'
import { watchExtensions } from './vite/watchExtensions'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/ShaclForm.ts'),
      name: 'ShaclForm',
      fileName: 'ShaclForm',
    }
  },
  plugins: [
    watchExtensions(['ttl'])
  ],
  define: {
    'import.meta.env.POSITIONSTACK': JSON.stringify(process.env.POSITIONSTACK),
    'import.meta.env.S3DOMAIN': JSON.stringify(process.env.S3DOMAIN),
    'import.meta.env.COMPANION': JSON.stringify(process.env.COMPANION),
    '__dirname': '"/"'
  }  
})
