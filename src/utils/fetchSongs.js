import parapet from 'parapet-js'

export default async () => {
  // Query tempo bridge
  const availableSongs = await parapet({
    resolvers: ['http://localhost:3103'],
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
