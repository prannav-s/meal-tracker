import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'react-hot-toast'
import { ClerkProvider } from '@clerk/clerk-react'
import AxiosAuthProvider from './components/AxiosAuthProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
          <AxiosAuthProvider />
          <App />
          <Toaster/>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
