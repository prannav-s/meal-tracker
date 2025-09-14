import { useState } from 'react'
import { Link } from 'react-router'
import api from '../lib/axios.js'
import { Trash2Icon } from 'lucide-react'
import toast from 'react-hot-toast'

const FoodCard = ({ food, setFoods }) => {
  const [deleting, setDeleting] = useState(false)

  const refreshFoods = async () => {
    if (!setFoods) return
    const res = await api.get(`/foods`)
    setFoods(res.data)
  }

  const handleDelete = async (e, id) => {
    e.preventDefault()
    if (!window.confirm('Delete this food?')) return
    try {
      setDeleting(true)
      await api.delete(`/foods/${id}`)
      toast.success('Food deleted')
    } catch (e) {
      toast.error('Failed to delete food')
      console.error(e)
    } finally {
      setDeleting(false)
      refreshFoods()
    }
  }


  return (
    <Link to={`/foods/${food._id}`} className='card bg-base-100 border border-base-content/10 shadow-sm'>
      <div className='card-body gap-3'>
        <div className='grid grid-cols-[1fr_auto_auto] items-start gap-3'>
          <div className='min-w-0'>
            <div className='text-lg font-semibold truncate'>{food?.name}</div>
          </div>
          {food?.brand && (
            <div className='text-sm text-base-content/60 ml-2'>{food.brand}</div>
          )}
          <button
            className={`btn btn-ghost btn-xs justify-self-end text-error ${deleting ? 'loading' : ''}`}
            onClick={(e) => handleDelete(e, food._id)}
            disabled={deleting}
          >
            {deleting ? '' : <Trash2Icon className='size-5' />}
          </button>
          <div className='col-span-full text-sm text-base-content/70'>
            {food.calories} kcal • P {food.protein}g • C {food.carbs}g • F {food.fat}g
          </div>
        </div>

        <div className='divider my-1' />

        {(food?.tags?.length ?? 0) === 0 ? (
          <div className='text-base-content/60 text-sm'>No tags added yet.</div>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {food.tags.map((tag, idx) => (
              <span key={idx} className='badge badge-primary'>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export default FoodCard
