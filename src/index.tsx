import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

import BabbagePrompt from '@babbage/react-prompt'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <BabbagePrompt
      customPrompt
      appName="Tempo"
      author="Project Babbage"
      authorUrl="https://projectbabbage.com"
      description="Music streaming and publishing platform built with Babbage."
      appIcon="/tempoIcon.png"
      // appImages={['/tempoBG.png']}
      supportedMetaNet={'universal'}
    > */}
      <App />
    {/* </BabbagePrompt> */}
  </React.StrictMode>
)
