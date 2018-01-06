# VK Streaming API клиент для Node

Библиотека реализует два интерфейса для работы с Streaming API ВКонтакте:

1. Фабрика `vkstream` — позволяет легко создать поток с желаемым набором [правил](https://vk.com/dev/streaming_api_docs?f=2.%20%D0%A4%D0%BE%D1%80%D0%BC%D0%B0%D1%82%20%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB) и считывать из него сообщения;
2. Более низкоуровневые объекты `VKStreamingAPI` и `VKWebSocket` для случаев когда фабрика `vkstream` не даёт достаточной гибкости в работе с API.

#### Установка

```
npm install vkstream
```

## Использование фабрики `vkstream`

Для работы с `vkstream` достаточно вызвать фабрику, передав в качестве параметров [сервисный ключ приложения](https://vk.com/dev/access_token?f=3.%20%D0%A1%D0%B5%D1%80%D0%B2%D0%B8%D1%81%D0%BD%D1%8B%D0%B9%20%D0%BA%D0%BB%D1%8E%D1%87%20%D0%B4%D0%BE%D1%81%D1%82%D1%83%D0%BF%D0%B0) ВКонтакте и массив [правил фильтрации](https://vk.com/dev/streaming_api_docs?f=2.%20%D0%A4%D0%BE%D1%80%D0%BC%D0%B0%D1%82%20%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB).

##### Пример: чтение и отображение сообщений

``` javascript
const vkstream = require('vkstream');

const animalStream = vkstream(
  VK_SERVICE_KEY,
  [ { value: 'кот', tag: 'cats' }
  , { value: 'собака', tag: 'dogs' }
  , { value: 'попугай', tag: 'parrots' }
  ]
);

animalStream.on('data', data => console.log(data));
```

Каждое событие `'data'` содержит одно [сообщение](https://vk.com/dev/streaming_api_docs_2?f=7.%20%D0%A7%D1%82%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BF%D0%BE%D1%82%D0%BE%D0%BA%D0%B0) потока в виде строки формата JSON. [Сервисные сообщения](https://vk.com/dev/streaming_api_docs_2?f=7.1.%20Service%20message) игнорируются. Указанные правила фильтрации заменят собой те, что были заданы для этого потока ранее, если такие есть. При разрывах сетевого соедиения vkstream автоматически выполнит переподключение. При возникновении [ошибок](https://vk.com/dev/streaming_api_docs_2?f=8.%20%D0%A1%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D1%8F%20%D0%BE%D0%B1%20%D0%BE%D1%88%D0%B8%D0%B1%D0%BA%D0%B0%D1%85) сработает событие `'error'` с соответствующим объектом ошибки.

Объект, который создаёт фабрика, имплементирует [Readable Stream](https://nodejs.org/api/stream.html#stream_readable_streams), поэтому для работы с ним можно использовать не только, событийный подход, но и потоковый.

##### Пример: чтение и запись потока в файл с использованием Node Streams:

``` javascript
const { createWriteStream } = require('fs')
const vkstream = require('vkstream')

vkstream(VK_SERVICE_KEY, rules)
  .pipe(createWriteStream('destination.dat'))
```

## Использование `VKStreamingAPI` и `VKWebSocket`

Фабрика `vkstream` позволяет легко решить задачу чтения потока с предзаданными правилами фильтрации, но если необходимо реализовать иную логику работы с VK Streaming API, то предусмотрены более низкоуровневые сущности `VKStreamingAPI` и `VKWebSocket`.

### `VKStreamingAPI`

`VKStreamingAPI` — предоставляет методы для HTTP взаимодействий с VK Streaming API: с помощью него можно выполнять авторизацию (получение токена и эндпоинта) и управлять правилами потока.

Поддерживаемые методы:

#### `VKStreamingAPI.authWithToken` *(serviceKey:String) → Promise*

- `serviceKey` — [сервисный ключ приложения](https://vk.com/dev/access_token?f=3.%20%D0%A1%D0%B5%D1%80%D0%B2%D0%B8%D1%81%D0%BD%D1%8B%D0%B9%20%D0%BA%D0%BB%D1%8E%D1%87%20%D0%B4%D0%BE%D1%81%D1%82%D1%83%D0%BF%D0%B0) ВКонтакте.

Выполняет авторизацию VK Streaming API и возвращает Promise, который резолвится с объектом вида `{ key: String, endpoint: String }`, где key это ключ доступа, а endpoint это URL для дальнейшей работы c API. Например:

``` javascript
{ endpoint: 'streaming.vk.com',
  key: '49e4758265efca1bb0bfceec9a08272b5d015ba0' }
```

> В рассмотренных далее методах endpoint и key — это параметры полученные с помощью `VKStreamingAPI.authWithToken`

#### `VKStreamingAPI.getRules` *(endpoint:String, key:String) → Promise*

Запрашивает список всех правил объявленных для потока и возвращает Promise, который резолвится с объектом вида:

``` javascript
{ code: 200,
  rules:
   [ { tag: 'candidate1', value: 'титов -егор' },
     { tag: 'candidate2', value: 'собчак' },
     { tag: 'candidate3', value: 'навальный' },
     { tag: 'candidate4', value: 'путин' },
     { tag: 'candidate5', value: 'жириновский' },
     { tag: 'candidate6', value: 'явлинский' },
     { tag: 'candidate7', value: 'грудинин' } ] }
```

#### `VKStreamingAPI.postRule` *(endpoint:String, key:String, rule:Object) → Promise*

Добавляет правило в поток. Здесь `rule` — это [объект описывающий правило](https://vk.com/dev/streaming_api_docs?f=5.%20%D0%94%D0%BE%D0%B1%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB), например:

``` javascript
{ rule: { tag: 'candidate2', value: 'собчак' } }
```

#### `VKStreamingAPI.deleteRule` *(endpoint:String, key:String, ruleTag:Object) → Promise*

Удаляет правило из потока. Здесь `ruleTag` — это объект вида:

``` javascript
{ tag: 'candidate2' }
```

#### `VKStreamingAPI.flushRules` *(endpoint:String, key:String) → Promise*

Удаляет все правила потока.

### `VKWebSocket`

`VKWebSocket` — класс для чтения потока через websocket соединение к VK Streaming API. Как и объект создаваемый фабрикой `vkstream`, инстанс `VKWebSocket` имплементирует Readable Stream, а значит чтение потока может осуществляться как через обработку события `data`, так и с использованием `pipe`.

Для инстанцирования `VKWebSocket` необходимо указать адрес соединения и опциональный объект с параметрами подключения.

##### Пример: чтение потока с использованием VKWebSocket

``` javascript
const { authWithToken } = require('vkstream').VKStreamingAPI;

(async () => {
  const { endpoint, key } = await authWithToken(VK_SERVICE_KEY);

  const socket = new VKWebSocket(
      `wss://${endpoint}/stream?key=${key}`,
      { socket: { omitServiceMessages: false } }
    )

  socket.pipe(someWritableStream)
})()
```

Возможные параметры подключения:

- `highWaterMark` (Number) — размер [буффера](https://nodejs.org/api/stream.html#stream_readable_readablehighwatermark) сообщений. Default: `32768`;
- `socket.debug` (Boolean) — включение режима логирования (через console.debug()) Default: `false`;
- `socket.omitServiceMessages` (Boolean) — игнорировать или нет [сервисные сообщения](https://vk.com/dev/streaming_api_docs_2?f=7.1.%20Service%20message) Default: `true`;
- `socket.reconnectInterval` (Number) — стартовая преиодичность попыток переподключения обрыве соединения. Default: `1e3`;
- `socket.maxReconnectInterval` (Number) — максимальная преиодичность попыток переподключения обрыве соединения. Default: `3e4`;
- `socket.reconnectDecay` (Number) — множитель паузы между последующими попытками подключения. Default: `1.5`;
- `socket.timeoutInterval` (Number) — время таймаута одной попытки подключения. Default: `2e3`;
- `socket.maxReconnectAttempts` (Number) — лимит количества попыток подключения. Default: `null` (нет лимита попыток)

##### Пример: использование `VKStreamingAPI` и `VKWebSocket`

``` javascript
const { authWithToken, flushRules, postRule } = require('vkstream').VKStreamingAPI;

const rules = [
    { tag: 'candidate1', value: 'титов -егор' },
    { tag: 'candidate2', value: 'собчак' },
    { tag: 'candidate3', value: 'навальный' },
    { tag: 'candidate4', value: 'путин' },
    { tag: 'candidate5', value: 'жириновский' },
    { tag: 'candidate6', value: 'явлинский' },
    { tag: 'candidate7', value: 'грудинин' }
  ];

/**
 * Выполним авторизацию, удалим старые правила из потока, создадим новые
 * и установим websocket соединение для чтения потокa
 */

(async () => {
  const { endpoint, key } = await authWithToken(VK_SERVICE_KEY);

  await flushRules(endpoint, key);

  for (let rule of rules)
    await postRule(endpoint, key, { rule });

  const socket = new VKWebSocket(
      `wss://${endpoint}/stream?key=${key}`,
      { socket: { omitServiceMessages: false } }
    )

  socket.pipe(process.stdout)
})()
```
