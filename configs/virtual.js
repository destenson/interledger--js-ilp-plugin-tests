// mock require the network connection
const mockRequire = require('mock-require')
const mock =
  require('../node_modules/ilp-plugin-virtual/test/mocks/mockConnection')
const MockConnection = mock.MockConnection
const MockChannels = mock.MockChannels
mockRequire(
  '../node_modules/ilp-plugin-virtual/src/model/connection',
  MockConnection
)

// This field contains the constructor for a plugin
exports.plugin = require('ilp-plugin-virtual')

// This specifies the number of time in seconds that the plugin needs in order
// to fulfill a transfer (from send until fulfillment goes through).
exports.timeout = 1

let store = {}
let s = store.s = {}
store.get = (k) => { return Promise.resolve(s[k]) }
store.put = (k, v) => { s[k] = v; return Promise.resolve(null) }
store.del = (k) => { s[k] = undefined; return Promise.resolve(null) }

const crypto = require('crypto')
const base64url = require('base64url')

// give a well formed token as a placeholder, but connection is mocked
const token = base64url(JSON.stringify({
  channel: crypto.randomBytes(32).toString('hex'),
  host: 'ws://broker.mqtt.example:8000'
}))

// These objects specify the configs of different
// plugins. There must be 2, so that they can send
// transfers to one another.
exports.options = [
  // options for the first plugin
  {
    // These are the PluginOptions passed into the plugin's
    // constructor.
    'pluginOptions': {
      'connector': 'http://localhost:4000',
      'prefix': 'test.nerd.',
      'account': 'nerd',
      'host': 'ws://broker.hivemq.com:8000',
      'minBalance': '0',
      'maxBalance': '1000',
      'initialBalance': '100',
      'settleIfUnder': '0',
      'settleIfOver': '1000',
      'token': token,
      'mockChannels': MockChannels,
      'secret': 'not used yet',
      '_store': store
    },
    // These objects are merged with transfers originating from
    // their respective plugins. Should specify the other plugin's
    // account, so that the two plugins can send to one another
    'transfer': {
      'account': 'noob'
    }
  },
  // options for the second plugin
  {
    'pluginOptions': {
      'prefix': 'test.noob.',
      'account': 'noob',
      'host': 'ws://broker.hivemq.com:8000',
      'mockConnection': MockConnection,
      'mockChannels': MockChannels,
      'token': token
    },
    'transfer': {
      'account': 'nerd'
    }
  }
]
