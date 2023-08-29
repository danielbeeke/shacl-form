/**
 * THis service worker simulates a storage compatible with SHACL form and storage abstraction.
 */
importScripts('localforage.min.js')

self.addEventListener('fetch', async function(event) {
    if (event.request.url.includes('storage-service-worker')) {
        if (event.request.method === 'POST') {
            event.respondWith(new Response(event.request.url))

            const data = await event.request.formData()
            const files = data.getAll('files')
            await localforage.setItem(event.request.url, files)
        }

        if (event.request.method === 'GET') {
            event.respondWith(new Promise(async (resolve) => {
                const [file] = await localforage.getItem(event.request.url)

                resolve(new Response(file, {
                    headers: {
                        ContentType: file.type
                    }
                }))
            }))            
        }
    }
})