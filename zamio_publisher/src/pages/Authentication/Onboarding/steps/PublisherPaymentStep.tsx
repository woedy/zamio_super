import React, { useState } from 'react';
import { Building2, Smartphone, CreditCard, DollarSign, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface PublisherPaymentStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const PublisherPaymentStep: React.FC<PublisherPaymentStepProps> = ({ onNext, onPrevious }) => {
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'bank' | ''>('');
  const [formData, setFormData] = useState({
    // Mobile Money fields
    momoProvider: '',
    momoNumber: '',
    momoName: '',

    // Bank fields
    bankName: '',
    accountNumber: '',
    accountName: '',
    branchCode: '',
    swiftCode: '',

    // Common fields
    currency: 'GHS',
    payoutFrequency: 'monthly',
    minimumPayout: '100',
    taxId: '',
    businessRegistration: '',
    withholdingTax: '15',
    vatRegistration: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const mobileMoneyProviders = [
    { id: 'mtn', name: 'MTN Mobile Money', logo: '📱' },
    { id: 'vodafone', name: 'Vodafone Cash', logo: '💳' },
    { id: 'airteltigo', name: 'AirtelTigo Money', logo: '💰' }
  ];

  const banks = [
    'Access Bank Ghana',
    'Absa Bank Ghana',
    'Agricultural Development Bank',
    'Bank of Africa',
    'CalBank',
    'Consolidated Bank Ghana',
    'Ecobank Ghana',
    'FBNBank Ghana',
    'Fidelity Bank Ghana',
    'First Atlantic Bank',
    'First National Bank Ghana',
    'GCB Bank',
    'Guaranty Trust Bank',
    'National Investment Bank',
    'OmniBSIC Bank',
    'Prudential Bank',
    'Republic Bank Ghana',
    'Societe Generale Ghana',
    'Stanbic Bank Ghana',
    'Standard Chartered Bank Ghana',
    'United Bank for Africa Ghana',
    'Zenith Bank Ghana'
  ];

  const currencies = [
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' }
  ];

  const payoutFrequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'momo') {
      if (!formData.momoProvider) {
        newErrors.momoProvider = 'Mobile money provider is required';
      }
      if (!formData.momoNumber.trim()) {
        newErrors.momoNumber = 'Mobile money number is required';
      } else if (!/^(\+233|0)[2-9]\d{8}$/.test(formData.momoNumber.replace(/\s/g, ''))) {
        newErrors.momoNumber = 'Please enter a valid Ghanaian mobile number';
      }
      if (!formData.momoName.trim()) {
        newErrors.momoName = 'Account holder name is required';
      }
    } else if (paymentMethod === 'bank') {
      if (!formData.bankName) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!formData.accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required';
      }
      if (!formData.accountName.trim()) {
        newErrors.accountName = 'Account holder name is required';
      }
    }

    if (!formData.currency) {
      newErrors.currency = 'Currency selection is required';
    }

    if (!formData.payoutFrequency) {
      newErrors.payoutFrequency = 'Payout frequency is required';
    }

    if (!formData.taxId.trim()) {
      newErrors.taxId = 'Tax ID is required for regulatory compliance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Demo: Log the form data
      console.log('Publisher payment configuration:', { paymentMethod, ...formData });
      onNext();
    }
  };

  const getProviderIcon = (providerId: string) => {
    const provider = mobileMoneyProviders.find(p => p.id === providerId);
    return provider?.logo || '📱';
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-semibold text-white mb-4">
          Payment Setup
        </h3>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Configure how your publishing company will receive royalty payments from music usage. Set up secure payment methods for licensing fees and copyright compliance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Payment Method Selection */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Payment Method for Royalties</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setPaymentMethod('momo')}
              className={`p-6 rounded-lg border-2 text-left transition-colors ${
                paymentMethod === 'momo'
                  ? 'border-indigo-400 bg-indigo-500/20'
                  : 'border-white/10 bg-slate-800/50 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <Smartphone className="w-6 h-6 text-indigo-400" />
                <h5 className="font-medium text-white">Mobile Money</h5>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Fast, convenient royalty collection through MTN, Vodafone, or AirtelTigo Money
              </p>
              <div className="flex flex-wrap gap-2">
                {mobileMoneyProviders.map((provider) => (
                  <span key={provider.id} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded">
                    {provider.logo} {provider.name}
                  </span>
                ))}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`p-6 rounded-lg border-2 text-left transition-colors ${
                paymentMethod === 'bank'
                  ? 'border-indigo-400 bg-indigo-500/20'
                  : 'border-white/10 bg-slate-800/50 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <Building2 className="w-6 h-6 text-indigo-400" />
                <h5 className="font-medium text-white">Bank Transfer</h5>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Traditional bank transfer for corporate royalty collection and business banking
              </p>
              <p className="text-xs text-slate-400">
                Supports all major Ghanaian banks for corporate accounts
              </p>
            </button>
          </div>
        </div>

        {/* Mobile Money Configuration */}
        {paymentMethod === 'momo' && (
          <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
            <h4 className="text-xl font-semibold text-white mb-6">Mobile Money Configuration</h4>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">Select Provider</label>
                <div className="grid md:grid-cols-3 gap-4">
                  {mobileMoneyProviders.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, momoProvider: provider.id }))}
                      className={`p-4 rounded-lg border-2 text-center transition-colors ${
                        formData.momoProvider === provider.id
                          ? 'border-indigo-400 bg-indigo-500/20'
                          : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-2">{provider.logo}</div>
                      <p className="text-sm font-medium text-white">{provider.name}</p>
                    </button>
                  ))}
                </div>
                {errors.momoProvider && <p className="text-red-400 text-sm mt-2">{errors.momoProvider}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="momoNumber" className="block text-sm font-medium text-slate-200 mb-2">
                    Mobile Money Number *
                  </label>
                  <input
                    type="tel"
                    id="momoNumber"
                    name="momoNumber"
                    value={formData.momoNumber}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                      errors.momoNumber
                        ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                        : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                    }`}
                    placeholder="+233 XX XXX XXXX"
                  />
                  {errors.momoNumber && <p className="text-red-400 text-sm mt-1">{errors.momoNumber}</p>}
                </div>

                <div>
                  <label htmlFor="momoName" className="block text-sm font-medium text-slate-200 mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    id="momoName"
                    name="momoName"
                    value={formData.momoName}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                      errors.momoName
                        ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                        : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                    }`}
                    placeholder="Company representative name"
                  />
                  {errors.momoName && <p className="text-red-400 text-sm mt-1">{errors.momoName}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Account Configuration */}
        {paymentMethod === 'bank' && (
          <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
            <h4 className="text-xl font-semibold text-white mb-6">Corporate Bank Account</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="bankName" className="block text-sm font-medium text-slate-200 mb-2">
                  Bank Name *
                </label>
                <select
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-4 py-3 text-white focus:outline-none focus:ring-1 ${
                    errors.bankName
                      ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                  }`}
                >
                  <option value="">Select your corporate bank</option>
                  {banks.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
                {errors.bankName && <p className="text-red-400 text-sm mt-1">{errors.bankName}</p>}
              </div>

              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-slate-200 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    errors.accountNumber
                      ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                  }`}
                  placeholder="Corporate account number"
                />
                {errors.accountNumber && <p className="text-red-400 text-sm mt-1">{errors.accountNumber}</p>}
              </div>

              <div>
                <label htmlFor="accountName" className="block text-sm font-medium text-slate-200 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    errors.accountName
                      ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                  }`}
                  placeholder="Company legal name"
                />
                {errors.accountName && <p className="text-red-400 text-sm mt-1">{errors.accountName}</p>}
              </div>

              <div>
                <label htmlFor="branchCode" className="block text-sm font-medium text-slate-200 mb-2">
                  Branch Code (Optional)
                </label>
                <input
                  type="text"
                  id="branchCode"
                  name="branchCode"
                  value={formData.branchCode}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  placeholder="Bank branch code"
                />
              </div>

              <div>
                <label htmlFor="swiftCode" className="block text-sm font-medium text-slate-200 mb-2">
                  SWIFT/BIC Code (Optional)
                </label>
                <input
                  type="text"
                  id="swiftCode"
                  name="swiftCode"
                  value={formData.swiftCode}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  placeholder="International banking code"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Preferences */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Royalty Collection Preferences</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-200 mb-2">
                Primary Currency *
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white focus:outline-none focus:ring-1 ${
                  errors.currency
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
              {errors.currency && <p className="text-red-400 text-sm mt-1">{errors.currency}</p>}
            </div>

            <div>
              <label htmlFor="payoutFrequency" className="block text-sm font-medium text-slate-200 mb-2">
                Payout Frequency *
              </label>
              <select
                id="payoutFrequency"
                name="payoutFrequency"
                value={formData.payoutFrequency}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white focus:outline-none focus:ring-1 ${
                  errors.payoutFrequency
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
              >
                {payoutFrequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
              {errors.payoutFrequency && <p className="text-red-400 text-sm mt-1">{errors.payoutFrequency}</p>}
            </div>

            <div>
              <label htmlFor="minimumPayout" className="block text-sm font-medium text-slate-200 mb-2">
                Minimum Payout Threshold
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="minimumPayout"
                  name="minimumPayout"
                  value={formData.minimumPayout}
                  onChange={handleInputChange}
                  min="10"
                  className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  placeholder="100"
                />
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-slate-200 mb-2">
                Tax ID / TIN *
              </label>
              <input
                type="text"
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.taxId
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
                placeholder="P123456789012"
              />
              {errors.taxId && <p className="text-red-400 text-sm mt-1">{errors.taxId}</p>}
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="businessRegistration" className="block text-sm font-medium text-slate-200 mb-2">
                Business Registration Number
              </label>
              <input
                type="text"
                id="businessRegistration"
                name="businessRegistration"
                value={formData.businessRegistration}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="BN123456789"
              />
            </div>

            <div>
              <label htmlFor="vatRegistration" className="block text-sm font-medium text-slate-200 mb-2">
                VAT Registration (Optional)
              </label>
              <input
                type="text"
                id="vatRegistration"
                name="vatRegistration"
                value={formData.vatRegistration}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="VAT registration number"
              />
            </div>
          </div>
        </div>

        {/* Tax & Compliance */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Tax & Compliance Information</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="withholdingTax" className="block text-sm font-medium text-slate-200 mb-2">
                Withholding Tax Rate (%)
              </label>
              <select
                id="withholdingTax"
                name="withholdingTax"
                value={formData.withholdingTax}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="0">0% (No withholding)</option>
                <option value="5">5% (Reduced rate)</option>
                <option value="15">15% (Standard rate)</option>
                <option value="20">20% (Higher rate)</option>
              </select>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
              <h5 className="font-medium text-white mb-2">Ghana Tax Information</h5>
              <p className="text-sm text-slate-400">
                Standard withholding tax for royalty payments in Ghana is 15%. This may be reduced based on double taxation agreements.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        {paymentMethod && (
          <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
            <h4 className="text-xl font-semibold text-white mb-6">Payment Summary</h4>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                {paymentMethod === 'momo' ? (
                  <Smartphone className="w-6 h-6 text-indigo-400" />
                ) : (
                  <Building2 className="w-6 h-6 text-indigo-400" />
                )}
                <div>
                  <h5 className="font-medium text-white">
                    {paymentMethod === 'momo' ? 'Mobile Money' : 'Corporate Bank Account'}
                  </h5>
                  <p className="text-sm text-slate-400">
                    {paymentMethod === 'momo'
                      ? `${getProviderIcon(formData.momoProvider)} ${mobileMoneyProviders.find(p => p.id === formData.momoProvider)?.name} - ${formData.momoNumber}`
                      : `${formData.bankName} - ${formData.accountNumber}`
                    }
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Currency</p>
                  <p className="font-medium text-white">
                    {currencies.find(c => c.code === formData.currency)?.symbol} {formData.currency}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Payout Frequency</p>
                  <p className="font-medium text-white">
                    {payoutFrequencies.find(f => f.value === formData.payoutFrequency)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Minimum Payout</p>
                  <p className="font-medium text-white">
                    {currencies.find(c => c.code === formData.currency)?.symbol}{formData.minimumPayout}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ghana-Specific Information */}
        <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h5 className="font-medium text-indigo-300">Ghana Publishing Requirements</h5>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-300 mb-2"><strong>Mobile Money Benefits:</strong></p>
              <ul className="text-slate-400 space-y-1">
                <li>• Instant royalty collection from local sources</li>
                <li>• No corporate bank account required</li>
                <li>• Lower transaction fees for smaller amounts</li>
                <li>• 24/7 availability for urgent payments</li>
              </ul>
            </div>
            <div>
              <p className="text-slate-300 mb-2"><strong>Corporate Banking Benefits:</strong></p>
              <ul className="text-slate-400 space-y-1">
                <li>• Professional business account management</li>
                <li>• Higher transaction limits for large royalties</li>
                <li>• International payment capabilities</li>
                <li>• Integration with accounting systems</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            All royalty payments are subject to GHAMRO regulations, withholding tax requirements, and proper business registration verification.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={onPrevious}
            className="bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Previous
          </button>
          <button
            type="submit"
            disabled={!paymentMethod}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            Complete Setup
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublisherPaymentStep;
