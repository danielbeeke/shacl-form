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
  ]
})
