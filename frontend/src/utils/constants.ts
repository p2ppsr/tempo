interface Constants {
  tempoTopic: string
  tspProtocolID: string
  keyServerURL: string
  uploadURL: string
  overlayNetworkPreset: 'mainnet' | 'local'
  overlayLookupService: 'ls_tsp'
  tspLookupHosts: string[]
  uhrpLookupHosts: string[]
  RETENTION_PERIOD: number
}

const constants: Constants = {
  tempoTopic: 'tsp',
  tspProtocolID: 'tmtsp',
  // Temporary forced production routing:
  // keep these static while we validate against mainnet + prod services.
  keyServerURL: 'https://tempo-keyserver.babbage.systems',
  uploadURL: 'https://nanostore.babbage.systems',
  overlayNetworkPreset: 'mainnet',
  overlayLookupService: 'ls_tsp',
  // Pin Tempo to its current CARS project instead of merging the retired
  // five-song project still advertised over SLAP.
  tspLookupHosts: ['https://backend.50247d539b678476a0b00db7bd5584e8.projects.babbage.systems'],
  // These independent primary overlays jointly contain the current nonexpired
  // UHRP catalogue. The generic SLAP set includes stale and unreachable hosts.
  uhrpLookupHosts: ['https://overlay-us-1.bsvb.tech', 'https://overlay-ap-1.bsvb.tech'],
  RETENTION_PERIOD: 60 * 24 * 365 * 7
}

export default constants
