const net = require('net')
const RawClient = require('./raw-client')
const privateData = Symbol('privateData')

class InsecticideServer {
  constructor (port) {
    const server = net.createServer()

    this[privateData] = {
      server,
      clients: {},
      pendingClients: []
    }

    const data = this[privateData]

    server.on('connection', (client) => {
      const wrapped = new RawClient(client)

      wrapped.request('INIT\n').then((msg) => {
        const split = msg.split(';')

        if (split[0] === 'OK') {
          const obj = {
            client: wrapped,
            path: split[2]
          }

          if (data.pendingClients[split[1]]) {
            data.pendingClients[split[1]].resolve(obj)
          } else {
            data.clients[split[1]] = obj
          }
        }
      })
    })

    server.listen(port)
  };

  getClient (id) {
    const obj = {}

    obj.promise = new Promise((resolve) => {
      const data = this[privateData]

      obj.resolve = resolve

      if (data.clients[id]) {
        resolve(data.clients[id])
      } else if (data.pendingClients[id]) {
        data.pendingClients[id].promise.then(resolve)
      } else {
        data.pendingClients[id] = obj
      }
    })

    return obj.promise
  }
}

module.exports = InsecticideServer
