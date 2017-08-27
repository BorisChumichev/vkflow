const rpvk = require('./vk-request.js')

module.exports = async vkAccessToken =>
  rpvk({ url: `https://api.vk.com/method/streaming.getServerUrl?access_token=${vkAccessToken}&v=5.64` })
