import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Mock user data
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  user_type: 'Artist' as const,
  is_verified: true,
  kyc_status: 'verified' as const,
}

// Mock artist profile
export const mockArtistProfile = {
  id: 1,
  stage_name: 'Test Artist',
  bio: 'Test artist bio',
  self_publish: true,
  country: 'Ghana',
  city: 'Accra',
  genre: 'Afrobeats',
  user: mockUser,
}

// Mock track data
export const mockTrack = {
  id: 1,
  title: 'Test Track',
  duration: 180,
  genre: 'Afrobeats',
  release_date: '2024-01-01',
  fingerprint_status: 'completed' as const,
  artist: mockArtistProfile,
}

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper function to create authenticated render
export const renderWithAuth = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AuthenticatedProvider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    // Mock authenticated state
    const mockAuthContext = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    }

    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ChakraProvider>
            <ThemeProvider>
              <AuthProvider value={mockAuthContext}>
                {children}
              </AuthProvider>
            </ThemeProvider>
          </ChakraProvider>
        </QueryClientProvider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: AuthenticatedProvider, ...options })
}

// Helper function to wait for loading states
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Helper function to create mock API responses
export const createMockApiResponse = <T>(data: T, status = 200) => {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  }
}

// Helper function to simulate user interactions
export const simulateUserInteraction = async (
  element: HTMLElement,
  interaction: 'click' | 'type' | 'clear',
  value?: string
) => {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()

  switch (interaction) {
    case 'click':
      await user.click(element)
      break
    case 'type':
      if (value) await user.type(element, value)
      break
    case 'clear':
      await user.clear(element)
      break
  }
}

// Helper function to test accessibility
export const testAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('jest-axe')
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

// Helper function to test responsive design
export const testResponsiveDesign = (component: ReactElement) => {
  const breakpoints = [
    { width: 320, height: 568 }, // Mobile
    { width: 768, height: 1024 }, // Tablet
    { width: 1024, height: 768 }, // Desktop
    { width: 1920, height: 1080 }, // Large Desktop
  ]

  breakpoints.forEach(({ width, height }) => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    })

    // Trigger resize event
    window.dispatchEvent(new Event('resize'))

    // Render component and test
    const { container } = render(component)
    expect(container).toBeInTheDocument()
  })
}

// Mock localStorage for tests
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key])
    },
  }
}

// Helper to mock API calls
export const mockApiCall = <T>(data: T, delay = 0) => {
  return new Promise<T>(resolve => {
    setTimeout(() => resolve(data), delay)
  })
}