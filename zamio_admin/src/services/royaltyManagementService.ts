import { baseUrl, userToken } from '../constants';

export interface RoyaltyCycle {
  id: number;
  name: string;
  territory: string;
  period_start: string;
  period_end: string;
  status: 'Open' | 'Locked' | 'Invoiced' | 'Remitted';
  admin_fee_percent_default: number;
  created_at: string;
  line_items_count?: number;
  total_gross_amount?: number;
  total_admin_fees?: number;
  total_net_amount?: number;
}

export interface RoyaltyLineItem {
  id: number;
  royalty_cycle: number;
  partner: {
    id: number;
    display_name: string;
    company_name: string;
    pro_code: string;
    country_code: string;
  } | null;
  external_work: {
    id: number;
    title: string;
    iswc: string;
  } | null;
  external_recording: {
    id: number;
    title: string;
    isrc: string;
    duration: number;
  } | null;
  usage_count: number;
  total_duration_seconds: number;
  gross_amount: number;
  admin_fee_amount: number;
  net_amount: number;
  calculation_notes: string;
}

export interface PartnerRemittance {
  id: number;
  partner: {
    id: number;
    display_name: string;
    company_name: string;
    pro_code: string;
  };
  royalty_cycle: {
    id: number;
    name: string;
    period_start: string;
    period_end: string;
  };
  currency: string;
  gross_amount: number;
  admin_fee_amount: number;
  net_payable: number;
  payment_reference: string;
  statement_file: string;
  status: 'Pending' | 'Sent' | 'Settled' | 'Failed';
  sent_at: string | null;
  settled_at: string | null;
  notes: string;
  created_at: string;
}

export interface RoyaltyCalculationAudit {
  id: number;
  calculation_id: string;
  calculation_type: 'individual' | 'batch' | 'cycle' | 'recalculation';
  total_amount: number;
  currency: string;
  distributions_count: number;
  calculated_at: string;
  calculated_by: string;
  errors_count: number;
  has_errors: boolean;
  play_log_id?: number;
  royalty_cycle_id?: number;
}

export interface RoyaltyRateStructure {
  id: number;
  name: string;
  station_class: string;
  station_class_display: string;
  time_period: string;
  time_period_display: string;
  base_rate_per_second: number;
  multiplier: number;
  effective_date: string;
  currency: string;
}

export interface CurrencyExchangeRate {
  id: number;
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
  source: string;
}

export interface RoyaltyOverview {
  cycle_stats: {
    total_cycles: number;
    open_cycles: number;
    locked_cycles: number;
    invoiced_cycles: number;
    remitted_cycles: number;
  };
  financial_stats: {
    total_gross_amount: number;
    total_admin_fees: number;
    total_net_amount: number;
    pending_remittances: number;
    currency: string;
  };
  recent_activity: {
    recent_calculations: number;
    recent_remittances: number;
    failed_payments: number;
  };
  partner_stats: {
    total_partners: number;
    active_agreements: number;
    pending_payments: number;
  };
  last_updated: string;
}

export interface DisputeOverview {
  dispute_stats: {
    total_disputes: number;
    open_disputes: number;
    under_review: number;
    resolved_disputes: number;
    escalated_disputes: number;
  };
  dispute_types: {
    royalty_calculation: number;
    payment_issues: number;
    detection_accuracy: number;
    ownership_claims: number;
  };
  resolution_metrics: {
    average_resolution_time: number;
    resolution_rate: number;
    admin_interventions: number;
  };
  recent_activity: {
    new_disputes: number;
    resolved_this_week: number;
    pending_admin_action: number;
  };
}

export interface PaymentProcessingStatus {
  payment_id: string;
  recipient_type: 'artist' | 'publisher' | 'partner_pro';
  recipient_id: string;
  recipient_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  initiated_at: string;
  completed_at: string | null;
  failure_reason: string | null;
  retry_count: number;
  next_retry_at: string | null;
  transaction_reference: string | null;
}

