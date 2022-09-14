import parapet from 'parapet-js'
import constants from './constants'

export default () => parapet({
  resolvers: constants.bridgeportResolvers,
  bridge: constants.tempoBridge,
  request: {
    type: 'json-query',
    query: {
      v: 3,
      q: {
        collection: 'songs',
        find: {}
      }
    }
  }
})
