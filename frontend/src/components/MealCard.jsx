import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { PlusIcon, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router'
import api from '../lib/axios.js'
import toast from 'react-hot-toast'

// Expects `meal` with shape:
// { name: 'Breakfast'|'Lunch'|'Dinner'|'Snack', foods: [{ _id, quantity, food: { name, brand, calories, protein, carbs, fat } }] }
// Also accepts optional setMeals updater to refresh list after mutations
const MealCard = ({ meal, setMeals, foods = [], showQuickAdds = true }) => {
  const [deletingId, setDeletingId] = useState(null)
  const [recs, setRecs] = useState([])
  const [recsLoading, setRecsLoading] = useState(false)
  const [recsError, setRecsError] = useState('')
  const [addingId, setAddingId] = useState(null)
  const { date: routeDate } = useParams();
  const date = routeDate || new Date().toISOString().split("T")[0];


  const totals = useMemo(() => {
    return (meal?.foods || []).reduce(
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

  const refreshMeals = async () => {
    if (!setMeals) return
    const res = await api.get(`/days/${date}/meals`)
    setMeals(res.data)
  }

  const foodsById = useMemo(() => {
    const map = {}
    foods.forEach((f) => {
      map[String(f._id)] = f
    })
    return map
  }, [foods])

  const fetchRecs = useCallback(async () => {
    if (!meal?.name) return
    setRecsLoading(true)
    setRecsError('')
    try {
      const res = await api.get(
        `/days/${date}/meals/${encodeURIComponent(meal.name)}/recs`
      )
      setRecs(res.data?.suggestions || [])
    } catch (error) {
      console.error(error)
      setRecsError(error?.response?.data?.error || 'Failed to load quick adds')
      setRecs([])
    } finally {
      setRecsLoading(false)
    }
  }, [date, meal?.name])

  useEffect(() => {
    if (!showQuickAdds) {
      setRecs([])
      return
    }
    fetchRecs()
  }, [fetchRecs, showQuickAdds])

  const computeSuggestedQuantity = useCallback(
    (suggestion) => {
      const id = suggestion?.foodId
      if (!id) return 1
      const base = foodsById[id]
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

  const handleQuickAdd = useCallback(
    async (suggestion) => {
      if (!suggestion?.foodId) return
      const quantity = computeSuggestedQuantity(suggestion)
      setAddingId(suggestion.foodId)
      try {
        await api.post(`/days/${date}/meals/${encodeURIComponent(meal.name)}/foods`, {
          foodId: suggestion.foodId,
          quantity,
        })
        await refreshMeals()
        if (showQuickAdds) await fetchRecs()
        toast.success('Food added')
      } catch (error) {
        console.error(error)
        const msg = error?.response?.data?.message || 'Failed to add food'
        toast.error(msg)
      } finally {
        setAddingId(null)
      }
    },
    [computeSuggestedQuantity, date, fetchRecs, meal?.name, refreshMeals, showQuickAdds]
  )

  const handleDeleteFood = async (e, entryId) => {
    e.preventDefault();

    if (window.confirm("Remove this food from the meal?")) {

        try {
        setDeletingId(entryId)
        await api.delete(`/days/${date}/meals/${meal.name}/foods/${entryId}`)
        await refreshMeals()
        } catch (e) {
        // no-op; Home has toasts for global errors
        console.error(e)
        } finally {
        setDeletingId(null)
        }
    }
  }

  return (
    <div className='space-y-3'>
      <Link
        to={`/${date}/${encodeURIComponent(meal.name)}`}
        className='card bg-base-100 border border-base-content/10 shadow-sm transition hover:shadow-md'
      >
        <div className='card-body gap-4'>
          <div className='flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3'>
              <span className='badge badge-primary badge-lg w-fit'>{meal?.name}</span>
              <div className='text-sm text-base-content/70 leading-snug'>
                {totals.calories} kcal • P {totals.protein}g • C {totals.carbs}g • F {totals.fat}g
              </div>
            </div>
            <button className='btn btn-ghost btn-sm w-full justify-center gap-2 sm:w-auto'>
              <PlusIcon className='size-4' />
              <span>Add Food</span>
            </button>
          </div>

          <div className='divider my-0' />

          {(meal?.foods?.length ?? 0) === 0 && (
            <div className='text-base-content/60 text-sm'>No foods added yet.</div>
          )}

          {(meal?.foods || []).map((entry) => {
            const f = entry.food || {}
            const q = entry.quantity ?? 1
            return (
              <div key={entry._id} className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='min-w-0'>
                  <div className='font-medium truncate'>{f.name || 'Unnamed food'}</div>
                  <div className='text-xs text-base-content/60 truncate'>
                    {f.brand ? `${f.brand} • ` : ''}Qty {q}
                  </div>
                </div>
                <div className='flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4'>
                  <div className='text-sm tabular-nums text-base-content/80'>
                    {Math.round((f.calories || 0) * q)} kcal
                  </div>
                  <div className='text-xs text-base-content/60'>
                    P {Math.round((f.protein || 0) * q)}g • C {Math.round((f.carbs || 0) * q)}g • F {Math.round((f.fat || 0) * q)}g
                  </div>
                  <button
                    className={`btn btn-ghost btn-xs ${deletingId === entry._id ? 'loading' : ''}`}
                    onClick={(e) => handleDeleteFood(e, entry._id)}
                    aria-label='Remove food'
                  >
                    {deletingId === entry._id ? '' : <Trash2 className='size-4 text-error' />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Link>

      {showQuickAdds && (
        <div className='card bg-base-100 border border-dashed border-primary/30'>
          <div className='card-body gap-3'>
            <div className='flex items-center justify-between gap-3'>
              <h4 className='text-sm font-semibold uppercase tracking-wide text-primary'>Quick Adds</h4>
              <button
                className={`btn btn-ghost btn-xs ${recsLoading ? 'loading' : ''}`}
                onClick={fetchRecs}
                disabled={recsLoading}
              >
                {recsLoading ? '' : 'Refresh'}
              </button>
            </div>
            {recsLoading ? (
              <div className='text-xs text-base-content/60'>Loading suggestions…</div>
            ) : recsError ? (
              <div className='space-y-2'>
                <div className='text-xs text-error'>{recsError}</div>
                <button className='btn btn-outline btn-xs' onClick={fetchRecs}>
                  Try again
                </button>
              </div>
            ) : recs.length === 0 ? (
              <div className='text-xs text-base-content/60'>No quick adds right now.</div>
            ) : (
              <div className='space-y-2'>
                {recs.map((rec, idx) => {
                  const macros = rec.macros || {}
                  const calories = Math.round(Number(macros.calories ?? 0))
                  const protein = Math.round(Number(macros.protein ?? 0))
                  const carbs = Math.round(Number(macros.carbs ?? 0))
                  const fat = Math.round(Number(macros.fat ?? 0))
                  const approxQuantity = computeSuggestedQuantity(rec)
                  const baseFood = foodsById[rec.foodId]
                  return (
                    <div
                      key={`${rec.foodId}-${idx}`}
                      className='flex flex-col gap-2 rounded-lg border border-base-content/10 p-3 text-sm'
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <div className='font-medium truncate'>{rec.name}</div>
                          {rec.portion && (
                            <div className='text-xs text-base-content/60'>Portion: {rec.portion}</div>
                          )}
                          <div className='text-xs text-base-content/70'>
                            {calories} kcal • P {protein}g • C {carbs}g • F {fat}g
                          </div>
                          {baseFood && (
                            <div className='text-[10px] uppercase tracking-wide text-base-content/50'>
                              ≈ {approxQuantity}× saved serving
                            </div>
                          )}
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
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MealCard
