import { createServer } from 'vite'

console.log('creating...')
const server = await createServer({
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  clearScreen: false,
})
console.log('created, listening...')
await server.listen()
server.printUrls()
console.log('READY')
