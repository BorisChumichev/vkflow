require('dotenv').config()

const test = require('ava')
  , vkStreaming = require('../lib/vk-streaming')

test('Should authenticate via access token and retrieve an endpoint and key', async t => {
  const res = await vkStreaming.authWithToken(process.env['VK_ACCESS_TOKEN'])
  res.key && res.endpoint
    ? t.pass()
    : t.fail()
})

test('Should reject with an error when access token is invalid', async t => {
  try {
    await vkStreaming.authWithToken('poor_token_💩')
  } catch (err) {
    t.pass()
  }
})
