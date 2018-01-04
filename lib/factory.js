const { authWithToken, flushRules, postRule, getRules } = require('./http-client')
    , VKSocket = require('./ws-client')

async function setupStream(stream, serviceKey, rules) {
  try {
    const { endpoint, key } = await authWithToken(serviceKey)

    await flushRules(endpoint, key)

    for (let rule of rules)
      await postRule(endpoint, key, { rule })

    stream._websocketSettings.connectionString = `wss://${endpoint}/stream?key=${key}`
    stream._initializeSocket()
  } catch (error) {
    stream.emit('error', error)
  }
}

module.exports = (serviceKey, rules) => {
  const stream = new VKSocket()
  setImmediate(() => setupStream(stream, serviceKey, rules))
  return stream
}
