const parapet = require("parapet-js")
const fs = require("fs")
const isomorphicFetch = require("isomorphic-fetch")
const { pipeline } = require("stream")
const { promisify } = require("util")
const streamPipeline = promisify(pipeline)
const { decrypt } = require("cwi-crypto")

const getSongs = async () => {
  return await parapet({
    resolvers: ["http://localhost:3103"],
    tempoTopic: "TSP",
    request: {
      type: "json-query",
      query: {
        v: 3,
        q: {
          collection: "songs",
          find: {},
        },
      },
    },
  })
}
// const downloadSong = async (hash) => {
//   const songData = await fetch(
//     `http://localhost:3104/data/${hash}` // http://localhost:3104/data/XUTZriU9pt5V33UfiBPqk7ap3nTgoXdXSmC7W4QTaquZaeCSmP7V
//   ).then((res) => res.body?.pipe(fs.createWriteStream("../data/downloadedData")))
//   return songData
// }

// Updated downloadSong() for TS and error handling
const downloadSong = async (hash: string) => {
  const response = await isomorphicFetch(`http://localhost:3000/data/${hash}`) // http://localhost:3000/data/XUTZriU9pt5V33UfiBPqk7ap3nTgoXdXSmC7W4QTaquZaeCSmP7V

  if (!response.ok) {
    throw new Error(`unexpected response: ${response.statusText}`)
  }

  const songData = fs.createWriteStream("../data/downloadedData")
  await streamPipeline(response.body, songData)
  return songData
}

const decryptSong = async (key: string) => {
  const encryptedData = fs.readFileSync("../data/downloadedData")
  const keyAsBuffer = Buffer.from(key, "base64")
  const decryptionKey = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(keyAsBuffer),
    {
      name: "AES-GCM",
    },
    true,
    ["decrypt"]
  )
  const decryptedData = await decrypt(
    Uint8Array.from(encryptedData),
    decryptionKey,
    "Uint8Array"
  )
  fs.writeFileSync("../data/decryptedData.mp3", decryptedData)
}

module.exports = { getSongs, downloadSong, decryptSong }
