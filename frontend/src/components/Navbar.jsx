import React, { useRef } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router'
import { EyeIcon, PlusIcon, HouseIcon, CalendarIcon, Sun, Moon, PizzaIcon } from 'lucide-react'
import { formatYMD } from "../lib/utils"
import { useEffect, useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

const Navbar = () => {
  const dateInputRef = useRef(null)
  const [theme, setTheme] = useState('sleek')
  const navigate = useNavigate()
  const { date: routeDate } = useParams();
  const date = routeDate || new Date().toISOString().split("T")[0];
  const location = useLocation()

  const openDatePicker = () => {
    const el = dateInputRef.current
    if (!el) return
    if (typeof el.showPicker === 'function') {
      el.showPicker()
    } else {
      el.click()
    }
  }

  const onDateChange = (e) => {
    const val = e.target.value // YYYY-MM-DD
    if (val) navigate(`/${val}`)
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial = stored || (prefersDark ? 'sleek-dark' : 'sleek')
      document.documentElement.setAttribute('data-theme', initial)
      setTheme(initial)
    } catch {}
  }, [])

  const toggleTheme = () => {
    const next = theme === 'sleek-dark' ? 'sleek' : 'sleek-dark'
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('theme', next) } catch {}
    setTheme(next)
  }

  const onFoods = location.pathname.startsWith('/foods')

  return (
    <header className='bg-base-100 border-b border-base-content/10'>
        <div className='mx-auto max-w-6xl p-4'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <button onClick={openDatePicker} className='btn btn-ghost btn-sm' aria-label='Select date'>
                      <CalendarIcon className='size-5' />
                    </button>
                    <input
                      ref={dateInputRef}
                      type='date'
                      className='sr-only'
                      onChange={onDateChange}
                    />
                    <Link to={"/"} className='btn btn-primary btn-sm' aria-label='Home'>
                      <HouseIcon className='size-5'/>
                    </Link>
                    <h1 className='text-2xl md:text-3xl font-bold text-primary tracking-tight'>
                      Your {formatYMD(date)} Meals
                    </h1>
                </div>
                <div className='flex items-center gap-4'>
                    <button onClick={toggleTheme} className='btn btn-ghost btn-sm' aria-label='Toggle dark mode'>
                      {theme === 'sleek-dark' ? <Sun className='size-5'/> : <Moon className='size-5' />}
                    </button>
                    <Link to={`/${date}/create`} className='btn btn-primary'>
                    <PlusIcon className='size-5'/>
                    <span>New Meal</span>
                    </Link>
                    <Link to={onFoods ? `/${date}` : "/foods"} className='btn btn-primary'>
                      {onFoods ? <EyeIcon className='size-5'/> : <PizzaIcon className='size-5'/>}
                      <span>{onFoods ? 'View Meals' : 'View Foods'}</span>
                    </Link>
                    <SignedOut>
                      <SignInButton mode='modal'>
                        <button className='btn btn-outline btn-sm'>Sign In</button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <UserButton appearance={{ elements: { userButtonAvatarBox: 'size-8' } }} />
                    </SignedIn>
                </div>
            </div>
        </div>
    </header>
  )
}

export default Navbar
