import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Navbar from '../components/Navbar'
import MealCard from '../components/MealCard'
import MealsNotFound from '../components/MealsNotFound'
import toast from 'react-hot-toast';
import api from '../lib/axios.js';


const HomePage = () => {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [foods, setFoods] = useState([])
  const [showQuickAdds, setShowQuickAdds] = useState(true)

  const { date: routeDate } = useParams();
  const date = routeDate || new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [mealsRes, foodsRes] = await Promise.all([
          api.get(`/days/${date}/meals`),
          api.get('/foods')
        ])
        setMeals(mealsRes.data)
        setFoods(foodsRes.data)
      } catch (error) {
        if (error.response && error.response.status === 404) {
          try {
            await api.post('/days', { date })
            const [mealsRes, foodsRes] = await Promise.all([
              api.get(`/days/${date}/meals`),
              api.get('/foods')
            ])
            setMeals(mealsRes.data)
            setFoods(foodsRes.data)
          } catch (creationError) {
            if (import.meta.env.DEV) {
              console.error('Failed to seed meals for date', date, creationError)
            }
            toast.error(`Failed to create entry for ${date}`)
          }
        } else {
          toast.error('Error fetching meals')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [date]);

  return (
    <div className='min-h-screen'>
      <Navbar />
      <div className='max-w-7xl mx-auto p-4 mt-6'>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
          <h1 className='text-2xl font-semibold'></h1>
          {meals.length > 0 && (<label className='flex items-center gap-2 text-sm'>
             <span className='text-base-content/70'>Show quick adds</span>
            <input
              type='checkbox'
              className='toggle toggle-primary'
              checked={showQuickAdds}
              onChange={(e) => setShowQuickAdds(e.target.checked)}
            />
          </label>)
          }
        </div>
        {loading && <div className='text-center text-primary py-10'>Loading meals...</div>}
        {meals.length === 0 && <MealsNotFound/>}
        {meals.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
            {meals.map((meal) => (
              <div key={meal._id || meal.id}>
                <MealCard
                  meal={meal}
                  setMeals={setMeals}
                  foods={foods}
                  showQuickAdds={showQuickAdds}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
