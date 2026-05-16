import SimpleSSDP from './original.js'
import __ from 'exstream.js'
import {randomInt} from './utils.js'
import {parser} from './xml-parser.js'

const {pipeline, nil} = __

const randomPort = () => 1024 + randomInt({max: 64511})

export const scan = ({name, port = randomPort()} = {}) => {
  const ssdp = new SimpleSSDP({
  // const ssdp = createNodejsSSDP({
    device_name: name || `TestDevice${port}`,
    port,
    // location: '/xml/description.xml',
    // product: 'TestDiscovery',
    // product_version: '1.1',
  })
  const stream = __()
  ssdp.on('notify', data => {
    if (data.nts === 'ssdp:byebye') {
      console.info('Service bye bye.')
    }
  })
  ssdp.on('discover', data => {
    // console.info('DISCOVERED |', data.location)
    stream.write(data)
  })
  ssdp.on('error', error => {
    console.warn(error)
    stream.write(null, error)
  })
  ssdp.start()
  ssdp.discover(
    // 'ssdp:all',
    // searchTarget,
    // host,
    // port,
  )
  const stop = () => {
    ssdp.stop()
      .then(() => {
        stream.write(nil)
      })
      .catch(error => console.warn(error.message))
  }
  return {stream, stop}
}

export const fetchServicesDetails = pipeline()
  .pick(['st', 'address', 'port', 'location', 'server'])
  .map(async ({location, st, ...rest}) => {
    const response = await fetch(location)
    const xml = await response.text()
    const {root: {specVersion, device}} = await parser.parse(xml)
    const {serviceList, ...deviceInfo} = device
    return {
      href: location,
      deviceType: st,
      ...deviceInfo,
      ...rest,
      services: serviceList.service,
      specVersion,
    }
  })
  .resolve()
