let constants
if (window.location.host.startsWith('localhost')) { // local
  constants = {
    confederacyURL: 'http://localhost:3103',
    nanostoreURL: 'http://localhost:3104',
    tempoTopic: 'tempo',
    keyServerURL: process.env.REACT_APP_TEMPO_KEY_SERVER_URL ||
      'http://localhost:8080'
  }
} else if (window.location.host.startsWith('staging')) { // staging
  constants = {
    confederacyURL: 'https://staging-confederacy.babbage.systems',
    nanostoreURL: 'https://staging-nanostore.babbage.systems',
    tempoTopic: '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36',
    keyServerURL: process.env.REACT_APP_TEMPO_KEY_SERVER_URL ||
      'https://staging-tempo-keyserver.babbage.systems'
  }
} else { // production
  constants = {
    confederacyURL: undefined,
    nanostoreURL: 'https://nanostore.babbage.systems',
    tempoTopic: '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36',
    keyServerURL: process.env.REACT_APP_TEMPO_KEY_SERVER_URL ||
      'https://tempo-keyserver.babbage.systems'
  }
}

// Useful commented-out code for debugging / development
// constants = {
//   bridgeportResolvers: ['https://staging-bridgeport.babbage.systems'],
//   nanostoreURL: 'https://staging-nanostore.babbage.systems',
//   tempoBridge: '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36',
//   keyServerURL: 'http://localhost:8080'
// }
constants.nanostoreURL = 'https://staging-nanostore.babbage.systems'

export default constants
