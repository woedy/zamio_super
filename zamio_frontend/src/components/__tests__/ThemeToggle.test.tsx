import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import { ThemeToggle } from '../ThemeToggle'
import { simulateUserInteraction } from '@/test/utils'

// Mock the theme context
const mockToggleTheme = vi.fn()
const mockThemeContext = {
  theme: 'light' as const,
  toggleTheme: mockToggleTheme,
}

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => mockThemeContext,
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders theme toggle button', () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    expect(toggleButton).toBeInTheDocument()
  })

  it('displays correct icon for light theme', () => {
    render(<ThemeToggle />)
    
    // Should show moon icon for light theme (to switch to dark)
    const moonIcon = screen.getByTestId('moon-icon')
    expect(moonIcon).toBeInTheDocument()
  })

  it('displays correct icon for dark theme', () => {
    mockThemeContext.theme = 'dark'
    
    render(<ThemeToggle />)
    
    // Should show sun icon for dark theme (to switch to light)
    const sunIcon = screen.getByTestId('sun-icon')
    expect(sunIcon).toBeInTheDocument()
  })

  it('calls toggleTheme when clicked', async () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    await simulateUserInteraction(toggleButton, 'click')
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    expect(toggleButton).toHaveAttribute('aria-label')
    expect(toggleButton).toHaveAttribute('type', 'button')
  })

  it('is keyboard accessible', async () => {
    render(<ThemeToggle />)
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
    
    // Focus the button
    toggleButton.focus()
    expect(toggleButton).toHaveFocus()
    
    // Press Enter
    await simulateUserInteraction(toggleButton, 'click')
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('maintains theme state across re-renders', () => {
    const { rerender } = render(<ThemeToggle />)
    
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    
    // Change theme and rerender
    mockThemeContext.theme = 'dark'
    rerender(<ThemeToggle />)
    
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
  })
})