require('dotenv').config()

const test = require('ava')
  , { has } = require('ramda')
  , HTTPClient = require('../lib/http-client')

/*
  Flushing all the rules for the stream before
  we run any tests, as well as cleaning the ones
  that created during testing
*/

const cleanUp = async () => {
  const { endpoint, key } = await HTTPClient.authWithToken(process.env['VK_ACCESS_TOKEN'])
  return HTTPClient.flushRules(endpoint, key)
}

test.before(cleanUp)
test.after(cleanUp)

const sampleRule = () =>
  ({ rule:
    { value: Math.random().toString(32).slice(2)
    , tag: Math.random().toString(32).slice(10)
    }
  })

test('Authenticates via access token and retrieves an endpoint and key', async t => {
  const { endpoint, key } = await HTTPClient.authWithToken(process.env['VK_ACCESS_TOKEN'])
  key && endpoint
    ? t.pass()
    : t.fail()
})

test('Rejects with an error when access token is invalid', async t => {
  try {
    await HTTPClient.authWithToken('💩')
  } catch (err) {
    t.pass()
  }
})

test('Fetches stream rules', async t => {
  const { endpoint, key } = await HTTPClient.authWithToken(process.env['VK_ACCESS_TOKEN'])
    , response = await HTTPClient.getRules(endpoint, key)

  t.true(response.code === 200)
  t.true(has('rules', response))
  t.pass()
})

test('Propagates an error if it occures', async t => {
  const rule = sampleRule()
    , { endpoint, key } = await HTTPClient.authWithToken(process.env['VK_ACCESS_TOKEN'])

  try {
    while (true) await HTTPClient.postRule(endpoint, key, rule)
  } catch(err) {
    t.true(err.error_code === 2001)
    t.pass()
  }
  
})

test('Adds rules', async t => {
  const { endpoint, key } = await HTTPClient.authWithToken(process.env['VK_ACCESS_TOKEN'])
    , response = await HTTPClient.postRule(endpoint, key, sampleRule())

  t.true(response.code === 200)
  t.pass()
})

test('Deletes the rules', async t => {
  const rule = sampleRule()
    , { endpoint, key } = await HTTPClient.authWithToken(process.env['VK_ACCESS_TOKEN'])
    , response = await HTTPClient.postRule(endpoint, key, rule)

  t.true(response.code === 200)
  t.pass()
})
