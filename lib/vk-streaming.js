const rp = require('request-promise')
  , { merge } = require('ramda')
  , url = require('url-assembler')

const makeVKAPICall = async (method, queryParams) =>
  rp(
      { json: true
      , url: url('https://api.vk.com')
        .template('/method/:method')
        .param({ method })
        .query(merge({ v: '5.64' }, queryParams))
        .toString()
      }
    )
    .then(res => {
      if (res.error) throw new Error(res.error['error_msg'])
      return res.response
    })

const makeVKStreamingAPICall = async (method, queryParams) =>
  rp(
      { json: true
      , url: url('https://api.vk.com')
        .template('/method/:method')
        .param({ method })
        .query(merge({ v: '5.64' }, queryParams))
        .toString()
      }
    )
    .then(res => {
      if (res.error) throw new Error(res.error['error_msg'])
      return res.response
    })

const authWithToken = async vkAccessToken =>
  makeVKAPICall(
    'streaming.getServerUrl',
    { 'access_token': vkAccessToken }
  )

module.exports =
  { authWithToken
  }
