import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import { Dashboard } from '../Dashboard'
import { renderWithAuth } from '@/test/utils'

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard for authenticated user', async () => {
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      expect(screen.getByText(/test artist/i)).toBeInTheDocument()
    })
  })

  it('displays analytics cards', async () => {
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/total plays/i)).toBeInTheDocument()
      expect(screen.getByText(/total earnings/i)).toBeInTheDocument()
      expect(screen.getByText(/150/)).toBeInTheDocument() // Mock play count
      expect(screen.getByText(/45\.50/)).toBeInTheDocument() // Mock earnings
    })
  })

  it('displays recent tracks section', async () => {
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/recent tracks/i)).toBeInTheDocument()
      expect(screen.getByText(/test track 1/i)).toBeInTheDocument()
      expect(screen.getByText(/test track 2/i)).toBeInTheDocument()
    })
  })

  it('displays top stations section', async () => {
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/top stations/i)).toBeInTheDocument()
      expect(screen.getByText(/radio station 1/i)).toBeInTheDocument()
      expect(screen.getByText(/radio station 2/i)).toBeInTheDocument()
    })
  })

  it('displays earnings chart', async () => {
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/earnings trend/i)).toBeInTheDocument()
      // Chart component should be rendered
      expect(screen.getByTestId('earnings-chart')).toBeInTheDocument()
    })
  })

  it('displays geographic distribution', async () => {
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/geographic distribution/i)).toBeInTheDocument()
      expect(screen.getByText(/greater accra/i)).toBeInTheDocument()
      expect(screen.getByText(/ashanti/i)).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    renderWithAuth(<Dashboard />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    // Mock API error
    server.use(
      http.get('http://localhost:9001/api/artists/analytics/', () => {
        return HttpResponse.json(
          { error: { message: 'Failed to load analytics' } },
          { status: 500 }
        )
      })
    )
    
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load analytics/i)).toBeInTheDocument()
    })
  })

  it('displays quick actions section', async () => {
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/quick actions/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /upload track/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /view analytics/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /request payment/i })).toBeInTheDocument()
    })
  })

  it('navigates to correct pages from quick actions', async () => {
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      const uploadLink = screen.getByRole('link', { name: /upload track/i })
      expect(uploadLink).toHaveAttribute('href', '/tracks/upload')
      
      const analyticsLink = screen.getByRole('link', { name: /view analytics/i })
      expect(analyticsLink).toHaveAttribute('href', '/analytics')
      
      const paymentLink = screen.getByRole('link', { name: /request payment/i })
      expect(paymentLink).toHaveAttribute('href', '/payments')
    })
  })

  it('displays notifications if any', async () => {
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      // Check if notifications section exists
      const notificationsSection = screen.queryByText(/notifications/i)
      if (notificationsSection) {
        expect(notificationsSection).toBeInTheDocument()
      }
    })
  })

  it('refreshes data when refresh button is clicked', async () => {
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toBeInTheDocument()
    })
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await simulateUserInteraction(refreshButton, 'click')
    
    // Should show loading state again
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays empty state when no data available', async () => {
    // Mock empty response
    server.use(
      http.get('http://localhost:9001/api/artists/tracks/', () => {
        return HttpResponse.json({
          count: 0,
          results: []
        })
      }),
      http.get('http://localhost:9001/api/artists/analytics/', () => {
        return HttpResponse.json({
          total_plays: 0,
          total_earnings: '0.00',
          top_stations: [],
          geographic_distribution: [],
          trend_data: []
        })
      })
    )
    
    renderWithAuth(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/no tracks uploaded yet/i)).toBeInTheDocument()
      expect(screen.getByText(/upload your first track/i)).toBeInTheDocument()
    })
  })
})