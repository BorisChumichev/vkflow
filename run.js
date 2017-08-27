require('dotenv').config()

const auth = require('./lib/auth')

auth(process.env['VK_ACCESS_TOKEN'])
  .then(res => console.log(res))
  // configure rp-vk with { endpoint, key } passed by previous method
