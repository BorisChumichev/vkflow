const VKStream = require('./lib/vk-stream.js')

module.exports = () =>
  new VKStream(
    arguments.length === 1
      ? { rules: arguments[1] }
      : { token: arguments[0]
        , rules: arguments[1]
        }
  )
