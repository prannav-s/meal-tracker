import React, { useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { EyeIcon, PlusIcon, HouseIcon, CalendarIcon } from 'lucide-react'
import { formatYMD } from "../lib/utils"

const Navbar = () => {
  const dateInputRef = useRef(null)
  const navigate = useNavigate()
  const { date: routeDate } = useParams();
  const date = routeDate || new Date().toISOString().split("T")[0];

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

  return (
    <header className='bg-base-300 border-b border-base-content/10'>
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
                    <h1 className='text-2xl md:text-3xl font-bold text-primary font-mono tracking-tight'>
                      Your {formatYMD(date)} Meals
                    </h1>
                </div>
                <div className='flex items-center gap-4'>
                    <Link to={`/${date}/create`} className='btn btn-primary'>
                    <PlusIcon className='size-5'/>
                    <span>New Meal</span>
                    </Link>
                    <Link to={"/foods"} className='btn btn-primary'>
                    <EyeIcon className='size-5'/>
                    <span>View Foods</span> 
                    </Link>
                </div>
            </div>
        </div>
    </header>
  )
}

export default Navbar
