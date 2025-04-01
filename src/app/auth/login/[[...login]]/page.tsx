import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className='flex min-h-[calc(100vh-200px)] justify-center items-center py-8'>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-white dark:bg-gray-900',
          },
        }}
        routing='path'
        path='/auth/login'
        signUpUrl='/auth/signup'
        redirectUrl='/'
      />
    </div>
  )
}
