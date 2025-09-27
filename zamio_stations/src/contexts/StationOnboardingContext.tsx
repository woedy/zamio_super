import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { getStationId, getToken } from '../lib/auth';

export type StationOnboardingStep = 'profile' | 'staff' | 'report' | 'payment' | 'done';

export interface StationOnboardingStatus {
  station_id: string;
  onboarding_step: StationOnboardingStep;
  profile_completed: boolean;
  staff_completed: boolean;
  payment_info_added: boolean;
  kyc_status?: string;
  kyc_documents?: unknown;
  station_name?: string;
  station_class?: string | null;
  station_type?: string | null;
  license_number?: string | null;
  coverage_area?: string | null;
  estimated_listeners?: number | null;
  country?: string | null;
  region?: string | null;
  profile_complete_percentage?: number;
  next_recommended_step?: StationOnboardingStep;
  required_fields?: Record<string, { completed: boolean; fields: string[] }>;
  compliance_setup?: {
    license_number: string | null;
    station_class: string | null;
    station_type: string | null;
    coverage_area?: string | null;
    estimated_listeners?: number | null;
    compliance_complete: boolean;
  };
  stream_links?: Array<{
    id: number;
    link: string;
    active: boolean;
  }>;
  staff_members?: Array<{
    id: number;
    name: string;
    email: string | null;
    role: string;
  }>;
}

export interface StationProfileDetails {
  station_id: string;
  name?: string;
  bio?: string | null;
  country?: string | null;
  region?: string | null;
  photo?: string | null;
  momo_account?: string | null;
  bank_account?: string | null;
  license_number?: string | null;
  station_class?: string | null;
  station_type?: string | null;
  compliance_contact_name?: string | null;
  compliance_contact_email?: string | null;
  compliance_contact_phone?: string | null;
}

interface StationOnboardingContextValue {
  status: StationOnboardingStatus | null;
  details: StationProfileDetails | null;
  loading: boolean;
  error: string | null;
  refresh: (options?: { silent?: boolean }) => Promise<StationOnboardingStatus | null>;
}

const StationOnboardingContext = createContext<StationOnboardingContextValue | undefined>(undefined);

export const StationOnboardingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [status, setStatus] = useState<StationOnboardingStatus | null>(null);
  const [details, setDetails] = useState<StationProfileDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    const stationId = getStationId();
    const token = getToken();

    if (!stationId || !token) {
      setStatus(null);
      setDetails(null);
      setError(null);
      return null;
    }

    const [statusResponse, detailsResponse] = await Promise.all([
      api.get(`api/accounts/enhanced-station-onboarding-status/${stationId}/`),
      api.get('api/stations/get-station-details/', { params: { station_id: stationId } }),
    ]);

    const statusData: StationOnboardingStatus = statusResponse?.data?.data;
    const detailsData: StationProfileDetails = detailsResponse?.data?.data;

    setStatus(statusData ?? null);
    setDetails(detailsData ?? null);
    setError(null);

    return statusData ?? null;
  }, []);

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      try {
        return await fetchStatus();
      } catch (err) {
        const message = (err as any)?.response?.data?.message || (err as any)?.message || 'Failed to load onboarding status';
        setError(message);
        setStatus(null);
        setDetails(null);
        return null;
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [fetchStatus],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ status, details, loading, error, refresh }),
    [status, details, loading, error, refresh],
  );

  return (
    <StationOnboardingContext.Provider value={value}>
      {children}
    </StationOnboardingContext.Provider>
  );
};

export const useStationOnboardingContext = (): StationOnboardingContextValue => {
  const context = useContext(StationOnboardingContext);
  if (!context) {
    throw new Error('useStationOnboardingContext must be used within a StationOnboardingProvider');
  }
  return context;
};

