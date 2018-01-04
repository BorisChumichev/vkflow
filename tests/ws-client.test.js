require('dotenv').config()

const test = require('ava')
  , { Readable } = require('stream')
  , VKStream = require('../lib/ws-client')
  , VKWSServerMock = require('./vk-ws-server-mock')

test('Extends Readable Stream', t => {
  t.true(VKStream.prototype instanceof Readable)
})

test('Creates datasource and streams events from it', async t => {
  const connectionString = VKWSServerMock.messagingWS()
    , stream = new VKStream(connectionString)

  await new Promise((resolve, reject) => {
    stream.on('data', () => { t.pass(); resolve() })
  })
})

test('Emits a socket initialization error if it occures', async t => {
  const stream = new VKStream('abc')

  await new Promise((resolve, reject) => {
    stream.on('error', () => { t.pass(); resolve() })
    stream.on('data', () => {})
  })
})

test('Can optionally listen to service messages', async t => {
  const connectionString = VKWSServerMock.serviceWS()
    , stream = new VKStream(connectionString, { socket: { omitServiceMessages: false } })

  await new Promise((resolve, reject) => {
    stream.on('data', () => {
      t.pass()
      resolve()
    })
  })
})

test('Emits an error if receives invalid message', async t => {
  const connectionString = VKWSServerMock.invalidWS()
    , stream = new VKStream(connectionString)

  await new Promise((resolve, reject) => {
    stream.on('error', () => { t.pass(); resolve() })
    stream.on('data', () => {})
  })
})

test('Emits an error if receives a message with error code', async t => {
  const connectionString = VKWSServerMock.erroringWS()
    , stream = new VKStream(connectionString)

  await new Promise((resolve, reject) => {
    stream.on('error', () => { t.pass(); resolve() })
    stream.on('data', () => {})
  })
})

