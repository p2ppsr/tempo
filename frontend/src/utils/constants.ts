interface Constants {
  tempoTopic: string
  tspProtocolID: string
  keyServerURL: string
  uploadURL: string
  RETENTION_PERIOD: number
}

const constants: Constants = {
  tempoTopic: 'tsp',
  tspProtocolID: 'tmtsp',
  keyServerURL: window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://tempo-keyserver.babbage.systems',
  uploadURL: window.location.hostname === 'localhost' ? 'http://localhost:3301' : 'https://uhrp-lite.babbage.systems',
  RETENTION_PERIOD: 5
}

export default constants
