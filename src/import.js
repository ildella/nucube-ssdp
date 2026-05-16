import {EOL} from 'os'
import {writeFile} from 'fs/promises'
import {mapToJsonArray} from './utils.js'
import {MediaServer, OpenHome} from './upnp-constants.js'
import {scan, fetchServicesDetails} from './discovery.js'

const writeJson = async (path, json) => {
  await writeFile(
    path,
    `${JSON.stringify(json)}${EOL}`,
  )
  return json
}

export const run = async ({time = 5000} = {}) => {
  const {stream, stop} = scan()
  const servicesMap = new Map()
  const machinesMap = new Map()
  const accumulate = stream
    .filter(({st}) => st === MediaServer || st === OpenHome)
    .through(fetchServicesDetails)
    // .map(({address, friendlyName, ...rest}) => {
    //   if (address.startsWith('100.'))
    //     return {...rest, address, friendlyName: `${friendlyName} (on Tailscale)`}
    //   return {address, friendlyName, ...rest}
    // })
    .pick(['address', 'deviceType', 'friendlyName', 'href'])
    .tap(service => servicesMap.set(service.href, service))
    .tap(service => machinesMap.set(service.address, service))
  setTimeout(() => {
    stop()
  }, time)
  await accumulate
    .errors(error => console.warn(error))
    .values()
  const services = mapToJsonArray(servicesMap)
  const machines = mapToJsonArray(machinesMap)
  await writeJson('ssdp.json', services)
  return {services, machines}
}
