//import parapet from 'parapet-js' replace with confederacy lookup query
import constants from './constants'

export default (searchFilter) => [] /**parapet({
  resolvers: constants.confederacyResolvers,
  bridge: constants.tempoBridge,
  request: {
    type: 'json-query',
    query: {
      v: 3,
      q: {
        collection: 'songs',
        find: searchFilter
      }
    }
  }
})**/
