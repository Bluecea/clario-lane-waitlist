import { useState } from 'react'
import { Mail, ArrowRight, Check, Sparkles } from 'lucide-react'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import dashboardImage from '../assets/image.png'
import brandImage from '../assets/brand.svg'

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Email validation schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function App() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setError(null)
    setIsLoading(true)

    try {
      // Validate email
      emailSchema.parse({ email })

      // Call Edge Function
      const { error: funcError } = await supabase.functions.invoke(
        'join-waitlist',
        {
          body: { email },
        }
      )

      if (funcError) throw funcError

      setIsSubmitted(true)
    } catch (err: any) {
      console.error('Error joining waitlist:', err)
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50'>
      {/* Header */}
      <header className='px-6 py-6'>
        <div className='max-w-7xl mx-auto flex items-center gap-2'>
          <div className='flex items-center gap-2'>
            <img src={brandImage} alt='Brand' className='w-28 h-auto' />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className='px-6 py-16 md:py-24'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            {/* Left Column - Content */}
            <div className='space-y-8'>
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full'>
                <Sparkles className='w-4 h-4' />
                <span className='text-sm'>Coming Soon</span>
              </div>

              <div className='space-y-4'>
                <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight'>
                  Read Faster,
                  <br />
                  <span className='bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent'>
                    Understand Better
                  </span>
                </h1>

                <p className='text-xl text-gray-600 max-w-xl'>
                  Transform your reading experience with ClarionLane. Track your
                  progress, improve your speed, and enhance comprehension with
                  intelligent insights.
                </p>
              </div>

              {/* Waitlist Form */}
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='flex flex-col sm:flex-row gap-3 max-w-md'>
                    <div className='relative flex-1'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                      <Input
                        type='email'
                        placeholder='Enter your email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className='pl-10 h-12 bg-white border-gray-200'
                      />
                    </div>
                    <Button
                      type='submit'
                      disabled={isLoading}
                      className='h-12 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-2'>
                      {isLoading ? 'Joining...' : 'Join Waitlist'}
                      {!isLoading && <ArrowRight className='w-4 h-4' />}
                    </Button>
                  </div>
                  {error && (
                    <p className='text-sm text-red-500 mt-2'>{error}</p>
                  )}
                  <p className='text-sm text-gray-500'>
                    Be the first to know when we launch. No spam, ever.
                  </p>
                </form>
              ) : (
                <div className='space-y-4 max-w-md'>
                  <div className='flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <div className='w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0'>
                      <Check className='w-6 h-6 text-white' />
                    </div>
                    <div>
                      <p className='font-semibold text-green-900'>
                        You're on the list!
                      </p>
                      <p className='text-sm text-green-700'>
                        We'll notify you when we launch.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className='grid grid-cols-3 gap-6 pt-8 max-w-md'>
                <div>
                  <div className='font-bold text-3xl text-gray-900'>2x</div>
                  <div className='text-sm text-gray-600'>Reading Speed</div>
                </div>
                <div>
                  <div className='font-bold text-3xl text-gray-900'>90%</div>
                  <div className='text-sm text-gray-600'>Comprehension</div>
                </div>
                <div>
                  <div className='font-bold text-3xl text-gray-900'>30d</div>
                  <div className='text-sm text-gray-600'>Goal Tracking</div>
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className='relative'>
              <div className='absolute -inset-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl opacity-20 blur-3xl'></div>
              <div className='relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200'>
                <img
                  src={dashboardImage}
                  alt='ClarionLane Dashboard Preview'
                  className='w-full h-auto'
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='px-6 py-12'>
        <div className='max-w-7xl mx-auto text-center text-sm text-gray-500'>
          <p>© 2025 ClarionLane. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
