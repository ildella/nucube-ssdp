import dgramNode from './udp-dgram-node.js'
import eventsNode from './events-node.js'
import {createSSDP} from './ssdp.js'

export const createNodejsSSDP = config => createSSDP({
  dgram: dgramNode,
  events: eventsNode,
}, config)
