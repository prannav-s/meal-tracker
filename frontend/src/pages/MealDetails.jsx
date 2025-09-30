import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import Navbar from '../components/Navbar'
import api from '../lib/axios.js'
import toast from 'react-hot-toast'
import { ArrowLeft, PlusIcon, Trash2 } from 'lucide-react'
import { formatYMD } from '../lib/utils.js'

const MealDetails = () => {
  const { date, mealName } = useParams()
  const navigate = useNavigate()

  const [meal, setMeal] = useState(null)
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [addingId, setAddingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [qtyById, setQtyById] = useState({})

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [mealRes, foodsRes] = await Promise.all([
          api.get(`/days/${date}/meals/${encodeURIComponent(mealName)}`),
          api.get('/foods'),
        ])
        setMeal(mealRes.data)
        setFoods(foodsRes.data)
      } catch (e) {
        toast.error('Failed to load meal or foods')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [date, mealName])

  const totals = useMemo(() => {
    if (!meal) return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    return (meal.foods || []).reduce(
      (acc, entry) => {
        const q = entry?.quantity ?? 1
        const f = entry?.food || {}
        acc.calories += (f.calories || 0) * q
        acc.protein += (f.protein || 0) * q
        acc.carbs += (f.carbs || 0) * q
        acc.fat += (f.fat || 0) * q
        return acc
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }, [meal])

  const refreshMeal = async () => {
    const res = await api.get(`/days/${date}/meals/${encodeURIComponent(mealName)}`)
    setMeal(res.data)
  }

  const filteredFoods = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return foods
    return foods.filter((f) =>
      [f.name, f.brand, ...(f.tags || [])]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    )
  }, [foods, query])

  const handleAddFood = async (foodId) => {
    try {
      setAddingId(foodId)
      const quantity = Number(qtyById[foodId] ?? 1) || 1
      await api.post(`/days/${date}/meals/${encodeURIComponent(mealName)}/foods`, {
        foodId,
        quantity,
      })
      await refreshMeal()
      toast.success('Food added')
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to add food'
      toast.error(msg)
      console.error(e)
    } finally {
      setAddingId(null)
    }
  }

  const handleDeleteEntry = async (entryId) => {
    try {
      setDeletingId(entryId)
      await api.delete(`/days/${date}/meals/${encodeURIComponent(mealName)}/foods/${entryId}`)
      await refreshMeal()
    } catch (e) {
      toast.error('Failed to remove food')
      console.error(e)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className='min-h-screen'>
      <Navbar />
      <div className='max-w-7xl mx-auto p-4 mt-6'>
        <div className='mb-4'>
          <button className='btn btn-ghost btn-sm' onClick={() => navigate(-1)}>
            <ArrowLeft className='size-4' /> Back
          </button>
        </div>

        {loading ? (
          <div className='text-center text-primary py-10'>Loading…</div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2'>
              <div className='card bg-base-100 border border-base-content/10'>
                <div className='card-body'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3'>
                      <h2 className='text-2xl font-bold leading-tight'>{meal?.name}</h2>
                      <div className='text-sm text-base-content/70 leading-snug'>
                        {formatYMD(date)}
                      </div>
                    </div>
                    <div className='text-sm text-base-content/70 leading-snug sm:text-right'>
                      {totals.calories} kcal • P {totals.protein}g • C {totals.carbs}g • F {totals.fat}g
                    </div>
                  </div>

                  <div className='divider my-2' />

                  {(meal?.foods?.length ?? 0) === 0 ? (
                    <div className='text-base-content/60'>No foods in this meal yet.</div>
                  ) : (
                    <div className='space-y-3'>
                      {meal.foods.map((entry) => {
                        const f = entry.food || {}
                        const q = entry.quantity ?? 1
                        return (
                          <div key={entry._id} className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                            <div className='min-w-0'>
                              <div className='font-medium truncate'>{f.name}</div>
                              <div className='text-xs text-base-content/60 truncate'>
                                {f.brand ? `${f.brand} • ` : ''}Qty {q}
                              </div>
                            </div>
                            <div className='flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4'>
                              <div className='text-sm tabular-nums text-base-content/80'>
                                {Math.round((f.calories || 0) * q)} kcal
                              </div>
                              <button
                                className={`btn btn-xs btn-ghost ${deletingId === entry._id ? 'loading' : ''}`}
                                onClick={() => handleDeleteEntry(entry._id)}
                                aria-label='Remove food'
                              >
                                {deletingId === entry._id ? '' : <Trash2 className='size-4 text-error' />}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='lg:col-span-1'>
              <div className='card bg-base-100 border border-base-content/10'>
                <div className='card-body gap-4'>
                  <h3 className='text-lg font-semibold'>Add Foods</h3>
                  <input
                    type='text'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='Search foods by name, brand, or tag'
                    className='input input-bordered w-full'
                  />

                  <div className='max-h-96 space-y-3 overflow-auto pr-2'>
                    {filteredFoods.map((f) => (
                      <div key={f._id} className='flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='min-w-0 flex-1'>
                          <div className='font-medium truncate'>{f.name}</div>
                          <div className='text-xs text-base-content/60 truncate'>
                            {f.brand}
                          </div>
                          <div className='text-xs text-base-content/70'>
                            {f.calories} kcal • P {f.protein}g • C {f.carbs}g • F {f.fat}g
                          </div>
                          {Array.isArray(f.tags) && f.tags.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-1'>
                              {f.tags.map((t, idx) => (
                                <span key={idx} className='badge badge-accent badge-xs'>{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className='flex w-full items-center gap-2 sm:w-auto sm:justify-end'>
                          <input
                            type='number'
                            min={1}
                            className='input input-bordered input-xs w-16'
                            value={qtyById[f._id] ?? 1}
                            onChange={(e) =>
                              setQtyById((s) => ({ ...s, [f._id]: e.target.value }))
                            }
                          />
                          <button
                            className={`btn btn-primary btn-xs ${addingId === f._id ? 'loading' : ''}`}
                            onClick={() => handleAddFood(f._id)}
                          >
                            {addingId === f._id ? '' : <PlusIcon className='size-3' />} Add
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredFoods.length === 0 && (
                      <div className='text-sm text-base-content/60'>No foods match.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MealDetails
