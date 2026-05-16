export const parseSSDP = (message, rinfo) => {
  const lines = message.toString().split('\r\n')
  const parsed = {
    timestamp: Date.now(),
    remote: {
      address: rinfo.address,
      port: rinfo.port,
      family: rinfo.family,
      size: rinfo.size,
    },
    headers: {},
    raw: message.toString(),
  }

  // Parse the first line (HTTP method/status)
  if (lines[0]) {
    parsed.firstLine = lines[0].trim()
  }

  // Parse headers
  lines.slice(1).forEach(line => {
    const delimIndex = line.indexOf(':')
    if (delimIndex > 0) {
      const key = line.substring(0, delimIndex).trim()
        .toLowerCase()
      const value = line.substring(delimIndex + 1).trim()
      parsed.headers[key] = value

      // Also add as direct properties for backward compatibility
      parsed[key] = value
    }
  })

  return parsed
}

/**
     * @description Parses the SSDP message to JSON
     * @param {Buffer} message - The SSDP raw message buffer
     * @param {dgram.RemoteInfo} rinfo - UDP remote information
     * @returns {json} - The SSDP message in JSON
     */
export const parseSSDPOriginal = (message, rinfo) => {
  const lines = message.toString().split('\r\n')
  const ssdp = {}

  lines.forEach(line => {
    // Separate key:value
    const delim = line.indexOf(':')
    if (delim > 1) {
      const key = line.substring(0, delim).trim()
        .toLowerCase()
      const value = line.substring(delim + 1).trim()
      ssdp[key] = value
    }
  })

  Object.keys(rinfo).forEach(key => {
    ssdp[key] = rinfo[key]
  })

  return ssdp
}
