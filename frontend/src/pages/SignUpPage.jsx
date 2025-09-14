import { SignUp } from '@clerk/clerk-react'

const SignUpPage = () => {
  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4'>
      <SignUp routing='path' path='/sign-up' signInUrl='/sign-in' />
    </div>
  )
}

export default SignUpPage

