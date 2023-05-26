import { Storage } from 'npm:@tweedegolf/storage-abstraction'
import { Application, Context } from "https://deno.land/x/oak/mod.ts";
import { env } from './storage.env.ts'
import { Readable } from 'node:stream'
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/src/mime.ts"

const files =  Deno.readDir('./tmp/test')

const filePaths: Array<string> = []
for await (const file of files) {
  if (file.isFile) filePaths.push(file.name)
}

const  newFileContents = `
@prefix schema: <https://schema.org/>.
@prefix ex: <http://example.com/>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

ex:name 
  schema:url ${filePaths.map(filePath => `<http://localhost:8000/local/test/${encodeURIComponent(filePath)}>`)} .
`
await Deno.writeTextFile('../data/storage.ttl', newFileContents)

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
      const reader = await bucket.getFileAsReadable(decodeURIComponent(path))
      /** @ts-ignore */
      ctx.response.headers.set('Content-type', mime.getType(path))
      ctx.response.body = Readable.toWeb(reader)
    }
    else if (method === 'DELETE') {
      const bodyFilePath = await ctx.request.body({ type: 'text' }).value
      const filePath = bodyFilePath.trim() ? bodyFilePath : path
      await bucket.removeFile(filePath.trim() ? filePath : path)
      ctx.response.body = { success: true } 
    }
    else if (method === 'POST') {
      const formValues = await ctx.request.body({ type: 'form-data' }).value
      const requestData = await formValues.read()
      /** @ts-ignore */
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
    ctx.response.status = exception.statusCode ?? 404
    ctx.response.body = {
      error: exception.message ?? exception
    }
  }
})

console.log('Running storage demo on localhost:8000')
await app.listen({ port: 8000 })