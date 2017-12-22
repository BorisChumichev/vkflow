const Server = require('ws').Server
  , delay = require('await-delay')
  , EPHEMERAL_PORT_RANGE = [ 49152, 65535 ] // https://tools.ietf.org/html/rfc6335
  , MESSAGE_DELAY = 1e2
  , MESSAGE_POST = '{ "code": 100 }'
  , MESSAGE_SERVICE = '{ "code": 300 }'
  , MESSAGE_ERROR = '{ "code": 400, "error": "Some error" }'

const randomPort = ((usedPorts = []) =>
  function generatePort() {
    const port = Math.floor(
        EPHEMERAL_PORT_RANGE[0]
        + Math.random()
        * ( EPHEMERAL_PORT_RANGE[1]
          - EPHEMERAL_PORT_RANGE[0]
          )
        )

    if (!~usedPorts.indexOf(port)) {
      usedPorts.push(port)
      return port
    } else {
      generatePort()
    }
  }
)()

const createWSS = connectionHandler => {
  const port = randomPort()
    , wss = new Server({ port })

  wss.on('connection', connectionHandler)
  return `ws://localhost:${port}`
}

const messagingWS = () => createWSS(
  async ws => {
    await delay(MESSAGE_DELAY)
    ws.send(MESSAGE_POST)
  }
)

const serviceWS = () => createWSS(
  async ws => {
    await delay(MESSAGE_DELAY)
    ws.send(MESSAGE_SERVICE)
  }
)

const invalidWS = () => createWSS(
  async ws => {
    await delay(MESSAGE_DELAY)
    ws.send('}') 
  }
)

const erroringWS = () => createWSS(
  async ws => {
    await delay(MESSAGE_DELAY)
    ws.send(MESSAGE_ERROR) 
  }
)

module.exports =
  { messagingWS
  , serviceWS
  , invalidWS
  , erroringWS
  }
