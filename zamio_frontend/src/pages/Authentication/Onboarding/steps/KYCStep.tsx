import React, { useCallback, useEffect, useState } from 'react';
import { Upload, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { OnboardingStepProps } from '../../../../components/onboarding/OnboardingWizard';
import { useArtistOnboarding } from '../ArtistOnboardingContext';

const idTypes = ['Ghana Card', 'Passport', "Driver's License", 'Voter ID'];
const nationalities = ['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Canada', 'Other'];

const KYCStep: React.FC<OnboardingStepProps> = ({ registerNextHandler, registerSkipHandler, canSkip }) => {
  const { finalizeOnboarding } = useArtistOnboarding();
  const [formData, setFormData] = useState({
    fullName: '',
    idType: '',
    idNumber: '',
    dateOfBirth: '',
    nationality: 'Ghana',
    address: '',
  });
  const [documents, setDocuments] = useState({
    idDocument: null as File | null,
    proofOfAddress: null as File | null,
    selfie: null as File | null,
  });
  const [uploadStatus, setUploadStatus] = useState({
    idDocument: 'pending',
    proofOfAddress: 'pending',
    selfie: 'pending',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (documentType: keyof typeof documents) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocuments((prev) => ({
        ...prev,
        [documentType]: file,
      }));
      setUploadStatus((prev) => ({
        ...prev,
        [documentType]: 'uploaded',
      }));

      setTimeout(() => {
        setUploadStatus((prev) => ({
          ...prev,
          [documentType]: 'verified',
        }));
      }, 1500);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'uploaded':
        return <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Upload className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'uploaded':
        return 'Processing...';
      default:
        return 'Upload Required';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-400';
      case 'uploaded':
        return 'text-indigo-400';
      default:
        return 'text-slate-400';
    }
  };

  const handleSubmit = useCallback(async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await finalizeOnboarding();
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not complete your onboarding right now. Please try again.';
      setErrorMessage(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [finalizeOnboarding]);

  useEffect(() => {
    registerNextHandler?.(() => handleSubmit());
    registerSkipHandler?.(() => handleSubmit());
    return () => {
      registerNextHandler?.(null);
      registerSkipHandler?.(null);
    };
  }, [handleSubmit, registerNextHandler, registerSkipHandler]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Identity Verification</h2>
        <p className="text-slate-300">
          Upload KYC documents for account verification. This helps us ensure compliance and security.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 p-4 rounded-lg bg-blue-500/10 border border-blue-400/20">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-300 mb-1">Why do we need this?</h3>
            <p className="text-sm text-blue-200">
              Identity verification helps us comply with regulatory requirements and ensures secure royalty payments. This step is
              recommended but optional for demo purposes.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-200 mb-2">
                Full Legal Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="Enter your full legal name"
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-200 mb-2">
                Date of Birth *
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-slate-200 mb-2">
                Nationality
              </label>
              <select
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {nationalities.map((nationality) => (
                  <option key={nationality} value={nationality}>
                    {nationality}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="idType" className="block text-sm font-medium text-slate-200 mb-2">
                ID Type *
              </label>
              <select
                id="idType"
                name="idType"
                value={formData.idType}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="">Select ID type</option>
                {idTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-slate-200 mb-2">
                ID Number *
              </label>
              <input
                id="idNumber"
                name="idNumber"
                type="text"
                value={formData.idNumber}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="Enter your ID number"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-200 mb-2">
                Residential Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="House number, street, city"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Document Uploads</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {(
              [
                { key: 'idDocument' as const, label: 'Government ID *', description: 'Upload your Ghana Card, passport, or driver’s license.' },
                { key: 'proofOfAddress' as const, label: 'Proof of Address *', description: 'Utility bill or bank statement issued within the last 3 months.' },
                { key: 'selfie' as const, label: 'Selfie Verification *', description: 'Take a selfie holding your ID to help us confirm identity.' },
              ] as const
            ).map(({ key, label, description }) => (
              <div key={key} className="rounded-lg border border-white/10 bg-slate-900/40 p-4">
                <p className="text-sm font-medium text-slate-200 mb-2">{label}</p>
                <p className="text-xs text-slate-400 mb-4">{description}</p>
                <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-slate-900/50 text-center text-sm text-slate-300 transition-colors hover:border-indigo-400/50 hover:text-white">
                  <Upload className="mb-2 h-5 w-5" />
                  <span>Click to upload</span>
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload(key)} />
                </label>
                <div className={`mt-2 text-xs ${getStatusColor(uploadStatus[key])}`}>{getStatusText(uploadStatus[key])}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-800/50 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-300 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Verification Timeline</p>
              <p className="text-xs text-slate-400">
                KYC review typically takes 1-2 business days. You can continue using the platform while verification is pending.
              </p>
            </div>
          </div>
        </div>
      </div>

      {canSkip && <p className="mt-4 text-xs text-slate-400">You can skip this step for now and return later to complete verification.</p>}

      {isSubmitting && <div className="mt-6 text-sm text-indigo-200">Finalising your onboarding…</div>}
    </div>
  );
};

export default KYCStep;
