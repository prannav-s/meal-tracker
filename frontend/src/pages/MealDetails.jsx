import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
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
  const [recs, setRecs] = useState([])
  const [recsLoading, setRecsLoading] = useState(false)
  const [recsError, setRecsError] = useState('')

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

  const fetchRecs = useCallback(async () => {
    setRecsLoading(true)
    setRecsError('')
    try {
      const res = await api.get(
        `/days/${date}/meals/${encodeURIComponent(mealName)}/recs`
      )
      const suggestions = res.data?.suggestions || []
      setRecs(suggestions)
      return true
    } catch (e) {
      console.error(e)
      const msg = e?.response?.data?.error || 'Failed to load quick adds'
      setRecsError(msg)
      setRecs([])
      return false
    } finally {
      setRecsLoading(false)
    }
  }, [date, mealName])

  useEffect(() => {
    fetchRecs()
  }, [fetchRecs])

  const handleRefreshRecs = useCallback(async () => {
    const ok = await fetchRecs()
    if (!ok) toast.error('Failed to load quick adds')
  }, [fetchRecs])

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

  const foodsById = useMemo(() => {
    const map = {}
    foods.forEach((f) => {
      map[String(f._id)] = f
    })
    return map
  }, [foods])

  const filteredFoods = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return foods
    return foods.filter((f) =>
      [f.name, f.brand, ...(f.tags || [])]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    )
  }, [foods, query])

  const computeSuggestedQuantity = useCallback(
    (suggestion) => {
      if (!suggestion?.foodId) return 1
      const base = foodsById[suggestion.foodId]
      if (!base) return 1
      const keys = ['calories', 'protein', 'carbs', 'fat']
      const ratios = keys
        .map((key) => {
          const perUnit = Number(base[key] ?? 0)
          const suggested = Number(suggestion?.macros?.[key] ?? 0)
          if (!perUnit || !suggested) return null
          return suggested / perUnit
        })
        .filter((value) => typeof value === 'number' && isFinite(value) && value > 0)
      if (!ratios.length) return 1
      const avg = ratios.reduce((sum, value) => sum + value, 0) / ratios.length
      const rounded = Math.round(avg * 100) / 100
      return Math.max(0.25, rounded || 1)
    },
    [foodsById]
  )

  const handleAddFood = async (foodId, quantityOverride) => {
    try {
      setAddingId(foodId)
      const quantity = quantityOverride ?? (Number(qtyById[foodId] ?? 1) || 1)
      await api.post(`/days/${date}/meals/${encodeURIComponent(mealName)}/foods`, {
        foodId,
        quantity,
      })
      await refreshMeal()
      toast.success('Food added')
      await fetchRecs()
      return true
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to add food'
      toast.error(msg)
      console.error(e)
      return false
    } finally {
      setAddingId(null)
    }
  }

  const handleQuickAdd = async (suggestion) => {
    const quantity = computeSuggestedQuantity(suggestion)
    setQtyById((s) => ({ ...s, [suggestion.foodId]: quantity }))
    await handleAddFood(suggestion.foodId, quantity)
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
          <div className='grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6'>
            <div className='order-1 lg:col-span-2'>
              <div className='card bg-base-100 border border-base-content/10'>
                <div className='card-body gap-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <h3 className='text-lg font-semibold'>Quick Adds</h3>
                    <button
                      className={`btn btn-ghost btn-xs ${recsLoading ? 'loading' : ''}`}
                      onClick={handleRefreshRecs}
                      disabled={recsLoading}
                    >
                      {recsLoading ? '' : 'Refresh'}
                    </button>
                  </div>
                  {recsLoading ? (
                    <div className='text-sm text-base-content/60'>Loading suggestions…</div>
                  ) : recsError ? (
                    <div className='space-y-2'>
                      <div className='text-sm text-error'>{recsError}</div>
                      <button className='btn btn-outline btn-xs' onClick={handleRefreshRecs}>
                        Try again
                      </button>
                    </div>
                  ) : recs.length === 0 ? (
                    <div className='text-sm text-base-content/60'>No quick adds right now.</div>
                  ) : (
                    <div className='flex gap-3 overflow-x-auto pb-2'>
                      {recs.map((rec, idx) => {
                        const baseFood = foodsById[rec.foodId]
                        const approxQuantity = computeSuggestedQuantity(rec)
                        const macros = rec.macros || {}
                        const calories = Math.round(Number(macros.calories ?? 0))
                        const protein = Math.round(Number(macros.protein ?? 0))
                        const carbs = Math.round(Number(macros.carbs ?? 0))
                        const fat = Math.round(Number(macros.fat ?? 0))
                        return (
                          <div
                            key={`${rec.foodId}-${idx}`}
                            className='min-w-[220px] flex-1 rounded-lg border border-base-content/10 p-3'
                          >
                            <div className='flex h-full flex-col justify-between gap-3'>
                              <div className='flex items-start justify-between gap-3'>
                                <div className='min-w-0'>
                                  <div className='font-medium truncate'>{rec.name}</div>
                                  {rec.portion && (
                                    <div className='text-xs text-base-content/60'>Portion: {rec.portion}</div>
                                  )}
                                  {baseFood && (
                                    <div className='text-[10px] uppercase tracking-wide text-base-content/50'>
                                      ≈ {approxQuantity}× saved serving
                                    </div>
                                  )}
                                  <div className='text-xs text-base-content/70'>
                                    {calories} kcal • P {protein}g • C {carbs}g • F {fat}g
                                  </div>
                                </div>
                                <button
                                  className={`btn btn-primary btn-xs ${addingId === rec.foodId ? 'loading' : ''}`}
                                  onClick={() => handleQuickAdd(rec)}
                                  disabled={addingId === rec.foodId}
                                >
                                  {addingId === rec.foodId ? '' : <PlusIcon className='size-3' />} Add
                                </button>
                              </div>
                              {rec.why && (
                                <div className='text-xs italic text-base-content/60'>{rec.why}</div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='order-2 space-y-4'>
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

            <div className='order-3 space-y-4'>
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
                      <div
                        key={f._id}
                        className='flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between'
                      >
                        <div className='min-w-0 flex-1'>
                          <div className='font-medium truncate'>{f.name}</div>
                          <div className='text-xs text-base-content/60 truncate'>
                            {f.brand}
                          </div>
                          <div className='text-xs text-base-content/70'>
                            {f.calories} kcal • P {f.protein}g • C {f.carbs}g • F {f.fat}g
                          </div>
                          {Array.isArray(f.tags) && f.tags.length > 0 && (
                            <div className='mt-1 flex flex-wrap gap-1'>
                              {f.tags.map((t, idx) => (
                                <span key={idx} className='badge badge-accent badge-xs'>
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className='flex w-full items-center gap-2 sm:w-auto sm:justify-end'>
                          <input
                            type='number'
                            min={0.25}
                            step='0.25'
                            className='input input-bordered input-xs w-20'
                            value={qtyById[f._id] ?? 1}
                            onChange={(e) =>
                              setQtyById((s) => ({ ...s, [f._id]: e.target.value }))
                            }
                          />
                          <button
                            className={`btn btn-primary btn-xs ${addingId === f._id ? 'loading' : ''}`}
                            onClick={() => handleAddFood(f._id)}
                            disabled={addingId === f._id}
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
