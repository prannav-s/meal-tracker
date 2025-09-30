import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import Navbar from '../components/Navbar'
import api from '../lib/axios.js'
import toast from 'react-hot-toast'
import {
  ArrowLeftIcon,
  CameraIcon,
  CheckCircle2Icon,
  ImagePlusIcon,
  RefreshCwIcon
} from 'lucide-react'

const FoodsUploadPage = () => {
  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const hasResults = useMemo(() => Boolean(result?.items?.length), [result])
  const resultCount = useMemo(
    () => Number(result?.count ?? result?.items?.length ?? 0),
    [result]
  )

  const acceptFile = (selected) => {
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file')
      return
    }
    setErrorMessage('')
    setResult(null)
    setFile(selected)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleFileSelect = (event) => {
    const selected = event.target.files?.[0]
    event.target.value = ''
    acceptFile(selected)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const dropped = event.dataTransfer?.files?.[0]
    acceptFile(dropped)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const resetSelection = () => {
    setFile(null)
    setResult(null)
    setErrorMessage('')
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
  }

  const uploadImage = async () => {
    if (!file) {
      setErrorMessage('Select or capture an image first')
      return
    }
    setUploading(true)
    setErrorMessage('')

    const formData = new FormData()
    formData.append('image', file)

    try {
      const { data } = await api.post('/foods/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(data)
      const addedCount = Number(data?.count ?? data?.items?.length ?? 0)
      if (addedCount > 0) {
        toast.success(`Added ${addedCount} food${addedCount === 1 ? '' : 's'}`)
      } else {
        toast.success('Foods updated')
      }
    } catch (error) {
      const message = error?.response?.data?.error || 'Failed to extract foods'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const openGalleryPicker = () => {
    galleryInputRef.current?.click()
  }

  const openCameraPicker = () => {
    cameraInputRef.current?.click()
  }

  const goBack = () => navigate(-1)
  const goToFoods = () => navigate('/foods')

  return (
    <div className='min-h-screen'>
      <Navbar />
      <div className='mx-auto max-w-3xl px-4 pb-12 pt-6'>
        <button className='btn btn-ghost btn-sm mb-4' onClick={goBack}>
          <ArrowLeftIcon className='size-4' /> Back
        </button>

        <div className='card border border-base-content/10 bg-base-100 shadow-sm'>
          <div className='card-body space-y-6'>
            <div className='space-y-2 text-center sm:text-left'>
              <h1 className='text-2xl font-bold text-primary'>Take a photo of a meal or nutrition label</h1>
              <p className='text-sm text-base-content/70'>
                Upload a clear photo of an ingredients list, meal, or nutrition label. We will extract foods for you and add them to your library.
              </p>
            </div>

            <div
              className='relative flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-base-content/20 bg-base-200/50 p-6 text-center'
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className='w-full overflow-hidden rounded-lg border border-base-content/10'>
                  <img src={previewUrl} alt='Selected preview' className='h-64 w-full object-cover' />
                </div>
              ) : (
                <div className='flex flex-col items-center gap-3 text-base-content/60'>
                  <ImagePlusIcon className='size-12 text-primary/80' />
                  <div>
                    <p className='font-medium text-base-content'>Drop a photo here or use the buttons below</p>
                    <p className='text-xs text-base-content/60'>PNG, JPG, up to 5 MB</p>
                  </div>
                </div>
              )}
            </div>

            <div className='flex flex-col gap-3 sm:flex-row'>
              <button
                type='button'
                className='btn btn-outline gap-2'
                onClick={openGalleryPicker}
                disabled={uploading}
              >
                <ImagePlusIcon className='size-5' />
                <span>Choose Photo</span>
              </button>
              <button
                type='button'
                className='btn btn-outline gap-2'
                onClick={openCameraPicker}
                disabled={uploading}
              >
                <CameraIcon className='size-5' />
                <span>Take Photo</span>
              </button>
              <button
                type='button'
                className={`btn btn-primary gap-2`}
                onClick={uploadImage}
                disabled={uploading}
              >
                <span>{uploading ? 'Uploading…' : 'Upload & Extract'}</span>
              </button>
            </div>

            {file && (
              <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg bg-base-200/60 px-4 py-3 text-sm'>
                <div className='min-w-0'>
                  <p className='font-medium truncate'>{file.name}</p>
                  <p className='text-xs text-base-content/60'>{Math.round(file.size / 1024)} KB</p>
                </div>
                <button type='button' className='btn btn-ghost btn-sm gap-2' onClick={resetSelection} disabled={uploading}>
                  <RefreshCwIcon className='size-4' /> Reset
                </button>
              </div>
            )}

            {errorMessage && (
              <div className='rounded-lg bg-error/10 px-4 py-3 text-sm text-error'>
                {errorMessage}
              </div>
            )}

            {hasResults && (
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-success'>
                  <CheckCircle2Icon className='size-5' />
                  <p className='font-semibold'>Added {resultCount} food{resultCount === 1 ? '' : 's'} from your photo</p>
                </div>
                <div className='space-y-3'>
                  {result.items.map((item) => (
                    <div key={item._id || item.id} className='rounded-lg border border-base-content/10 bg-base-200/40 p-4'>
                      <div className='flex flex-wrap items-baseline justify-between gap-2'>
                        <h3 className='text-lg font-semibold'>{item.name}</h3>
                        {item.brand && <span className='text-xs uppercase tracking-wide text-base-content/60'>{item.brand}</span>}
                      </div>
                      <div className='mt-2 text-xs text-base-content/70'>
                        {Math.round(item.calories)} kcal • P {Math.round(item.protein)}g • C {Math.round(item.carbs)}g • F {Math.round(item.fat)}g
                      </div>
                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-2'>
                          {item.tags.map((tag, index) => (
                            <span key={index} className='badge badge-ghost badge-sm'>#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button type='button' className='btn btn-primary w-full sm:w-auto' onClick={goToFoods}>
                  View all foods
                </button>
              </div>
            )}

            <input
              ref={galleryInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleFileSelect}
            />
            <input
              ref={cameraInputRef}
              type='file'
              accept='image/*'
              capture='environment'
              className='hidden'
              onChange={handleFileSelect}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FoodsUploadPage
