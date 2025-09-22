import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'mock-token')
    })

    // Mock API responses
    await page.route('**/api/auth/user/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          user_type: 'Artist',
        }),
      })
    })

    await page.route('**/api/artists/profile/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          stage_name: 'Test Artist',
          bio: 'Test artist bio',
          self_publish: true,
          user: {
            id: 1,
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
          },
        }),
      })
    })

    await page.route('**/api/artists/analytics/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_plays: 150,
          total_earnings: '45.50',
          top_stations: [
            { station_name: 'Radio Station 1', plays: 50 },
            { station_name: 'Radio Station 2', plays: 30 },
          ],
          geographic_distribution: [
            { region: 'Greater Accra', plays: 80 },
            { region: 'Ashanti', plays: 40 },
          ],
          trend_data: [
            { date: '2024-01-01', plays: 10, earnings: '3.00' },
            { date: '2024-01-02', plays: 15, earnings: '4.50' },
          ],
        }),
      })
    })

    await page.route('**/api/artists/tracks/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 2,
          results: [
            {
              id: 1,
              title: 'Test Track 1',
              duration: 180,
              genre: 'Afrobeats',
              release_date: '2024-01-01',
              fingerprint_status: 'completed',
            },
            {
              id: 2,
              title: 'Test Track 2',
              duration: 200,
              genre: 'Hip Hop',
              release_date: '2024-01-15',
              fingerprint_status: 'processing',
            },
          ],
        }),
      })
    })
  })

  test('should display dashboard content', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.getByText(/welcome back/i)).toBeVisible()
    await expect(page.getByText(/test artist/i)).toBeVisible()
  })

  test('should display analytics cards', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.getByText(/total plays/i)).toBeVisible()
    await expect(page.getByText(/total earnings/i)).toBeVisible()
    await expect(page.getByText('150')).toBeVisible() // Play count
    await expect(page.getByText('45.50')).toBeVisible() // Earnings
  })

  test('should display recent tracks', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.getByText(/recent tracks/i)).toBeVisible()
    await expect(page.getByText(/test track 1/i)).toBeVisible()
    await expect(page.getByText(/test track 2/i)).toBeVisible()
  })

  test('should display top stations', async ({ page }) => {
    await page.goto('/dashboard')
    
    await expect(page.getByText(/top stations/i)).toBeVisible()
    await expect(page.getByText(/radio station 1/i)).toBeVisible()
    await expect(page.getByText(/radio station 2/i)).toBeVisible()
  })

  test('should navigate to tracks page from quick actions', async ({ page }) => {
    await page.goto('/dashboard')
    
    await page.getByRole('link', { name: /upload track/i }).click()
    
    await expect(page).toHaveURL('/tracks/upload')
  })

  test('should navigate to analytics page from quick actions', async ({ page }) => {
    await page.goto('/dashboard')
    
    await page.getByRole('link', { name: /view analytics/i }).click()
    
    await expect(page).toHaveURL('/analytics')
  })

  test('should navigate to payments page from quick actions', async ({ page }) => {
    await page.goto('/dashboard')
    
    await page.getByRole('link', { name: /request payment/i }).click()
    
    await expect(page).toHaveURL('/payments')
  })

  test('should refresh data when refresh button is clicked', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for initial load
    await expect(page.getByText('150')).toBeVisible()
    
    // Mock updated data
    await page.route('**/api/artists/analytics/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_plays: 200, // Updated value
          total_earnings: '60.00', // Updated value
          top_stations: [],
          geographic_distribution: [],
          trend_data: [],
        }),
      })
    })
    
    await page.getByRole('button', { name: /refresh/i }).click()
    
    // Should show updated data
    await expect(page.getByText('200')).toBeVisible()
    await expect(page.getByText('60.00')).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/artists/analytics/', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { message: 'Failed to load analytics' },
        }),
      })
    })
    
    await page.goto('/dashboard')
    
    await expect(page.getByText(/failed to load analytics/i)).toBeVisible()
  })

  test('should display empty state when no tracks', async ({ page }) => {
    // Mock empty tracks response
    await page.route('**/api/artists/tracks/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 0,
          results: [],
        }),
      })
    })

    await page.route('**/api/artists/analytics/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_plays: 0,
          total_earnings: '0.00',
          top_stations: [],
          geographic_distribution: [],
          trend_data: [],
        }),
      })
    })
    
    await page.goto('/dashboard')
    
    await expect(page.getByText(/no tracks uploaded yet/i)).toBeVisible()
    await expect(page.getByText(/upload your first track/i)).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/dashboard')
    
    // Check that content is still visible and accessible
    await expect(page.getByText(/welcome back/i)).toBeVisible()
    await expect(page.getByText(/total plays/i)).toBeVisible()
    
    // Check that navigation is accessible (hamburger menu)
    const mobileMenuButton = page.getByRole('button', { name: /menu/i })
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      await expect(page.getByRole('navigation')).toBeVisible()
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Continue tabbing through elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      const currentFocus = page.locator(':focus')
      await expect(currentFocus).toBeVisible()
    }
  })

  test('should maintain theme preference', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Toggle to dark theme
    await page.getByRole('button', { name: /toggle theme/i }).click()
    
    // Check that dark theme is applied
    await expect(page.locator('html')).toHaveClass(/dark/)
    
    // Refresh page
    await page.reload()
    
    // Theme should persist
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})