class RoyaltyManagementService {
  private baseURL = `${baseUrl}api/royalties/`;
  
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };
  }

  // Royalty Cycle Management
  async getRoyaltyOverview(): Promise<RoyaltyOverview> {
    const response = await fetch(this.baseURL + `overview/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch royalty overview: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async getAllCycles(): Promise<RoyaltyCycle[]> {
    const response = await fetch(this.baseURL + `cycles/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cycles: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async createCycle(cycleData: {
    name: string;
    territory: string;
    period_start: string;
    period_end: string;
    admin_fee_percent_default?: number;
  }): Promise<RoyaltyCycle> {
    const response = await fetch(this.baseURL +`cycles/create/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(cycleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create cycle');
    }

    return response.json();
  }

  async closeCycle(cycleId: number): Promise<{
    line_items_created: number;
    status: string;
  }> {
    const response = await fetch(this.baseURL +`cycles/${cycleId}/close/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to close cycle');
    }

    return response.json();
  }

  async getCycleLineItems(cycleId: number): Promise<RoyaltyLineItem[]> {
    const response = await fetch(this.baseURL +`cycles/${cycleId}/line-items/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cycle line items: ${response.statusText}`);
    }

    return response.json();
  }

  async getCycleRemittances(cycleId: number): Promise<PartnerRemittance[]> {
    const response = await fetch(this.baseURL + `cycles/${cycleId}/remittances/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cycle remittances: ${response.statusText}`);
    }

    return response.json();
  }

  // Royalty Calculation Management
  async calculatePlayLogRoyalties(data: {
    play_log_ids: number[];
    dry_run?: boolean;
  }): Promise<{
    results: Array<{
      play_log_id: number;
      total_gross_amount: string;
      currency: string;
      distributions_count: number;
      distributions: Array<{
        recipient_id: string;
        recipient_type: string;
        gross_amount: string;
        net_amount: string;
        percentage_split: string;
        pro_share: string;
      }>;
      errors: string[];
      calculation_metadata: Record<string, any>;
    }>;
    summary: {
      total_play_logs: number;
      successful_calculations: number;
      total_amount: string;
      currency: string;
      dry_run: boolean;
    };
  }> {
    const response = await fetch(this.baseURL +`calculate/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to calculate royalties');
    }

    return response.json();
  }

  async getCalculationAudit(filters: {
    type?: string;
    limit?: number;
  } = {}): Promise<{
    audits: RoyaltyCalculationAudit[];
    total_count: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${this.baseURL}audit/?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calculation audit: ${response.statusText}`);
    }

    return response.json();
  }

  // Rate Management
  async getRoyaltyRates(territory: string = 'GH'): Promise<{
    rates: RoyaltyRateStructure[];
    territory: string;
  }> {
    const response = await fetch(`${this.baseURL}rates/?territory=${territory}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch royalty rates: ${response.statusText}`);
    }

    return response.json();
  }

  async updateRoyaltyRate(rateId: number, data: {
    base_rate_per_second?: number;
    multiplier?: number;
    notes?: string;
  }): Promise<{
    id: number;
    updated_fields: string[];
    base_rate_per_second: string;
    multiplier: string;
    notes: string;
  }> {
    const response = await fetch(`${this.baseURL}rates/${rateId}/update/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update rate');
    }

    return response.json();
  }

  async getExchangeRates(): Promise<{
    exchange_rates: CurrencyExchangeRate[];
  }> {
    const response = await fetch(`${this.baseURL}exchange-rates/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }

    return response.json();
  }

  // Remittance Management
  async createRemittance(cycleId: number, partnerId: number): Promise<PartnerRemittance> {
    const response = await fetch(`${this.baseURL}cycles/${cycleId}/partners/${partnerId}/remit/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create remittance');
    }

    return response.json();
  }

  async getRemittance(remittanceId: number): Promise<PartnerRemittance> {
    const response = await fetch(`${this.baseURL}remittances/${remittanceId}/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch remittance: ${response.statusText}`);
    }

    return response.json();
  }

  // Dispute Management (placeholder - would need backend implementation)
  async getDisputeOverview(): Promise<DisputeOverview> {
    // This would need to be implemented in the backend
    // For now, return mock data structure
    return {
      dispute_stats: {
        total_disputes: 0,
        open_disputes: 0,
        under_review: 0,
        resolved_disputes: 0,
        escalated_disputes: 0,
      },
      dispute_types: {
        royalty_calculation: 0,
        payment_issues: 0,
        detection_accuracy: 0,
        ownership_claims: 0,
      },
      resolution_metrics: {
        average_resolution_time: 0,
        resolution_rate: 0,
        admin_interventions: 0,
      },
      recent_activity: {
        new_disputes: 0,
        resolved_this_week: 0,
        pending_admin_action: 0,
      },
    };
  }

  // Payment Processing Monitoring (placeholder)
  async getPaymentProcessingStatus(): Promise<PaymentProcessingStatus[]> {
    // This would need to be implemented in the backend
    return [];
  }

  // Utility methods
  getCycleStatusColor(status: string): string {
    const colors = {
      'Open': 'bg-blue-100 text-blue-800',
      'Locked': 'bg-yellow-100 text-yellow-800',
      'Invoiced': 'bg-purple-100 text-purple-800',
      'Remitted': 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  getRemittanceStatusColor(status: string): string {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Sent': 'bg-blue-100 text-blue-800',
      'Settled': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  getPaymentStatusColor(status: string): string {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  formatCurrency(amount: number, currency: string = 'GHS'): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const royaltyManagementService = new RoyaltyManagementService();