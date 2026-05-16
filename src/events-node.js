import events from 'events'

export default {
  createEventEmitter: () => new events.EventEmitter(),
  // emit: (emitter, event, ...args) => emitter.emit(event, ...args),
  // on: (emitter, event, listener) => emitter.on(event, listener),
  // removeAllListeners: emitter => emitter.removeAllListeners(),
}
