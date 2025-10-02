import React, { useState } from 'react';
import { CreditCardIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../contexts/ThemeContext';
import { OnboardingStepProps } from '../../../components/onboarding/OnboardingWizard';
import { getArtistId } from '../../../lib/auth';
import api from '../../../lib/api';
import ButtonLoader from '../../../common/button_loader';

interface PaymentInfoProps extends OnboardingStepProps {}

const PaymentInfo: React.FC<PaymentInfoProps> = ({ onNext, onSkip, onBack }) => {
  const { theme } = useTheme();
  const [momoNumber, setMomoNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    if (!momoNumber.trim()) {
      setInputError('Please enter the mobile money number that should receive royalty payouts.');
      return false;
    }

    if (!bankAccount.trim()) {
      setInputError('Please provide a settlement bank account number.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setInputError(null);
    if (!validateFields()) {
      return;
    }

    const payload = new FormData();
    payload.append('artist_id', getArtistId());
    payload.append('momo', momoNumber.trim());
    payload.append('bankAccount', bankAccount.trim());
    if (bankName.trim()) {
      payload.append('bank_name', bankName.trim());
    }

    try {
      setLoading(true);
      const response = await api.post('api/accounts/complete-artist-payment/', payload);

      if (response.status >= 200 && response.status < 300) {
        await onNext();
      }
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.errors) {
        const messages = Object.values(data.errors).flat() as string[];
        setInputError(messages.join('\n'));
      } else {
        setInputError(data?.message || 'Failed to save payment information. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (onSkip) {
      await onSkip();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.colors.primary + '20' }}
        >
          <CreditCardIcon className="w-8 h-8" style={{ color: theme.colors.primary }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
          Set Up Royalty Payouts
        </h2>
        <p style={{ color: theme.colors.textSecondary }}>
          Provide your preferred mobile money and bank details so we can disburse royalties without delays.
        </p>
      </div>

      {inputError && (
        <div
          className="mb-6 p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: theme.colors.error + '10',
            borderLeftColor: theme.colors.error,
          }}
        >
          <p className="text-sm" style={{ color: theme.colors.error }}>
            {inputError}
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
            Mobile Money Number *
          </label>
          <input
            type="text"
            value={momoNumber}
            onChange={(e) => setMomoNumber(e.target.value)}
            placeholder="e.g., 0241234567"
            className="w-full px-4 py-3 rounded-lg border transition-colors"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
            }}
            disabled={loading}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
              Bank Account Number *
            </label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="0001234567890"
              className="w-full px-4 py-3 rounded-lg border transition-colors"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              }}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
              Bank Name (Optional)
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g., GCB Bank"
              className="w-full px-4 py-3 rounded-lg border transition-colors"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              }}
              disabled={loading}
            />
          </div>
        </div>

        <div
          className="p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: theme.colors.info + '10',
            borderLeftColor: theme.colors.info,
          }}
        >
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 mt-0.5" style={{ color: theme.colors.info }} />
            <div>
              <h4 className="text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                Why we need this information
              </h4>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                ZamIO uses these details to settle royalties via mobile money or bank transfer. You can update this information at any time in your profile settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mt-8">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg font-medium border transition-colors"
            style={{
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
              backgroundColor: 'transparent',
            }}
            disabled={loading}
          >
            Back
          </button>
        )}

        {onSkip && (
          <button
            onClick={handleSkip}
            className="flex-1 py-3 px-6 rounded-lg font-medium border transition-colors"
            style={{
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
              backgroundColor: 'transparent',
            }}
            disabled={loading}
          >
            Skip for Now
          </button>
        )}

        {loading ? (
          <div className="flex-1">
            <ButtonLoader />
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: theme.colors.primary }}
            disabled={loading}
          >
            Save & Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentInfo;
