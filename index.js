const vkstream = require('./lib/factory')
  , WSClient = require('./lib/ws-client')
  , HTTPClient = require('./lib/http-client')

vkstream.VKWebSocket = WSClient
vkstream.VKStreamingAPI = HTTPClient

module.exports = vkstream
