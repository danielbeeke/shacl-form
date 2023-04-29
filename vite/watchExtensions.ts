
export function watchExtensions(extensions: Array<string>) {
  return {
    name: 'watch-extensions',
    enforce: 'post' as const,
    handleHotUpdate({ file, server }) {
      if (extensions.some(extension => file.endsWith(`.${extension}`))) {
        console.log('reloading file...');

        server.ws.send({
          type: 'full-reload',
          path: '*'
        });
      }
    },
  }
}
