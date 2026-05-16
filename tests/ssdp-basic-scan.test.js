import {randomInt} from 'crypto'
import {expect, test} from 'vitest'
import {createNodejsSSDP} from '@ildella/nucube-ssdp/node'

const port = randomInt(1999, 9999)

const ssdp = createNodejsSSDP({
  device_name: `TestDevice${port}`,
  port,
})
const services = []

test('should behave...', async () => {
  ssdp.on('notify', data => {
    if (data.nts === 'ssdp:byebye') {
      console.info('Service bye bye.')
    }
  })
  ssdp.on('discover', data => {
    services.push(data)
  })
  ssdp.on('error', error => {
    console.warn(error)
  })
  expect.assertions(1)
  await ssdp.start()
  ssdp.discover()
  await new Promise(resolve => setTimeout(resolve, 3000))
  console.info('SSDP discover stopping...')
  await ssdp.stop()
  console.info('SSDP discover stopped.')
  expect(services).toBeInstanceOf(Array)
}, 4000)
