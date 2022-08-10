import React, { useState, useEffect } from 'react'
import LeftMenu from '../../components/LeftMenu'
import MainMenu from '../../components/MainMenu'
import LatestSongs from '../../components/LatestSongs'
import './style.css'
import { decrypt } from '@cwi/crypto'
import parapet from 'parapet-js'
import { Authrite } from 'authrite-js'

const Home = () => {
  // const [countryItems, initCountry] = useState([])
  const [image, setImage] = useState('')
  const fetchData = async () => {
    // Used to query the tempo bridge
    // const availableSongs = await parapet({
    //   resolvers: ['http://localhost:3103'],
    //   bridge: '1LQtKKK7c1TN3UcRfsp8SqGjWtzGskze36', // TSP
    //   request: {
    //     type: 'json-query',
    //     query: {
    //       v: 3,
    //       q: {
    //         collection: 'songs',
    //         find: {}
    //       }
    //     }
    //   }
    // })
    // console.log(availableSongs)

    const songURL = 'XUTBG1hsvE4ANoVczeLRBjorb7AVe18V4EnouBxfJ2ErgiM2J9SC'
    // let encryptedData
    const response = await fetch(
        `http://localhost:3104/data/${songURL}` // http://localhost:3104/data/XUU89PnShAudAKB5KZ5XCoHRrgeRUNqSS3krN4CLf2w84gCFFVMZ
    )
    const encryptedData = await response.arrayBuffer()

    const purchasedKey = await new Authrite().request('http://localhost:8080/buy', {
      body: {
        songURL
      },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const key = (JSON.parse(Buffer.from(purchasedKey.body).toString('utf8'))).result
    const keyAsBuffer = Buffer.from(key, 'base64')
    const decryptionKey = await window.crypto.subtle.importKey(
      'raw',
      Uint8Array.from(keyAsBuffer),
      {
        name: 'AES-GCM'
      },
      true,
      ['decrypt']
    )
    const decryptedData = await decrypt(new Uint8Array(encryptedData), decryptionKey, 'Uint8Array')
    const dataBlob = new Blob([decryptedData])
    return URL.createObjectURL(dataBlob)
  }
  useEffect(() => {
    fetchData()
      .then((res) => {
        setImage(res)
        document.getElementById('audioPlayer').src = res
      })
      .catch((e) => {
        console.log(e.message)
      })
  }, [])

  return (
    <div className='Home'>
      <div className='menuAndContentSection'>
        <MainMenu className='menu' />
        <LatestSongs className='mainContent' />
      </div>
      <div className='background' />
    </div>
  )
}
export default Home
