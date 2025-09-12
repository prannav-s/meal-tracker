import React from 'react'
import {Route, Routes} from 'react-router'
import HomePage from './pages/HomePage'
import toast from 'react-hot-toast'

const App = () => {
  return (
    <div className='relative min-h-screen w-full'> 
      <div className='absolute inset-0 -z-10 w-full h-full items-center px-5 py-24'></div>
      <Routes>
        <Route path="/" element = {<HomePage /> }/>
      </Routes>
    </div>
  )
}

export default App;