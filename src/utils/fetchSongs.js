import parapet from 'parapet-js'

export default async () => {
  const BRIDGEPORT_RESOLVERS = window.location.host.startsWith('staging')
    ? ['https://staging-bridgeport.babbage.systems']
    : window.location.host.startsWith('localhost')
      ? ['http://localhost:3103']
      : undefined

  // Query tempo bridge
  const availableSongs = await parapet({
    resolvers: BRIDGEPORT_RESOLVERS,
    bridge: '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36', // TSP
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
  return availableSongs
}
