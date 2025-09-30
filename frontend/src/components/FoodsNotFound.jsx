import { PizzaIcon, PlusIcon } from "lucide-react";
import { useNavigate } from "react-router";
import toast from 'react-hot-toast';
import api from '../lib/axios.js';


const FoodsNotFound = () => {
    const navigate = useNavigate()
    const createNewFood = async () => {
        try {
        const res = await api.post('/foods', { name: "New Food", calories: 0, protein: 0, carbs: 0, fat: 0 })
        toast.success("Food created successfully")
        navigate(`/foods/${res.data._id }`)
        } 
        catch (error) {
            toast.error("Failed to create food", {
                duration: 4000,
                icon: "❌"
            })
            if (import.meta.env.DEV) {
              console.error('Error creating food', error)
            }
        }
    }
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-md mx-auto text-center">
      <div className="bg-primary/10 rounded-full p-8">
        <PizzaIcon className="size-10 text-primary" />
      </div>
      <h3 className="text-2xl font-bold">No entries yet</h3>
      <p className="text-base-content/70">
        Create a food to start tracking!
      </p>
        <button
          className='btn btn-primary w-full justify-center gap-2 sm:w-auto'
          onClick={createNewFood}
        >
          <PlusIcon className='size-4' />
          <span>Add Food</span>
        </button>
    </div>
  );
};
export default FoodsNotFound;
