import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { ProtectedRoute } from '../ProtectedRoute'
import { MemoryRouter } from 'react-router-dom'

// Mock the auth context
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

const TestComponent = () => <div>Protected Content</div>

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state when auth is loading', () => {
    mockAuthContext.isLoading = true
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    mockAuthContext.isLoading = false
    mockAuthContext.isAuthenticated = false
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )
    
    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    mockAuthContext.isLoading = false
    mockAuthContext.isAuthenticated = true
    mockAuthContext.user = {
      id: 1,
      email: 'test@example.com',
      user_type: 'Artist',
    }
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('checks user role when role is specified', () => {
    mockAuthContext.isLoading = false
    mockAuthContext.isAuthenticated = true
    mockAuthContext.user = {
      id: 1,
      email: 'test@example.com',
      user_type: 'Artist',
    }
    
    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="Admin">
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )
    
    // Should not render content for wrong role
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
  })

  it('renders children when user has correct role', () => {
    mockAuthContext.isLoading = false
    mockAuthContext.isAuthenticated = true
    mockAuthContext.user = {
      id: 1,
      email: 'admin@example.com',
      user_type: 'Admin',
    }
    
    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="Admin">
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('checks KYC status when required', () => {
    mockAuthContext.isLoading = false
    mockAuthContext.isAuthenticated = true
    mockAuthContext.user = {
      id: 1,
      email: 'test@example.com',
      user_type: 'Artist',
      kyc_status: 'pending',
    }
    
    render(
      <MemoryRouter>
        <ProtectedRoute requireKYC>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText(/kyc verification required/i)).toBeInTheDocument()
  })

  it('renders children when KYC is verified', () => {
    mockAuthContext.isLoading = false
    mockAuthContext.isAuthenticated = true
    mockAuthContext.user = {
      id: 1,
      email: 'test@example.com',
      user_type: 'Artist',
      kyc_status: 'verified',
    }
    
    render(
      <MemoryRouter>
        <ProtectedRoute requireKYC>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('provides custom unauthorized component', () => {
    mockAuthContext.isLoading = false
    mockAuthContext.isAuthenticated = false
    
    const CustomUnauthorized = () => <div>Custom unauthorized message</div>
    
    render(
      <MemoryRouter>
        <ProtectedRoute unauthorizedComponent={<CustomUnauthorized />}>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Custom unauthorized message')).toBeInTheDocument()
  })
})