import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from '../src/config/db.js'
import Day from '../src/models/Day.js'
import Meal from '../src/models/Meal.js'
import Food from '../src/models/Food.js'

dotenv.config()

async function run() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Missing MONGO_URI in environment')
      process.exit(1)
    }
    await connectDB()
    const conn = mongoose.connection
    console.log('Connected to', conn.name)

    const results = {}
    results.days = await Day.deleteMany({})
    results.meals = await Meal.deleteMany({})
    results.foods = await Food.deleteMany({})

    console.log('Cleared collections:')
    console.log('  days:', results.days.deletedCount)
    console.log('  meals:', results.meals.deletedCount)
    console.log('  foods:', results.foods.deletedCount)

    await mongoose.disconnect()
    console.log('Done')
    process.exit(0)
  } catch (err) {
    console.error('Error clearing dev collections:', err)
    process.exit(1)
  }
}

run()

