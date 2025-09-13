import { ArrowLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import toast from 'react-hot-toast'
import api from '../lib/axios.js'
import { formatYMD } from '../lib/utils.js'

const CreateMeal = () => {
  const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  const [mealName, setMealName] = useState(mealOptions[0])
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { date: routeDate } = useParams();
  const date = routeDate || new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => { 
    e.preventDefault()

    if (!mealName.trim()) {
      toast.error("All fields are required")
      return
    }
    setLoading(true)
    try {
      await api.post(`/days/${date}/meals/`, {
        name: mealName
      })
      toast.success("Meal created successfully")
      navigate(`/${date}`)
    } catch (error) {
        if (error.response.status === 409) {
            toast.error(`${mealName} already exists for ${formatYMD(date)}, try adding food there`, {
            duration: 4000,
            icon: "✏️"
            })
        }
        else {
            toast.error("Failed to create meal", {
                duration: 4000,
                icon: "❌"
            })
        }
    
    
      console.log("Error creating meal", error)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-base-200'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-3xl mx-auto'>
          <Link to={`/${date}`} className='btn btn-ghost mb-4'>
            <ArrowLeftIcon className='size-5' />
            Back
          </Link>
          <div className='card bg-base-100'>
            <div className='card-body'>
              <h2 className='card-title text-2xl mb-4'>Create New Meal</h2>
              <form onSubmit={handleSubmit}>
                <div className='form-control mb-4'>
                  <label className='label'>
                    <span className='label-text'>Meal</span>
                  </label>
                  <select
                    className='select select-bordered'
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                  >
                    {mealOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className='card-actions justify-end'>
                  <button type='submit' className='btn btn-primary' disabled={loading}>
                  {loading ? 'Creating...' : 'Create Meal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateMeal
