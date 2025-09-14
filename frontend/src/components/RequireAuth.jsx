import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

const RequireAuth = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export default RequireAuth

