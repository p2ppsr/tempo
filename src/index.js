import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import Prompt from '@babbage/react-prompt'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

ReactDOM.render(
  <Prompt appName='tempo'>
    <ToastContainer
      position='top-center'
    />
    <App />
  </Prompt>,
  document.getElementById('root')
)
