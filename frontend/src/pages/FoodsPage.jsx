import { useEffect, useState, useMemo } from 'react'
import Navbar from '../components/Navbar'
import { PlusIcon, CameraIcon } from 'lucide-react'
import FoodCard from '../components/FoodCard'
import FoodsNotFound from '../components/FoodsNotFound.jsx'
import { useNavigate } from 'react-router'

import toast from 'react-hot-toast';
import api from '../lib/axios.js';


const FoodsPage = () => {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

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

  const filteredFoods = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return foods
    return foods.filter((f) =>
      [f.name, f.brand, ...(f.tags || [])]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    )
  }, [foods, query])
  
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

  const addFoodFromImage = async () => {
    try {
      navigate('/foods/upload');
    } catch (error) {
      toast.error("Failed to open image upload", {
        duration: 4000,
        icon: "❌"
      });
      console.error("Error adding food from image", error);
    }
  }
  

  return (
    <div className='min-h-screen'>
      <Navbar />
      <div className='mx-auto mt-6 max-w-7xl px-4 pb-8'>
       {foods.length > 0 && (
        <div className='mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-end'>
          <input
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search foods by name, brand, or tag'
            className='input input-bordered w-full'
          />

          
          <button
            className='btn btn-ghost btn-sm w-full justify-center gap-2 sm:w-auto'
            onClick={createNewFood}
          >
            <PlusIcon className='size-4' />
            <span>Add Food</span>
          </button>
          <button
            className='btn btn-ghost btn-sm w-full justify-center gap-2 sm:w-auto'
            onClick={addFoodFromImage}
          >
            <CameraIcon className='size-4' />
            <span>Add from Image</span>
          </button>
        </div>
       )}
        {loading && <div className='text-center text-prmary py-10'>Loading foods...</div>}
        {foods.length === 0 && <FoodsNotFound />}
        {foods.length > 0 && (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filteredFoods.map((f) => (
              <div key={f._id || f.id}>
                <FoodCard food={f} setFoods={setFoods} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FoodsPage
