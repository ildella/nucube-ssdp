import {expect, test} from 'vitest'
import {createNodejsSSDP} from '@ildella/nucube-ssdp/node'
import {scan, fetchServicesDetails} from '@ildella/nucube-ssdp/discovery'
import {run} from '@ildella/nucube-ssdp/import'
import {parseSSDPOriginal} from '../src/ssdp-parsers.js'

test('public api imports', () => {
  expect(createNodejsSSDP).toBeInstanceOf(Function)
  expect(scan).toBeInstanceOf(Function)
  expect(fetchServicesDetails).toBeDefined()
  expect(run).toBeInstanceOf(Function)
})

test('parser preserves headers and remote info', () => {
  const message = Buffer.from(
    'HTTP/1.1 200 OK\r\n' +
    'LOCATION: http://192.168.1.3:8200/rootDesc.xml\r\n' +
    'ST: urn:schemas-upnp-org:device:MediaServer:1\r\n' +
    '\r\n'
  )

  const parsed = parseSSDPOriginal(message, {
    address: '192.168.1.3',
    port: 1900,
    family: 'IPv4',
    size: message.length,
  })

  expect(parsed).toEqual({
    location: 'http://192.168.1.3:8200/rootDesc.xml',
    st: 'urn:schemas-upnp-org:device:MediaServer:1',
    address: '192.168.1.3',
    port: 1900,
    family: 'IPv4',
    size: message.length,
  })
})
