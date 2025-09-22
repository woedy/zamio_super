import { describe, it, expect } from 'vitest'
import { render } from '@/test/utils'
import { testAccessibility } from '@/test/utils'
import { axe, toHaveNoViolations } from 'jest-axe'

// Import components to test
import { ThemeToggle } from '@/components/ThemeToggle'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  describe('Component Accessibility', () => {
    it('ThemeToggle should be accessible', async () => {
      const { container } = render(<ThemeToggle />)
      await testAccessibility(container)
    })

    it('ErrorBoundary should be accessible', async () => {
      const { container } = render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      )
      await testAccessibility(container)
    })

    it('ProtectedRoute should be accessible when authenticated', async () => {
      const { container } = renderWithAuth(
        <ProtectedRoute>
          <div>Protected content</div>
        </ProtectedRoute>
      )
      await testAccessibility(container)
    })
  })

  describe('Page Accessibility', () => {
    it('Login page should be accessible', async () => {
      const { container } = render(<Login />)
      await testAccessibility(container)
    })

    it('Dashboard page should be accessible', async () => {
      const { container } = renderWithAuth(<Dashboard />)
      
      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      })
      
      await testAccessibility(container)
    })
  })

  describe('Form Accessibility', () => {
    it('login form should have proper labels and ARIA attributes', async () => {
      const { container } = render(<Login />)
      
      // Check for proper form labels
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('required')
      
      // Check for form accessibility
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('form validation errors should be accessible', async () => {
      const { container } = render(<Login />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await simulateUserInteraction(submitButton, 'click')
      
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert')
        expect(errorMessages.length).toBeGreaterThan(0)
        
        // Each error should be associated with its input
        errorMessages.forEach(error => {
          expect(error).toHaveAttribute('id')
        })
      })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Navigation Accessibility', () => {
    it('navigation should be keyboard accessible', async () => {
      const { container } = renderWithAuth(<Dashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument()
      })
      
      const navigation = screen.getByRole('navigation')
      const links = within(navigation).getAllByRole('link')
      
      // All navigation links should be focusable
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
        link.focus()
        expect(link).toHaveFocus()
      })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('skip links should be present', async () => {
      const { container } = renderWithAuth(<Dashboard />)
      
      // Check for skip to main content link
      const skipLink = screen.getByText(/skip to main content/i)
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Interactive Elements Accessibility', () => {
    it('buttons should have accessible names', async () => {
      const { container } = render(<ThemeToggle />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAccessibleName()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('interactive elements should have focus indicators', async () => {
      const { container } = render(<Login />)
      
      const interactiveElements = [
        ...screen.getAllByRole('button'),
        ...screen.getAllByRole('textbox'),
        ...screen.getAllByRole('link'),
      ]
      
      interactiveElements.forEach(element => {
        element.focus()
        expect(element).toHaveFocus()
        
        // Check if element has visible focus indicator
        const styles = window.getComputedStyle(element)
        expect(
          styles.outline !== 'none' || 
          styles.boxShadow !== 'none' ||
          element.matches(':focus-visible')
        ).toBe(true)
      })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Color Contrast', () => {
    it('should meet WCAG color contrast requirements', async () => {
      const { container } = render(<Login />)
      
      // axe will check color contrast automatically
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      })
      
      expect(results).toHaveNoViolations()
    })

    it('should maintain contrast in dark mode', async () => {
      // Mock dark theme
      const mockThemeContext = {
        theme: 'dark' as const,
        toggleTheme: vi.fn(),
      }
      
      vi.mock('@/contexts/ThemeContext', () => ({
        useTheme: () => mockThemeContext,
      }))
      
      const { container } = render(<Login />)
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      })
      
      expect(results).toHaveNoViolations()
    })
  })

  describe('Screen Reader Compatibility', () => {
    it('should have proper heading hierarchy', async () => {
      const { container } = renderWithAuth(<Dashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })
      
      const headings = screen.getAllByRole('heading')
      
      // Check heading hierarchy (h1 -> h2 -> h3, etc.)
      let previousLevel = 0
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1))
        expect(level).toBeGreaterThanOrEqual(previousLevel)
        expect(level - previousLevel).toBeLessThanOrEqual(1)
        previousLevel = level
      })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper landmark regions', async () => {
      const { container } = renderWithAuth(<Dashboard />)
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
      })
      
      // Check for essential landmarks
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should provide alternative text for images', async () => {
      const { container } = renderWithAuth(<Dashboard />)
      
      const images = screen.getAllByRole('img')
      
      images.forEach(img => {
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')).not.toBe('')
      })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Responsive Design Accessibility', () => {
    it('should be accessible on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })
      
      window.dispatchEvent(new Event('resize'))
      
      const { container } = render(<Login />)
      
      // Check that interactive elements are large enough for touch
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect()
        expect(rect.width).toBeGreaterThanOrEqual(44) // WCAG minimum touch target
        expect(rect.height).toBeGreaterThanOrEqual(44)
      })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})