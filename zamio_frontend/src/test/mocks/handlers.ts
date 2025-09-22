import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:9001/api'

export const handlers = [
  // Authentication endpoints
  http.post(`${API_BASE_URL}/auth/login/`, () => {
    return HttpResponse.json({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        user_type: 'Artist',
        is_verified: true,
      },
    })
  }),

  http.post(`${API_BASE_URL}/auth/register/`, () => {
    return HttpResponse.json({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: {
        id: 2,
        email: 'newuser@example.com',
        first_name: 'New',
        last_name: 'User',
        user_type: 'Artist',
        is_verified: false,
      },
    }, { status: 201 })
  }),

  http.post(`${API_BASE_URL}/auth/token/refresh/`, () => {
    return HttpResponse.json({
      access: 'new-mock-access-token',
    })
  }),

  http.get(`${API_BASE_URL}/auth/user/`, () => {
    return HttpResponse.json({
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      user_type: 'Artist',
      is_verified: true,
      kyc_status: 'verified',
    })
  }),

  // Artist endpoints
  http.get(`${API_BASE_URL}/artists/profile/`, () => {
    return HttpResponse.json({
      id: 1,
      stage_name: 'Test Artist',
      bio: 'Test artist bio',
      self_publish: true,
      country: 'Ghana',
      city: 'Accra',
      genre: 'Afrobeats',
      user: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      },
    })
  }),

  http.patch(`${API_BASE_URL}/artists/profile/`, () => {
    return HttpResponse.json({
      id: 1,
      stage_name: 'Updated Artist',
      bio: 'Updated bio',
      self_publish: true,
      country: 'Ghana',
      city: 'Accra',
      genre: 'Hip Hop',
    })
  }),

  http.get(`${API_BASE_URL}/artists/tracks/`, () => {
    return HttpResponse.json({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          title: 'Test Track 1',
          duration: 180,
          genre: 'Afrobeats',
          release_date: '2024-01-01',
          fingerprint_status: 'completed',
          artist: {
            id: 1,
            stage_name: 'Test Artist',
          },
        },
        {
          id: 2,
          title: 'Test Track 2',
          duration: 200,
          genre: 'Hip Hop',
          release_date: '2024-01-15',
          fingerprint_status: 'processing',
          artist: {
            id: 1,
            stage_name: 'Test Artist',
          },
        },
      ],
    })
  }),

  http.post(`${API_BASE_URL}/artists/tracks/`, () => {
    return HttpResponse.json({
      id: 3,
      title: 'New Track',
      duration: 190,
      genre: 'Afrobeats',
      release_date: '2024-02-01',
      fingerprint_status: 'pending',
      artist: {
        id: 1,
        stage_name: 'Test Artist',
      },
    }, { status: 201 })
  }),

  http.get(`${API_BASE_URL}/artists/analytics/`, () => {
    return HttpResponse.json({
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
    })
  }),

  http.get(`${API_BASE_URL}/artists/royalties/`, () => {
    return HttpResponse.json({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          cycle: {
            id: 1,
            cycle_name: 'January 2024',
            start_date: '2024-01-01',
            end_date: '2024-01-31',
          },
          total_amount: '45.50',
          currency: 'GHS',
          status: 'paid',
          calculated_at: '2024-02-01T10:00:00Z',
          paid_at: '2024-02-05T14:30:00Z',
        },
      ],
    })
  }),

  // Station endpoints
  http.get(`${API_BASE_URL}/stations/profile/`, () => {
    return HttpResponse.json({
      id: 1,
      station_name: 'Test Radio Station',
      call_sign: 'TRS 101.5',
      frequency: 101.5,
      location: 'Accra',
      stream_url: 'http://test.stream.com/live',
      station_class: 'A',
      license_number: 'LIC-2024-001',
    })
  }),

  // Admin endpoints
  http.get(`${API_BASE_URL}/admin/users/`, () => {
    return HttpResponse.json({
      count: 3,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          email: 'artist@example.com',
          first_name: 'Test',
          last_name: 'Artist',
          user_type: 'Artist',
          kyc_status: 'verified',
          is_active: true,
        },
        {
          id: 2,
          email: 'station@example.com',
          first_name: 'Test',
          last_name: 'Station',
          user_type: 'Station',
          kyc_status: 'pending',
          is_active: true,
        },
      ],
    })
  }),

  // Error handlers
  http.get(`${API_BASE_URL}/error/404`, () => {
    return new HttpResponse(null, { status: 404 })
  }),

  http.get(`${API_BASE_URL}/error/500`, () => {
    return new HttpResponse(null, { status: 500 })
  }),

  // Fallback handler for unmatched requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    return new HttpResponse(null, { status: 404 })
  }),
]