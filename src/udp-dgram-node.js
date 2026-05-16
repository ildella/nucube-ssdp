import dgram from 'dgram'

export default {
  createSocket: options => dgram.createSocket(options),
  // send: (socket, buffer, offset, length, port, address, callback) => {
  //   socket.send(buffer, offset, length, port, address, callback)
  // },
  // bind: (socket, port) => socket.bind(port),
  // close: (socket, callback) => socket.close(callback),
  // addMembership: (socket, address) => socket.addMembership(address),
  // on: (socket, event, listener) => socket.on(event, listener),
}
