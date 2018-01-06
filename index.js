const vkflow = require('./lib/factory')
  , WSClient = require('./lib/ws-client')
  , HTTPClient = require('./lib/http-client')

vkflow.VKWebSocket = WSClient
vkflow.VKStreamingAPI = HTTPClient

module.exports = vkflow
