const rp = require('request-promise')
  , { merge } = require('ramda')
  , url = require('url-assembler')

const _makeAPICall = async (method, queryParams) =>
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

const _authWithToken = async vkAccessToken =>
  _makeAPICall(
    'streaming.getServerUrl',
    { 'access_token': vkAccessToken }
  )


/*
  We are exporting private methods here in order to test them.
  It’s ok since we don’t actually expose them to the end users
  see /index.js to see what gets exposed.
*/
module.exports =
  { _authWithToken
  }
