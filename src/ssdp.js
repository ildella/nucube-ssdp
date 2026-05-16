import {v4 as uuidv4} from 'uuid'
import messages from './messages.js'
import {parseSSDPOriginal} from './ssdp-parsers.js'

// eslint-disable-next-line max-lines-per-function
export const createSSDP = ({dgram, events}, {
  host,
  port,
  customLocation,
  product,
  product_version,
  device_name,
}) => {
  const socket = dgram.createSocket({type: 'udp4', reuseAddr: true})
  const uniSocket = dgram.createSocket({type: 'udp4', reuseAddr: true})
  const em = events.createEventEmitter()
  const deviceUUID = uuidv4()
  const deviceName = device_name
  const location = host + ':' + port + customLocation
  uniSocket.bind(this.port)
  const services = []

  /**
   * @description Sends a response message to an m-search
   * @param {string} usn - Unique service name
   * @param {string} host - Address for the unicast response
   * @param {string} port - Port for the unicast response
  */
  const response = (usn, host, port) => {
    const response = messages.response(location, usn, product, product_version)
    const ssdp = Buffer.alloc(response.length, response)

    uniSocket.send(ssdp, 0, ssdp.length, port, host, err => {
      if (err) {
        uniSocket.close()
        em.emit('error', 'Error sending response')
      }
    })
  }

  /**
   * @description Sends a ssdp:alive notify message
   * @param {string} usn - Unique service name
  */
  const advertise = usn => {
    const notify = messages.notify_alive(location, usn, product, product_version)
    const ssdp = Buffer.alloc(notify.length, notify)

    socket.send(
      ssdp,
      0,
      ssdp.length,
      messages.config.MULTICAST_PORT,
      messages.config.MULTICAST_ADDRESS,
      err => {
        if (err) {
          socket.close()
          em.emit('error', 'Error sending ssdp:alive')
        }
      }
    )
  }

  const start = () => {
    // Wait for the socket to be able to receive data
    socket.on('listening', () => {
      // Well-known multicast address for SSDP
      socket.addMembership(messages.config.MULTICAST_ADDRESS)

      // Three alive messages for the root device
      advertise('upnp:rootdevice')
      advertise(deviceUUID)
      advertise('urn:schemas-upnp-org:device:' + deviceName + ':1')

      // One alive message for each service
      services.forEach(service => {
        advertise(service)
      })
    })

    socket.on('message', (message, rinfo) => {
      const m = message.toString()
      // const ssdp = parseSSDP(message, rinfo)
      const ssdp = parseSSDPOriginal(message, rinfo)
      if (m.includes('M-SEARCH')) {
        // Advertise the service
        if (ssdp.st === 'ssdp:all') {
          // Three response messages for the root device
          response('upnp:rootdevice', ssdp.address, ssdp.port)
          response(deviceUUID, ssdp.address, ssdp.port)
          response('urn:schemas-upnp-org:device:' + deviceName + ':1', ssdp.address, ssdp.port)

          // One response message for each service
          services.forEach(service => {
            response(service, ssdp.address, ssdp.port)
          })
        } else {
          services.forEach(service => {
            if (ssdp.st.includes(service))
              response(service, ssdp.address, ssdp.port)
          })
        }
      } else if (m.includes('NOTIFY')) {
        em.emit('notify', ssdp)
      } else {
        em.emit('discover', ssdp)
      }
    })

    socket.on('error', err => {
      socket.close()
      em.emit('error', 'Error on UDP multicast socket: ' + err)
    })

    socket.bind(messages.config.MULTICAST_PORT)
  }

  const stop = async () => {
    if (services.length > 0) {
      const promises = services.map(service => new Promise(resolve => {
        const notify = messages.notify_bye(service)
        const ssdp = Buffer.alloc(notify.length, notify)
        socket.send(
          ssdp,
          0,
          ssdp.length,
          messages.config.MULTICAST_PORT,
          messages.config.MULTICAST_ADDRESS,
          () => {
            resolve() // Resolve regardless of error
          }
        )
      }))

      await Promise.all(promises)
    }
    em.removeAllListeners()
    return new Promise(resolve => {
      socket.close(() => {
        uniSocket.close(() => {
          resolve()
        })
      })
    })
  }

  /**
   * @description Event listener
   * @param {string} eventName - The name of the event
   * @param {callback} callback
  */
  const on = (eventName, callback) => {
    em.on(eventName, ssdp => {
      callback(ssdp)
    })
  }

  /**
   * @description Sends an M-SEARCH message to discover services
   * @param {string} [st = "ssdp:all"] - The search target
   * @param {string} host - The host target for the discovery message
   * @param {number} port - The port target for the discovery message
  */
  const discover = (
    st = 'ssdp:all',
    host = messages.config.MULTICAST_ADDRESS,
    port = messages.config.MULTICAST_PORT
  ) => {
    const msearch = messages.msearch(st, host, port)
    const ssdp = Buffer.alloc(msearch.length, msearch)

    socket.send(ssdp, 0, ssdp.length, port, host, err => {
      if (err) {
        socket.close()
        em.emit('error', 'Error on UDP socket for M-SEARCH: ' + err)
      }
    })
  }

  return {
    start,
    stop,
    on,
    discover,
  }
}
