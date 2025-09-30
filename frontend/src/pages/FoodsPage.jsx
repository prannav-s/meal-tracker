import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { PlusIcon } from 'lucide-react'
import FoodCard from '../components/FoodCard'
import FoodsNotFound from '../components/FoodsNotFound.jsx'
import { useNavigate } from 'react-router'

import toast from 'react-hot-toast';
import api from '../lib/axios.js';


const FoodsPage = () => {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await api.get(`/foods`);
        setFoods(res.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          toast.error("Error fetching foods");    
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);
  
  const createNewFood = async () => {
    try {
      const res = await api.post('/foods', { name: "New Food", calories: 0, protein: 0, carbs: 0, fat: 0 })
      toast.success("Food created successfully")
      console.log(res)
      navigate(`/foods/${res.data._id }`)
    } 
    catch (error) {
        toast.error("Failed to create food", {
              duration: 4000,
              icon: "❌"
          })
        console.log("Error creating food", error)

    }
    finally {
      setLoading(false)
    }
  }
  

  return (
    <div className='min-h-screen'>
      <Navbar />
      <div className='mx-auto mt-6 max-w-7xl px-4 pb-8'>
       {foods.length > 0 && (
        <div className='mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-end'>
          <button
            className='btn btn-ghost btn-sm w-full justify-center gap-2 sm:w-auto'
            onClick={createNewFood}
          >
            <PlusIcon className='size-4' />
            <span>Add Food</span>
          </button>
        </div>
       )}
        {loading && <div className='text-center text-prmary py-10'>Loading foods...</div>}
        {foods.length === 0 && <FoodsNotFound />}
        {foods.length > 0 && (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {foods.map((food) => (
              <div key={food._id || food.id}>
                <FoodCard food={food} setFoods={setFoods} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FoodsPage
