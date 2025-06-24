interface Constants {
  tempoTopic: string
  tspProtocolID: string
  keyServerURL: string
  uploadURL: string
  RETENTION_PERIOD: number
}

const constants: Constants = {
  tempoTopic: 'tsp',
  tspProtocolID: '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36',
  keyServerURL: import.meta.env.VITE_KEY_SERVER_URL || 'http://localhost:3000',
  uploadURL: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:3301',
  RETENTION_PERIOD: 5
}

export default constants
