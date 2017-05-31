const privateData = Symbol('privateData')

function rejectCurrent (reason, data) {
  if (data.current) {
    data.current.reject(new Error(reason || 'Forcefully rejected'))
    data.current = null
    // Note here, even though current is null waiting is still true
    // This shouldn't be a problem
  }
}

function resolveCurrent (response, data) {
  if (data.current) {
    data.current.resolve(response)
    data.current = null

    data.waiting = false
    doSend()
  }
}

function doSend (data) {
  if (!data.waiting && data.pending.length > 0 && !data.closed) {
    send(data)
  }
}

function send (data) {
  if (!data.waiting) {
    data.waiting = true
    data.current = data.pending.shift()

    data.client.write(data.current.message)
  }
}

class RawClient {
  constructor (client) {
    this[privateData] = {
      pending: [],
      waiting: false,
      current: null,

      closed: false,

      doNotEnd: false,

      incompleteResponse: '',

      client
    }

    const data = this[privateData]

    client.setEncoding('utf8')

    client.on('data', (buf) => {
      const response = data.incompleteResponse + buf

      if (!data.indexOf('\n')) {
        data.incompleteResponse = response
      } else {
        resolveCurrent(response.split('\n')[0], data)
        data.incompleteResponse = ''
      }
    })

    client.on('error', (err) =>
      rejectCurrent(err.message, data)
      // Here we could set waiting to false and call doSend()
      // But the 'close' event will probably be fired right after 'error'
    )

    client.on('close', () => {
      // No need to send FIN packet
      data.doNotEnd = true
      this.close()
    })
  };

  get pendingRequests () {
    return this[privateData].pending.length
  };

  get isWaiting () {
    return this[privateData].waiting
  };

  get isOpen () {
    return !this[privateData].closed
  }

  request (message) {
    if (this[privateData].closed) {
      return Promise.reject(new Error('Closed Client'))
    }

    return new Promise((resolve, reject) => {
      this[privateData].pending.push({
        resolve,
        reject,
        message
      })

      doSend(this[privateData])
    })
  };

  clearPending (reason) {
    if (this.pending > 0) {
      this[privateData].pending.forEach(obj =>
        obj.reject(new Error(reason || 'Cleared pending requests'))
      )
    }

    this[privateData].pending = []
  };

  close () {
    // Reject all the requests
    this.clearPending('Closed Client')
    rejectCurrent('Closed Client', this[privateData])

    // Send FIN packet if needed
    if (!this[privateData].doNotEnd) {
      this[privateData].client.end()
    }

    // Destroy the client object entirely
    this[privateData].client.unref()
    this[privateData].client = undefined

    this[privateData].closed = true
  }
}

module.exports = RawClient
