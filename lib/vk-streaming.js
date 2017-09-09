const rp = require('request-promise')
  , bb = require('bluebird')
  , { merge, partial, omit } = require('ramda')
  , url = require('url-assembler')

const makeVKAPICall = async (method, params) =>
  rp(
    { json: true
    , url: url('https://api.vk.com')
      .template('/method/:method')
      .param({ method })
      .query(merge({ v: '5.64' }, params))
      .toString()
    }
  )
  .then(res => {
    if (res.error) throw res.error['error_msg']
    return res.response
  })

const makeVKStreamingAPICall = async (endpoint, key, method, body) =>
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
  makeVKAPICall(
    'streaming.getServerUrl',
    { 'access_token': vkAccessToken }
  )

const getRules = async (endpoint, key) =>
  makeVKStreamingAPICall(endpoint, key, 'GET')

const postRule = async (endpoint, key, rule) =>
  makeVKStreamingAPICall(endpoint, key, 'POST', rule)

const deleteRule = async (endpoint, key, rule) =>
  makeVKStreamingAPICall(endpoint, key, 'DELETE', rule)

const flushRules = async () => {
  const { endpoint, key } = await authWithToken(process.env['VK_ACCESS_TOKEN'])
  const { rules } = await getRules(endpoint, key)

  if (!rules) return

  await bb.resolve(rules)
    .map(omit('value'))
    .mapSeries(partial(deleteRule, [ endpoint, key ]))
}


module.exports =
  { authWithToken
  , getRules
  , postRule
  , deleteRule
  , flushRules
  }
