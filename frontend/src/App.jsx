import {Route, Routes} from 'react-router'
import HomePage from './pages/HomePage'
import MealDetails from './pages/MealDetails'
import CreateMeal from './pages/CreateMeal'
import FoodsPage from './pages/FoodsPage'
import FoodDetails from './pages/FoodDetails'
import toast from 'react-hot-toast'

const App = () => {
  return (
    <div className='relative min-h-screen w-full'> 
      <div className='absolute inset-0 -z-10 w-full h-full items-center px-5 py-24 [background: base-200]'></div>
      <Routes>
        <Route path="/" element = {<HomePage /> }/>
        <Route path="/:date" element={<HomePage />} />
        <Route path="/:date/create" element = {<CreateMeal /> }/>
        <Route path="/:date/:mealName" element = {<MealDetails /> }/>
        <Route path="/foods" element={<FoodsPage />} />
        <Route path="/foods/:id" element={<FoodDetails />} />
      </Routes>
    </div>
  )
}

export default App;
