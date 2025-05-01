'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Define the shape of our navigation state
type SearchState = {
  query: string
  documentType?: 'tos' | 'pp'
  sortOption: string
  sortOrder: 'asc' | 'desc'
  page: number
  perPage: number
}

// Define the context interface
interface NavigationContextType {
  lastSearchState: SearchState | null
  setLastSearchState: React.Dispatch<React.SetStateAction<SearchState | null>>
}

// Create the context with a default value
const NavigationContext = createContext<NavigationContextType>({
  lastSearchState: null,
  setLastSearchState: () => {},
})

// Create a provider component
export function NavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Try to load initial state from localStorage
  const [lastSearchState, setLastSearchState] = useState<SearchState | null>(
    null
  )

  // Load search state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('lastSearchState')
      if (savedState) {
        setLastSearchState(JSON.parse(savedState))
      }
    } catch (error) {
      console.error('Error loading search state from localStorage:', error)
    }
  }, [])

  // Save search state to localStorage whenever it changes
  useEffect(() => {
    if (lastSearchState) {
      try {
        localStorage.setItem('lastSearchState', JSON.stringify(lastSearchState))
      } catch (error) {
        console.error('Error saving search state to localStorage:', error)
      }
    }
  }, [lastSearchState])

  return (
    <NavigationContext.Provider value={{ lastSearchState, setLastSearchState }}>
      {children}
    </NavigationContext.Provider>
  )
}

// Create a custom hook to use the navigation context
export function useNavigation() {
  return useContext(NavigationContext)
}
