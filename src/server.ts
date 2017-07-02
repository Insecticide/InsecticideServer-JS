import * as net from 'net'
import InsecticideClient from './client'

export interface ConnectedClient {
  client: InsecticideClient,
  path: string
}

interface PendingClient {
  resolve?: (client: ConnectedClient) => void,
  reject?: (err: Error) => void,
  promise?: Promise <ConnectedClient>
}

export default class InsecticideServer {
  private server?: net.Server
  private clients: Map <string, ConnectedClient>
  private pendingClients: Map <string, PendingClient>

  constructor (port: number) {
    this.server = net.createServer()

    const remove = (id: string) => {
      this.clients.delete(id)
      this.pendingClients.delete(id)
    }

    this.server.on('connection', client => {
      const wrapped = new InsecticideClient(client, remove)

      wrapped.init().then(msg => {
        if (msg.path && msg.id) {
          const obj = {
            client: wrapped,
            path: msg.path
          }

          const pending = this.pendingClients.get(msg.id)
          if (pending && pending.resolve) {
            pending.resolve(obj)
          } else {
            this.clients.set(msg.id, obj)
          }
        }
      }).catch(() => { return }) // We don't care about errors here
    })

    this.server.listen(port)
  }

  getClient (id: string): Promise <ConnectedClient> {
    const pending = this.pendingClients.get(id)
    if (pending && pending.promise) {
      return pending.promise
    }

    const obj: PendingClient = {}

    obj.promise = new Promise((resolve, reject) => {
      obj.resolve = resolve
      obj.reject = reject

      if (!this.server) {
        reject(new Error('Server is closed'))
      }

      if (this.clients.has(id)) {
        resolve(this.clients.get(id))
      }

      this.pendingClients.set(id, obj)
    })

    return obj.promise
  }

  getClientsIDs (): ReadonlyArray <string> {
    const list: string[] = []

    this.clients.forEach((_, id) => {
      list.push(id)
    })

    return list
  }

  close () {
    return new Promise ((resolve) => {
      this.clients.forEach((value) => {
        value.client.close()
      })

      this.pendingClients.forEach((value) => {
        if (value.reject !== undefined) {
          value.reject(new Error('Server is closed'))
        }
      })

      this.pendingClients.clear()
      this.clients.clear()

      if (this.server !== undefined) {
        this.server.close(() => {
          if (this.server) {
            this.server.unref()
            this.server = undefined
          }
          resolve()
        })
      } else {
        resolve ()
      }
    })
  }
}
