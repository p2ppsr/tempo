const parapet = require('parapet-js')
// import constants from './constants'

const init = async () => { 
    debugger
    const result = await parapet({
        resolvers: ['http://localhost:3103'], // ['https://staging-bridgeport.babbage.systems']
        bridge: '1H48C3wg1YcgpT7Tx61PHzH8Lx6v5tVUKL',
        request: {
            type: 'json-query',
            query: {
            v: 3,
            q: {
                collection: 'users',
                find: {
                publicKey: 'BDbXtG7OZUeNXZ36Tx5JrgOAtVdd312orPF87/4b6UhNNZMepGmMHcc27xoGtUadMfPVllJXgrWpKYCdY66tETs='
                }
            }
            }
        }
    })
    console.log(result)
}
init()