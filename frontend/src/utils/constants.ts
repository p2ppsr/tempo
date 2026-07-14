interface Constants {
  tempoTopic: string
  tspProtocolID: string
  keyServerURL: string
  uploadURL: string
  overlayNetworkPreset: 'mainnet' | 'local'
  overlayLookupService: 'ls_tsp'
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
  RETENTION_PERIOD: 60 * 24 * 365 * 7
}

export default constants
