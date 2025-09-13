import { LoaderIcon, ArrowLeftIcon, Trash2Icon } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router'
import api from '../lib/axios.js'

const FoodDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [calories, setCalories] = useState(0)
  const [protein, setProtein] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fat, setFat] = useState(0)
  const [tagsText, setTagsText] = useState('')

  useEffect(() => {
    const fetchFood = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/foods/${id}`)
        const f = res.data
        setName(f.name || '')
        setBrand(f.brand || '')
        setCalories(f.calories ?? 0)
        setProtein(f.protein ?? 0)
        setCarbs(f.carbs ?? 0)
        setFat(f.fat ?? 0)
        setTagsText(Array.isArray(f.tags) ? f.tags.join(', ') : '')
      } catch (e) {
        toast.error('Failed to load the food')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchFood()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this food?')) return
    try {
      setDeleting(true)
      await api.delete(`/foods/${id}`)
      toast.success('Food deleted')
      navigate('/foods')
    } catch (e) {
      toast.error('Failed to delete food')
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        brand: brand.trim() || undefined,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }
      await api.put(`/foods/${id}`, payload)
      toast.success('Food updated')
      navigate('/foods')
    } catch (e) {
      toast.error('Failed to update food')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-base-200 flex items-center justify-center'>
        <LoaderIcon className='size-10 text-primary animate-spin' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-base-200'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-2xl mx-auto'>
          <div className='flex items-center justify-between mb-6'>
            <Link to='/foods' className='btn btn-ghost'>
              <ArrowLeftIcon className='size-5' /> Back
            </Link>
            <button
              className={`btn btn-ghost btn-xs text-error ${deleting ? 'loading' : ''}`}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '' : <Trash2Icon className='size-5' />}
            </button>
          </div>

          <div className='card bg-base-100'>
            <div className='card-body'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='form-control'>
                  <label className='label'><span className='label-text'>Name</span></label>
                  <input
                    type='text'
                    className='input input-bordered'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className='form-control'>
                  <label className='label'><span className='label-text'>Brand</span></label>
                  <input
                    type='text'
                    className='input input-bordered'
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>

                <div className='form-control'>
                  <label className='label'><span className='label-text'>Calories</span></label>
                  <input
                    type='number'
                    className='input input-bordered'
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                  />
                </div>
                <div className='form-control'>
                  <label className='label'><span className='label-text'>Protein (g)</span></label>
                  <input
                    type='number'
                    className='input input-bordered'
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                  />
                </div>
                <div className='form-control'>
                  <label className='label'><span className='label-text'>Carbs (g)</span></label>
                  <input
                    type='number'
                    className='input input-bordered'
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                  />
                </div>
                <div className='form-control'>
                  <label className='label'><span className='label-text'>Fat (g)</span></label>
                  <input
                    type='number'
                    className='input input-bordered'
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                  />
                </div>

                <div className='form-control md:col-span-2'>
                  <label className='label'><span className='label-text'>Tags (comma-separated)</span></label>
                  <input
                    type='text'
                    className='input input-bordered'
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                  />
                </div>
              </div>

              <div className='card-actions justify-end mt-4'>
                <button
                  className={`btn btn-primary ${saving ? 'loading' : ''}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FoodDetailsPage
