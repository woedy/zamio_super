import React, { useState } from 'react';
import { CreditCard, Building2, Smartphone, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { OnboardingStepProps } from '../../../components/onboarding/OnboardingWizard';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  popular?: boolean;
}

const PaymentStep: React.FC<OnboardingStepProps> = ({ onNext, onPrevious, onSkip }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [formData, setFormData] = useState({
    // Bank account fields
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    routingNumber: '',

    // Mobile money fields
    mobileProvider: '',
    mobileNumber: '',
    mobileAccountName: '',

    // Common fields
    currency: 'GHS',
    preferredMethod: ''
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mobile-money',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'MTN, Vodafone, AirtelTigo',
      popular: true
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      icon: Building2,
      description: 'Direct bank account deposit'
    },
    {
      id: 'international',
      name: 'International Transfer',
      icon: CreditCard,
      description: 'PayPal, Wise, or bank wire'
    }
  ];

  const currencies = [
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' }
  ];

  const mobileProviders = [
    'MTN',
    'Vodafone',
    'AirtelTigo'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setFormData(prev => ({
      ...prev,
      preferredMethod: methodId
    }));
  };

  const renderMethodForm = () => {
    switch (selectedMethod) {
      case 'mobile-money':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Mobile Money Provider *
              </label>
              <select
                name="mobileProvider"
                value={formData.mobileProvider}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="">Select provider</option>
                {mobileProviders.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Mobile Money Number *
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="+233 XX XXX XXXX"
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Account Holder Name *
              </label>
              <input
                type="text"
                name="mobileAccountName"
                value={formData.mobileAccountName}
                onChange={handleInputChange}
                placeholder="Name registered with mobile money"
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>
        );

      case 'bank-transfer':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                placeholder="e.g., Access Bank, Ecobank, etc."
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                  className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Routing Number
                </label>
                <input
                  type="text"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleInputChange}
                  placeholder="Bank routing code"
                  className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Account Holder Name *
              </label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleInputChange}
                placeholder="Name on bank account"
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>
        );

      case 'international':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-300 mb-1">International Transfer Setup</h4>
                  <p className="text-sm text-blue-200">
                    For international payments, we'll need additional documentation including tax forms and banking details.
                    Our team will contact you to complete this setup.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Preferred Currency for Royalties
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Payment Information</h2>
        <p className="text-slate-300">
          Set up your preferred payment method for receiving royalty payments from your music.
        </p>
      </div>

      {/* Currency Selection */}
      <div className="mb-8 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white mb-1">Royalty Currency</h3>
            <p className="text-sm text-slate-400">Choose your preferred currency for payments</p>
          </div>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            className="rounded-lg border border-white/20 bg-slate-800/50 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Choose Payment Method</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            const isSelected = selectedMethod === method.id;

            return (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-500/20'
                    : 'border-white/10 bg-slate-800/50 hover:border-indigo-400/50 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <IconComponent className={`w-6 h-6 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <div>
                    <h4 className="font-medium text-white">{method.name}</h4>
                    {method.popular && (
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-400">{method.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Method-specific Form */}
      {selectedMethod && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4">
            {paymentMethods.find(m => m.id === selectedMethod)?.name} Details
          </h3>
          <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
            {renderMethodForm()}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mb-8 p-4 rounded-lg bg-green-500/10 border border-green-400/20">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-300 mb-1">Secure & Compliant</h4>
            <p className="text-sm text-green-200">
              All payment information is encrypted and stored securely. We comply with Ghana's Data Protection Act and international banking standards.
            </p>
          </div>
        </div>
      </div>

      {/* Processing Time Info */}
      <div className="mb-8 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
        <h3 className="font-medium text-white mb-2">Payment Processing</h3>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Mobile Money: Instant activation, payments within 24 hours</li>
          <li>• Bank Transfer: 2-3 business days for verification</li>
          <li>• International: 5-7 business days for compliance review</li>
          <li>• Minimum payout: ₵50 (GHS)</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
        <button
          onClick={onPrevious}
          className="bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Previous
        </button>

        <div className="flex space-x-3">
          <button
            onClick={onSkip}
            className="inline-flex items-center space-x-2 border border-white/20 hover:border-indigo-400 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span>Skip</span>
          </button>

          <button
            onClick={onNext}
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Continue to Publisher
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
