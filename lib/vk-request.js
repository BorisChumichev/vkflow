const rp = require('request-promise')
  , { prop, merge } = require('ramda')

async function catchError(errorResponse) {
  console.error(prop('error', errorResponse))
}

module.exports = async params =>
  rp(merge({ json: true }, params))
    .then(prop('response'))
    .catch(catchError)
