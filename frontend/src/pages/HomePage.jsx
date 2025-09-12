import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast';
import api from '../lib/axios.js';


const HomePage = () => {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const res = await api.get(`/days/${today}/meals`);
        console.log(res.data);
        setMeals(res.data);
      } catch (error) {
        console.log("Error fetching meals")
      }
      finally {
        setLoading(false)
      }
    }
    fetchMeals();
  }, [])
  return (
    <div className='min-h-screen'>
      <Navbar />
      <div className='max-w-7xl mx-auto p-4 mt-6'>
        {loading && <div className='text-center text-prmary py-10'>Loading meals...</div>}
        {meals.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {meals.map((note) => (
              <div>
                <NoteCard key = { note.id } note = { note } setMeals={setMeals}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage