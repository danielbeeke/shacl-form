import { Storage } from 'npm:@tweedegolf/storage-abstraction'
import { Application, Context } from "https://deno.land/x/oak/mod.ts";
import { env } from './storage.env.ts'
import { Readable } from 'node:stream'

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

app.use(async (ctx: Context) => {
  try {
    const { method, url } = ctx.request
    const bucketName: keyof typeof buckets = Object.keys(buckets).find(bucketName => url.pathname.substring(1).startsWith(bucketName))!
    if (!bucketName || !buckets[bucketName]) throw new Error('Could not find the bucket')
    const bucket = buckets[bucketName]
    const path = url.pathname.substring(1).split('/').slice(1).join('/')

    ctx.response.headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE'
    })

    if (method === 'GET') {
      const reader = await bucket.getFileAsReadable(path)
      ctx.response.body = Readable.toWeb(reader)
    }
    else if (method === 'DELETE') {
      const filePath = await ctx.request.body({ type: 'text' }).value
      await bucket.removeFile(filePath)
      ctx.response.body = { success: true } 
    }
    else if (method === 'POST') {
      const formValues = await ctx.request.body({ type: 'form-data' }).value
      const requestData = await formValues.read()
      const [file] = requestData.files

      const filePath = file.filename
      await bucket.addFileFromPath(filePath, path + file.originalName)
      ctx.response.body = path + file.originalName
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
    console.log(exception)
    ctx.response.status = exception.statusCode ?? 404
    ctx.response.body = {
      error: exception.message ?? exception
    }
  }
})

await app.listen({ port: 8000 })
