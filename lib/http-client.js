const rp = require('request-promise')
  , bb = require('bluebird')
  , { merge, partial, omit } = require('ramda')
  , url = require('url-assembler')

const _makeVKAPICall = async (method, params) =>
  rp(
    { json: true
    , url: url('https://api.vk.com')
      .template('/method/:method')
      .param({ method })
      .query(merge({ v: '5.92' }, params))
      .toString()
    }
  )
  .then(res => {
    if (res.error) throw res.error['error_msg']
    return res.response
  })

const _makeVKStreamingAPICall = async (endpoint, key, method, body) =>
  rp(
    { json: true
    , method
    , url: `https://${endpoint}/rules?key=${key}`
    , body
    }
  ).then(res => {
    if (res.code !== 200) throw res.error
    return res
  })

const authWithToken = async vkAccessToken =>
  _makeVKAPICall(
    'streaming.getServerUrl',
    { 'access_token': vkAccessToken }
  )

const getSettings = async vkAccessToken =>
  _makeVKAPICall(
    'streaming.getSettings',
    { 'access_token': vkAccessToken }
  )

const getStem = async (vkAccessToken, params) =>
  _makeVKAPICall(
    'streaming.getStem',
    { 'access_token': vkAccessToken, ...params }
  )

const getStats = async (vkAccessToken, params) =>
  _makeVKAPICall(
    'streaming.getStats',
    { 'access_token': vkAccessToken, ...params }
  )

const getRules = async (endpoint, key) =>
  _makeVKStreamingAPICall(endpoint, key, 'GET')

const postRule = async (endpoint, key, rule) =>
  _makeVKStreamingAPICall(endpoint, key, 'POST', rule)

const deleteRule = async (endpoint, key, rule) =>
  _makeVKStreamingAPICall(endpoint, key, 'DELETE', rule)

const flushRules = async (endpoint, key) => {
  const { rules } = await getRules(endpoint, key)

  if (!rules) return

  await bb.resolve(rules)
    .map(omit('value'))
    .mapSeries(partial(deleteRule, [ endpoint, key ]))
}

/**
 * Exports a set of low level methods to interact
 * with VK API over HTTP.
 */
module.exports =
  { authWithToken
  , getRules
  , postRule
  , deleteRule
  , flushRules
  , getSettings
  , getStem
  , getStats
  }
