import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import BabbagePrompt from '@babbage/react-prompt'

ReactDOM.render(
  <BabbagePrompt appName='tempo'>
    <App />
  </BabbagePrompt>,
  document.getElementById('root')
)
