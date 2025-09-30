import React, { useMemo, useState } from 'react'
import { PlusIcon, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router'
import api from '../lib/axios.js'

// Expects `meal` with shape:
// { name: 'Breakfast'|'Lunch'|'Dinner'|'Snack', foods: [{ _id, quantity, food: { name, brand, calories, protein, carbs, fat } }] }
// Also accepts optional setMeals updater to refresh list after mutations
const MealCard = ({ meal, setMeals }) => {
  const [deletingId, setDeletingId] = useState(null)
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
    <Link to={`/${date}/${encodeURIComponent(meal.name)}`} className='card bg-base-100 border border-base-content/10 shadow-sm transition hover:shadow-md'>
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
  )
}

export default MealCard
