import {XMLParser} from 'fast-xml-parser'

export const parser = new XMLParser({
  ignoreAttributes: false,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: true,
  trimNodeName: true,
  trimAttributeName: true,
})
