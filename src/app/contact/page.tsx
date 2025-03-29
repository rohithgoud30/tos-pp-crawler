'use client'

import type React from 'react'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-black'>
      <main className='flex-1'>
        <section className='w-full py-12 md:py-24 lg:py-32'>
          <div className='container px-4 md:px-6'>
            <div className='space-y-4 text-center mb-16'>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-black dark:text-white'>
                Contact Us
              </h1>
              <p className='mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed'>
                {`Have questions or feedback? We'd love to hear from you.`}
              </p>
            </div>

            <div className='grid gap-10 lg:grid-cols-2'>
              <div className='space-y-8'>
                <div className='space-y-6'>
                  <h2 className='text-2xl font-bold'>Get in Touch</h2>
                  <p className='text-gray-500'>
                    Fill out the form and our team will get back to you as soon
                    as possible.
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-start gap-4'>
                    <Mail className='h-6 w-6 text-gray-800 mt-0.5' />
                    <div>
                      <h3 className='font-medium'>Email</h3>
                      <p className='text-gray-500'>support@crwlr.com</p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4'>
                    <Phone className='h-6 w-6 text-gray-800 mt-0.5' />
                    <div>
                      <h3 className='font-medium'>Phone</h3>
                      <p className='text-gray-500'>+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className='flex items-start gap-4'>
                    <MapPin className='h-6 w-6 text-gray-800 mt-0.5' />
                    <div>
                      <h3 className='font-medium'>Office</h3>
                      <p className='text-gray-500'>
                        123 Privacy Lane
                        <br />
                        San Francisco, CA 94103
                        <br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h3 className='text-xl font-medium'>Office Hours</h3>
                  <div className='grid grid-cols-2 gap-2 text-gray-500'>
                    <div>Monday - Friday</div>
                    <div>9:00 AM - 6:00 PM PST</div>
                    <div>Saturday</div>
                    <div>10:00 AM - 4:00 PM PST</div>
                    <div>Sunday</div>
                    <div>Closed</div>
                  </div>
                </div>
              </div>

              <div className='space-y-8'>
                {submitSuccess && (
                  <div className='bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6'>
                    {`Message sent successfully! We'll get back to you soon.`}
                  </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='space-y-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label htmlFor='name'>Name</Label>
                        <Input
                          id='name'
                          name='name'
                          placeholder='Your name'
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className='border-gray-200 focus:border-gray-400 focus:ring-gray-400'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='email'>Email</Label>
                        <Input
                          id='email'
                          name='email'
                          type='email'
                          placeholder='Your email'
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className='border-gray-200 focus:border-gray-400 focus:ring-gray-400'
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='subject'>Subject</Label>
                      <Input
                        id='subject'
                        name='subject'
                        placeholder='What is this regarding?'
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className='border-gray-200 focus:border-gray-400 focus:ring-gray-400'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='message'>Message</Label>
                      <Textarea
                        id='message'
                        name='message'
                        placeholder='Your message'
                        rows={6}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        className='border-gray-200 focus:border-gray-400 focus:ring-gray-400'
                      />
                    </div>
                  </div>

                  <Button
                    type='submit'
                    className='w-full bg-black text-white hover:bg-gray-900'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className='flex items-center gap-2'>
                        <svg
                          className='animate-spin h-4 w-4 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className='flex items-center gap-2'>
                        <Send className='h-4 w-4' />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>

                <div className='border-t border-gray-200 pt-6'>
                  <p className='text-sm text-gray-500'>
                    By submitting this form, you agree to our{' '}
                    <a href='/privacy' className='underline hover:text-black'>
                      Privacy Policy
                    </a>{' '}
                    and consent to us contacting you regarding your inquiry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
