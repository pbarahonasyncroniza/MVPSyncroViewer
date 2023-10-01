import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Main from './component/Main'
import { DataProvider } from './component/context'




function App() {
  

  return (
    <>
      <DataProvider>
        <Main />
      </DataProvider>
    </>
  )
}

export default App
