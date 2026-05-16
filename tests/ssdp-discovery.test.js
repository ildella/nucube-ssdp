import {expect, test, vi} from 'vitest'
import {scan, fetchServicesDetails} from '@ildella/nucube-ssdp/discovery'

const MediaServer = 'urn:schemas-upnp-org:device:MediaServer:1'
const ContentDirectory = 'urn:schemas-upnp-org:service:ContentDirectory:1'
const MediaRenderer = 'urn:schemas-upnp-org:device:MediaRenderer:1'
const OpenHome = 'urn:av-openhome-org:device:Source:1'
const AVTransport = 'urn:schemas-upnp-org:service:AVTransport:1'
const Time = 'urn:av-openhome-org:service:Time:1'
const Volume = 'urn:av-openhome-org:service:Volume:1'
const Playlist = 'urn:av-openhome-org:service:Playlist:1'

vi.setConfig({testTimeout: 5_000})

test('SSDP scan basic', async () => {
  const {stream, stop} = scan()
  const check = stream
  setTimeout(() => {
    stop()
  }, 3000)
  const response = await check
  expect(response).toBeDefined()
})

test.sequential('SSDP scan for ContentDirectory', async () => {
  const {stream, stop} = await scan()
  const check = stream
    .where({st: ContentDirectory})
    .through(fetchServicesDetails)
    .groupBy('href')
  setTimeout(() => {
    stop()
  }, 3000)
  const groupedByHref = await check
    .errors(error => console.warn(error))
    .value()
  const allLibraries = Object.keys(groupedByHref)
  expect(allLibraries.length).toBeGreaterThan(1)
  expect(allLibraries.length).toBeLessThan(5)
  const uniqueDevices = Object.values(groupedByHref).map(group => group[0])
  expect(uniqueDevices.length).toBeGreaterThan(1)
  expect(uniqueDevices.length).toBeLessThan(5)
  uniqueDevices.forEach(device => {
    expect(device).toHaveProperty('address')
    expect(device).toHaveProperty('href')
    expect(device).toHaveProperty('services')
    expect(device).toHaveProperty('deviceType', MediaServer)
    const {services} = device
    expect(services[0].serviceType).toEqual(ContentDirectory)
  })
})

test.sequential('SSDP scan OpenHome', async () => {
  const {stream, stop} = scan()
  const check = stream
    .where({st: OpenHome})
    .through(fetchServicesDetails)
    .groupBy('href')
  setTimeout(() => {
    stop()
  }, 3000)
  const groupedByHref = await check
    .errors(error => console.warn(error))
    .value()
  const uniqueDevices = Object.values(groupedByHref).map(group => group[0])
  expect(uniqueDevices.length).toBeGreaterThanOrEqual(1)
  expect(uniqueDevices.length).toBeLessThan(5)
  uniqueDevices.forEach(device => {
    expect(device).toHaveProperty('address')
    expect(device).toHaveProperty('href')
    expect(device).toHaveProperty('services')
    expect(device).toHaveProperty('deviceType', OpenHome)
    const {services} = device
    expect(services).toHaveLength(7)
    expect(services[0].serviceType).toEqual(Time)
    expect(services[1].serviceType).toEqual(Volume)
    expect(services[3].serviceType).toEqual(Playlist)
  })
})

test.sequential('SSDP full standard scan', async () => {
  const {stream, stop} = scan()
  const check = stream
    .where({st: MediaRenderer})
    .through(fetchServicesDetails)
    .groupBy('href')
  setTimeout(() => {
    stop()
  }, 3000)
  const groupedByHref = await check
    .errors(error => console.warn(error))
    .value()
  const allRenderers = Object.keys(groupedByHref)
  expect(allRenderers.length).toBeGreaterThanOrEqual(1)
  expect(allRenderers.length).toBeLessThan(4)
  const uniqueDevices = Object.values(groupedByHref).map(group => group[0])
  expect(uniqueDevices.length).toBeGreaterThanOrEqual(1)
  expect(uniqueDevices.length).toBeLessThan(5)
  uniqueDevices.forEach(device => {
    expect(device).toHaveProperty('address')
    expect(device).toHaveProperty('href')
    expect(device).toHaveProperty('services')
    expect(device).toHaveProperty('deviceType', MediaRenderer)
    const {services} = device
    expect(services[0].serviceType).toEqual(AVTransport)
  })
})
