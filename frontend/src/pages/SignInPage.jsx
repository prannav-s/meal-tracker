import { SignIn } from '@clerk/clerk-react'

const SignInPage = () => {
  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4'>
      <SignIn routing='path' path='/sign-in' signUpUrl='/sign-up' />
    </div>
  )
}

export default SignInPage

