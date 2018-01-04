require('dotenv').config()

const vkstream = require('../lib/factory')
  , HTTPClient = require('../lib/http-client')
  , test = require('ava')

// top-25 most frequently used lemmas in russian
// (http://dict.ruslang.ru/freq.php?act=show&dic=freq_freq)
const rules =
  [ 'и', 'в', 'не', 'на', 'я', 'быть', 'он', 'с', 'что', 'а', 'по'
  , 'это', 'она', 'этот', 'к', 'но', 'они', 'мы', 'как', 'из', 'у'
  , 'который', 'то', 'за', 'свой'].map(
      (lemma, i) =>
        ({ value: lemma, tag: `stop${i}`})
    )


const cleanUp = async () => {
  const { endpoint, key } = await HTTPClient.authWithToken(process.env['VK_ACCESS_TOKEN'])
  return HTTPClient.flushRules(endpoint, key)
}

test.before(cleanUp)
test.after(cleanUp)

test('Creates datasource', async t => {
  const stream = vkstream(process.env['VK_ACCESS_TOKEN'], rules)

  await new Promise((resolve, reject) => {
    stream.on('data', () => { t.pass(); resolve() })
  })
})

test('Emits an error if it occures', async t => {
  const stream = vkstream('💩', rules)

  await new Promise((resolve, reject) => {
    stream.on('error', () => { t.pass(); resolve() })
  })
})
