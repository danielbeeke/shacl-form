import { Storage } from 'npm:@tweedegolf/storage-abstraction'
import { Application, Context } from "https://deno.land/x/oak/mod.ts";
import { env } from './storage.env.ts'
import { Readable } from 'node:stream'
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/src/mime.ts"

/**
 * Here is a development storage connection.
 * You can use this implementation to make something similar but then ofcourse with access control.
 */
const app = new Application();
const buckets: { [key: string]: Storage } = {}

for (const [name, config] of Object.entries(env.buckets)) {
  try {
    buckets[name] = new Storage(config)
    await buckets[name].init()  
  }
  catch (exception) {
    console.log(exception)
  }
}

const port = 8008

app.use(async (ctx: Context) => {
  try {
    const { method, url } = ctx.request
    const bucketName: keyof typeof buckets = Object.keys(buckets).find((bucketName: string) => url.pathname.substring(1).startsWith(bucketName))!
    if (!bucketName || !buckets[bucketName]) throw new Error('Could not find the bucket')
    const bucket = buckets[bucketName]
    const path = url.pathname.substring(1).split('/').slice(1).join('/')

    ctx.response.headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE'
    })

    if (method === 'GET') {
      const reader = await bucket.getFileAsReadable(decodeURIComponent(path))
      /** @ts-ignore */
      ctx.response.headers.set('Content-type', mime.getType(path))
      ctx.response.body = Readable.toWeb(reader)
    }
    else if (method === 'DELETE') {
      const bodyFilePath = await ctx.request.body({ type: 'text' }).value
      const filePath = bodyFilePath.trim() ? bodyFilePath : path
      const cleanedPath = decodeURI(filePath.trim() ? filePath : path)
      await bucket.removeFile(cleanedPath)
      ctx.response.body = { success: true } 
    }
    else if (method === 'POST') {
      const formValues = await ctx.request.body({ type: 'form-data' }).value
      const requestData = await formValues.read()
      /** @ts-ignore */
      const [file] = requestData.files

      const cleanedName = file.originalName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filePath = file.filename
      
      await bucket.addFileFromPath(filePath, path + cleanedName)
      ctx.response.body = `http://localhost:${port}/${bucketName}/${path + cleanedName}`
    }
    else if (method === 'OPTIONS') {
      ctx.response.status = 200
      ctx.response.body = { success: true } 
    }
    else {
      throw new Error(`Method ${method} is not implemented`)
    }
  }
  catch (exception) {
    ctx.response.status = exception.statusCode ?? 404
    ctx.response.body = {
      error: exception.message ?? exception
    }
  }
})

console.log(`Running storage demo on localhost:${port}`)
await app.listen({ port })