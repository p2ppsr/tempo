import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import BabbagePrompt from '@babbage/react-prompt'

ReactDOM.render(
  <BabbagePrompt
    customPrompt
    appName='Tempo'
    author='Project Babbage'
    authorUrl='https://projectbabbage.com'
    description='Music streaming and publishing platform built with Babbage.'
    appIcon='/tempoIcon.png'
    appImages={[
      '/tempoBG.png'
    ]}
  >
    <App />
  </BabbagePrompt>,
  document.getElementById('root')
)
