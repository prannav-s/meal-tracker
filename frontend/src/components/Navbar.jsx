import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router'
import { EyeIcon, PlusIcon, HouseIcon, CalendarIcon, Sun, Moon, PizzaIcon, MenuIcon, XIcon } from 'lucide-react'
import { formatYMD } from "../lib/utils"
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

const Navbar = () => {
  const dateInputRef = useRef(null)
  const [theme, setTheme] = useState('sleek')
  const [menuOpen, setMenuOpen] = useState(false)
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
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Navbar] Failed to restore theme preference', error)
      }
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'sleek-dark' ? 'sleek' : 'sleek-dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Navbar] Failed to persist theme preference', error)
      }
    }
    setTheme(next)
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const onFoods = location.pathname.startsWith('/foods')

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev)
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className='bg-base-100 border-b border-base-content/10'>
        <div className='mx-auto flex max-w-6xl flex-col px-4 py-3'>
            <div className='flex items-center justify-between gap-3'>
                <div className='flex min-w-0 items-center gap-3'>
                    <button onClick={openDatePicker} className='btn btn-ghost btn-sm' aria-label='Select date'>
                      <CalendarIcon className='size-5' />
                    </button>
                    <input
                      ref={dateInputRef}
                      type='date'
                      className='sr-only'
                      onChange={onDateChange}
                    />
                    <Link to={"/"} className='btn btn-primary btn-sm' aria-label='Home' onClick={closeMenu}>
                      <HouseIcon className='size-5'/>
                    </Link>
                    <h1 className='truncate text-lg font-semibold text-primary sm:text-2xl md:text-3xl'>
                      Your {formatYMD(date)} Meals
                    </h1>
                </div>
                <div className='hidden items-center gap-3 sm:flex'>
                    <button onClick={toggleTheme} className='btn btn-ghost btn-sm' aria-label='Toggle dark mode'>
                      {theme === 'sleek-dark' ? <Sun className='size-5'/> : <Moon className='size-5' />}
                    </button>
                    <Link to={`/${date}/create`} className='btn btn-primary btn-sm gap-2'>
                      <PlusIcon className='size-5'/>
                      <span>New Meal</span>
                    </Link>
                    <Link to={onFoods ? `/${date}` : "/foods"} className='btn btn-primary btn-sm gap-2'>
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
                <button
                  onClick={toggleMenu}
                  className='btn btn-ghost btn-sm sm:hidden'
                  aria-label='Toggle menu'
                  aria-expanded={menuOpen}
                  aria-controls='mobile-nav'
                >
                  {menuOpen ? <XIcon className='size-5' /> : <MenuIcon className='size-5' />}
                </button>
            </div>
            {menuOpen && (
              <nav id='mobile-nav' className='mt-3 flex flex-col gap-2 sm:hidden'>
                <button onClick={toggleTheme} className='btn btn-ghost justify-start gap-2'>
                  {theme === 'sleek-dark' ? <Sun className='size-5'/> : <Moon className='size-5' />}
                  <span>{theme === 'sleek-dark' ? 'Use Light Theme' : 'Use Dark Theme'}</span>
                </button>
                <Link
                  to={`/${date}/create`}
                  className='btn btn-primary gap-2'
                  onClick={closeMenu}
                >
                  <PlusIcon className='size-5'/>
                  <span>New Meal</span>
                </Link>
                <Link
                  to={onFoods ? `/${date}` : "/foods"}
                  className='btn btn-primary gap-2'
                  onClick={closeMenu}
                >
                  {onFoods ? <EyeIcon className='size-5'/> : <PizzaIcon className='size-5'/>}
                  <span>{onFoods ? 'View Meals' : 'View Foods'}</span>
                </Link>
                <SignedOut>
                  <SignInButton mode='modal'>
                    <button className='btn btn-outline' onClick={closeMenu}>Sign In</button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className='flex items-center gap-3 rounded-lg border border-base-content/10 px-3 py-2'>
                    <UserButton appearance={{ elements: { userButtonAvatarBox: 'size-8' } }} />
                    <span className='text-sm font-medium'>Account</span>
                  </div>
                </SignedIn>
              </nav>
            )}
        </div>
    </header>
  )
}

export default Navbar
