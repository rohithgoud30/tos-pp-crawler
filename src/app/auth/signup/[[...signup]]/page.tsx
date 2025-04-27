import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className='flex min-h-[calc(100vh-200px)] justify-center items-center py-8'>
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-white dark:bg-gray-900',
          },
        }}
        routing='path'
        path='/auth/signup'
        signInUrl='/auth/login'
        redirectUrl='/'
      />
    </div>
  )
}
