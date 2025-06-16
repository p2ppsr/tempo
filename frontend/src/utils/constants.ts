interface Constants {
  tempoTopic: string
  tspProtocolID: string
  keyServerURL: string
  RETENTION_PERIOD: number
}

const constants: Constants = {
  tempoTopic: 'TSP',
  tspProtocolID: '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36',
  keyServerURL: import.meta.env.VITE_KEY_SERVER_URL || 'http://localhost:3000',
  RETENTION_PERIOD: 60 * 24 * 365 * 7 // 7 years
}

export default constants
