/**
 * This service worker simulates a storage compatible with SHACL form and storage abstraction.
 */
importScripts('localforage.min.js')

self.addEventListener('fetch', async function(event) {
    if (event.request.url.includes('storage-service-worker')) {
        if (event.request.method === 'POST') {
            return event.respondWith(new Promise(async (resolve) => {
                const data = await event.request.formData()
                const files = data.getAll('files')
                const cleanedFiles = []
                for (const file of files) {
                    const cleanedFile = event.request.url + '/' + encodeURIComponent(file.name)
                    await localforage.setItem(cleanedFile, file)
                    cleanedFiles.push(cleanedFile)
                }
    
                resolve(new Response(JSON.stringify(cleanedFiles)))
            }))
        }

        if (event.request.method === 'GET') {
            return event.respondWith(new Promise(async (resolve, reject) => {
                const file = await localforage.getItem(event.request.url)

                if (!file) reject('File not found')

                resolve(new Response(file, {
                    headers: {
                        ContentType: file.type
                    }
                }))
            }))            
        }

        if (event.request.method === 'DELETE') {
            return event.respondWith(new Promise(async (resolve, reject) => {
                await localforage.removeItem(event.request.url)
                resolve(new Response(JSON.stringify({ success: true })))
            }))            
        }
    }
})