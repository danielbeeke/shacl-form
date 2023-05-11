#!/usr/bin/env node
import companion from '@uppy/companion/lib/companion.js'
// @ts-ignore
import index from '@uppy/companion/lib/standalone/index.js'
const port = process.env.COMPANION_PORT || 3020
import options from './companion-options.js'

const { app } = index(options)

companion.socket(app.listen(port))

console.log(`Welcome to Companion!`)
console.log(`Listening on http://0.0.0.0:${port}`)