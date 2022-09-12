const parapet = require('parapet-js')
const fs = require('fs')
const fetch = require('isomorphic-fetch')
const { decrypt } = require('cwi-crypto')

const getSongs = async () => {
  return await parapet({
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
}
const downloadSong = async (hash) => {
  const songData = await fetch(
    `http://localhost:3104/data/${hash}` // http://localhost:3104/data/XUTZriU9pt5V33UfiBPqk7ap3nTgoXdXSmC7W4QTaquZaeCSmP7V
  ).then(res =>
    res.body.pipe(fs.createWriteStream('../data/downloadedData'))
  )
  return songData
}

const decryptSong = async (key) => {
  const encryptedData = fs.readFileSync('../data/downloadedData')
  const keyAsBuffer = Buffer.from(key, 'base64')
  const decryptionKey = await crypto.subtle.importKey(
    'raw',
    Uint8Array.from(keyAsBuffer),
    {
      name: 'AES-GCM'
    },
    true,
    ['decrypt']
  )
  const decryptedData = await decrypt(Uint8Array.from(encryptedData), decryptionKey, 'Uint8Array')
  fs.writeFileSync('../data/decryptedData.mp3', decryptedData)
}

module.exports = { getSongs, downloadSong, decryptSong }
