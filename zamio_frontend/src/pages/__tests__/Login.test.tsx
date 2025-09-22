import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { Login } from '../Login'
import { simulateUserInteraction } from '@/test/utils'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    render(<Login />)
    
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays validation errors for empty fields', async () => {
    render(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await simulateUserInteraction(submitButton, 'click')
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('displays validation error for invalid email format', async () => {
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await simulateUserInteraction(emailInput, 'type', 'invalid-email')
    await simulateUserInteraction(submitButton, 'click')
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await simulateUserInteraction(emailInput, 'type', 'test@example.com')
    await simulateUserInteraction(passwordInput, 'type', 'password123')
    await simulateUserInteraction(submitButton, 'click')
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error message for invalid credentials', async () => {
    // Mock failed login response
    server.use(
      http.post('http://localhost:9001/api/auth/login/', () => {
        return HttpResponse.json(
          { error: { message: 'Invalid credentials' } },
          { status: 401 }
        )
      })
    )
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await simulateUserInteraction(emailInput, 'type', 'test@example.com')
    await simulateUserInteraction(passwordInput, 'type', 'wrongpassword')
    await simulateUserInteraction(submitButton, 'click')
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    // Mock delayed response
    server.use(
      http.post('http://localhost:9001/api/auth/login/', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return HttpResponse.json({
          access: 'token',
          refresh: 'refresh',
          user: { id: 1, email: 'test@example.com' }
        })
      })
    )
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await simulateUserInteraction(emailInput, 'type', 'test@example.com')
    await simulateUserInteraction(passwordInput, 'type', 'password123')
    await simulateUserInteraction(submitButton, 'click')
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('has forgot password link', () => {
    render(<Login />)
    
    const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i })
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })

  it('has register link', () => {
    render(<Login />)
    
    const registerLink = screen.getByRole('link', { name: /sign up/i })
    expect(registerLink).toBeInTheDocument()
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('toggles password visibility', async () => {
    render(<Login />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click toggle button
    await simulateUserInteraction(toggleButton, 'click')
    
    // Password should now be visible
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Click again to hide
    await simulateUserInteraction(toggleButton, 'click')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('remembers user preference for "Remember me"', async () => {
    render(<Login />)
    
    const rememberCheckbox = screen.getByLabelText(/remember me/i)
    
    await simulateUserInteraction(rememberCheckbox, 'click')
    
    expect(rememberCheckbox).toBeChecked()
  })

  it('handles network errors gracefully', async () => {
    // Mock network error
    server.use(
      http.post('http://localhost:9001/api/auth/login/', () => {
        return HttpResponse.error()
      })
    )
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await simulateUserInteraction(emailInput, 'type', 'test@example.com')
    await simulateUserInteraction(passwordInput, 'type', 'password123')
    await simulateUserInteraction(submitButton, 'click')
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })
})