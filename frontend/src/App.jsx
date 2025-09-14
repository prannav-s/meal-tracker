import {Route, Routes} from 'react-router'
import HomePage from './pages/HomePage'
import MealDetails from './pages/MealDetails'
import CreateMeal from './pages/CreateMeal'
import FoodsPage from './pages/FoodsPage'
import FoodDetails from './pages/FoodDetails'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import RequireAuth from './components/RequireAuth'
import toast from 'react-hot-toast'

const App = () => {
  return (
    <div className='relative min-h-screen w-full'> 
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>      
    <Routes>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/:date" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/:date/create" element={<RequireAuth><CreateMeal /></RequireAuth>} />
        <Route path="/:date/:mealName" element={<RequireAuth><MealDetails /></RequireAuth>} />
        <Route path="/foods" element={<RequireAuth><FoodsPage /></RequireAuth>} />
        <Route path="/foods/:id" element={<RequireAuth><FoodDetails /></RequireAuth>} />
      </Routes>
    </div>
  )
}

export default App;
