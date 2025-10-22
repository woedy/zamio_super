import React, { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Upload, FileText, Shield, AlertCircle, CheckCircle, SkipForward } from 'lucide-react';

import { OnboardingStepProps } from '../../../../components/onboarding/OnboardingWizard';
import { uploadKycDocument, type ArtistKycDocumentSummary } from '../../../../lib/api';
import { useArtistOnboarding } from '../ArtistOnboardingContext';

type DocumentKey = 'idDocument' | 'proofOfAddress' | 'selfie';
type DocumentStatus = 'pending' | 'processing' | 'uploaded' | 'verified' | 'rejected' | 'error';

const DOCUMENT_CONFIG: Record<DocumentKey, { label: string; description: string; helper: string; accept: string; apiValue: string }>
  = {
    idDocument: {
      label: 'Government ID',
      description: 'Upload a clear photo or scan of your government issued ID',
      helper: "Ghana Card, passport, or driver\'s license.",
      accept: '.jpg,.jpeg,.png,.pdf',
      apiValue: 'id_card',
    },
    proofOfAddress: {
      label: 'Proof of Address',
      description: 'Provide documentation showing your current residential address',
      helper: 'Recent utility bill or bank statement (issued within 3 months).',
      accept: '.jpg,.jpeg,.png,.pdf',
      apiValue: 'utility_bill',
    },
    selfie: {
      label: 'Selfie with ID',
      description: 'Take a selfie holding the same ID you uploaded',
      helper: 'Make sure your face and the ID are clearly visible.',
      accept: '.jpg,.jpeg,.png',
      apiValue: 'selfie',
    },
  };

const TYPE_LOOKUP: Record<string, DocumentKey> = {
  id_card: 'idDocument',
  passport: 'idDocument',
  drivers_license: 'idDocument',
  utility_bill: 'proofOfAddress',
  bank_statement: 'proofOfAddress',
  business_registration: 'proofOfAddress',
  tax_certificate: 'proofOfAddress',
  selfie: 'selfie',
};

const idTypes = [
  'Ghana Card',
  'Passport',
  "Driver\'s License",
  'Voter ID',
];

const nationalities = [
  'Ghana',
  'Nigeria',
  'Kenya',
  'South Africa',
  'United Kingdom',
  'United States',
  'Canada',
  'Other',
];

const deriveStatusFromDocument = (document?: ArtistKycDocumentSummary | null): DocumentStatus => {
  if (!document) {
    return 'pending';
  }
  switch (document.status) {
    case 'verified':
    case 'approved':
      return 'verified';
    case 'pending':
    case 'pending_review':
      return 'processing';
    case 'rejected':
      return 'rejected';
    default:
      return 'uploaded';
  }
};

const statusIcon = (status: DocumentStatus) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'processing':
    case 'uploaded':
      return <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />;
    case 'rejected':
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    default:
      return <Upload className="w-5 h-5 text-slate-400" />;
  }
};

const statusLabel = (status: DocumentStatus) => {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'processing':
      return 'Processing…';
    case 'uploaded':
      return 'Uploaded';
    case 'rejected':
      return 'Needs attention';
    case 'error':
      return 'Upload failed';
    default:
      return 'Upload required';
  }
};

const statusColor = (status: DocumentStatus) => {
  switch (status) {
    case 'verified':
      return 'text-green-400';
    case 'processing':
    case 'uploaded':
      return 'text-indigo-400';
    case 'rejected':
    case 'error':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
};

const KYCStep: React.FC<OnboardingStepProps> = ({ onNext, onPrevious, onSkip, canSkip }) => {
  const { status, refresh } = useArtistOnboarding();
  const [formData, setFormData] = useState({
    fullName: '',
    idType: '',
    idNumber: '',
    dateOfBirth: '',
    nationality: 'Ghana',
    address: '',
  });
  const [uploadStatus, setUploadStatus] = useState<Record<DocumentKey, DocumentStatus>>({
    idDocument: 'pending',
    proofOfAddress: 'pending',
    selfie: 'pending',
  });
  const [uploadErrors, setUploadErrors] = useState<Record<DocumentKey, string | null>>({
    idDocument: null,
    proofOfAddress: null,
    selfie: null,
  });

  const documentSummaries = useMemo(() => {
    const latest: Record<DocumentKey, ArtistKycDocumentSummary | null> = {
      idDocument: null,
      proofOfAddress: null,
      selfie: null,
    };
    const summaries = status?.kyc?.documents ?? [];
    summaries.forEach(summary => {
      const documentType = summary.document_type;
      if (!documentType) return;
      const key = TYPE_LOOKUP[documentType];
      if (!key) return;
      const current = latest[key];
      if (!current) {
        latest[key] = summary;
        return;
      }
      const currentDate = current.uploaded_at ? Date.parse(current.uploaded_at) : 0;
      const incomingDate = summary.uploaded_at ? Date.parse(summary.uploaded_at) : 0;
      if (incomingDate >= currentDate) {
        latest[key] = summary;
      }
    });
    return latest;
  }, [status?.kyc?.documents]);

  useEffect(() => {
    setUploadStatus(prev => ({
      ...prev,
      idDocument: deriveStatusFromDocument(documentSummaries.idDocument),
      proofOfAddress: deriveStatusFromDocument(documentSummaries.proofOfAddress),
      selfie: deriveStatusFromDocument(documentSummaries.selfie),
    }));
  }, [documentSummaries]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (documentType: DocumentKey) => async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    setUploadErrors(prev => ({ ...prev, [documentType]: null }));
    setUploadStatus(prev => ({ ...prev, [documentType]: 'processing' }));

    const form = new FormData();
    form.append('document_type', DOCUMENT_CONFIG[documentType].apiValue);
    form.append('document', file);

    try {
      await uploadKycDocument(form);
      await refresh();
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'We could not upload that file. Please try again.';
      setUploadErrors(prev => ({ ...prev, [documentType]: message }));
      setUploadStatus(prev => ({
        ...prev,
        [documentType]: documentSummaries[documentType]
          ? deriveStatusFromDocument(documentSummaries[documentType])
          : 'error',
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Identity Verification</h2>
        <p className="text-slate-300">
          Upload KYC documents for account verification. This helps us ensure compliance and security.
        </p>
      </div>

      <div className="mb-8 p-4 rounded-lg bg-blue-500/10 border border-blue-400/20">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-300 mb-1">Why do we need this?</h3>
            <p className="text-sm text-blue-200">
              Providing accurate identity documents helps us protect your account and ensure royalties are paid to the right person.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Full Legal Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">ID Type</label>
            <select
              name="idType"
              value={formData.idType}
              onChange={handleInputChange}
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select ID Type</option>
              {idTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">ID Number</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleInputChange}
              placeholder="Enter ID number"
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Nationality</label>
            <select
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2 text-white"
            >
              {nationalities.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Residential Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Street, City, Region"
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {(Object.keys(DOCUMENT_CONFIG) as DocumentKey[]).map(documentType => {
          const { label, description, helper, accept } = DOCUMENT_CONFIG[documentType];
          const summary = documentSummaries[documentType];
          const statusState = uploadStatus[documentType];
          const errorMessage = uploadErrors[documentType];

          return (
            <div key={documentType} className="border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="font-medium text-white">{label}</h4>
                    <p className="text-sm text-slate-400">{description}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 ${statusColor(statusState)}`}>
                  {statusIcon(statusState)}
                  <span className="text-sm">{statusLabel(statusState)}</span>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400 mb-2">Drag and drop or click to upload</p>
                <p className="text-xs text-slate-500">{accept.toUpperCase()} (max 5MB)</p>
                <input
                  type="file"
                  accept={accept}
                  onChange={handleFileUpload(documentType)}
                  className="hidden"
                  id={documentType}
                />
                <label
                  htmlFor={documentType}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-white/20 rounded-lg text-sm text-slate-300 hover:border-indigo-400 hover:text-white cursor-pointer transition-colors"
                >
                  Choose File
                </label>
              </div>

              <div className="mt-3 text-left text-sm text-slate-400">
                <p>{helper}</p>
                {summary?.original_filename && (
                  <p className="mt-2 text-slate-300">
                    Latest upload: <span className="font-medium text-white">{summary.original_filename}</span>
                  </p>
                )}
                {summary?.status_display && (
                  <p className="text-xs text-slate-500">{summary.status_display}</p>
                )}
                {errorMessage && (
                  <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
        <button
          onClick={onPrevious}
          className="bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Previous
        </button>

        <div className="flex space-x-3">
          {canSkip && (
            <button
              onClick={onSkip}
              className="inline-flex items-center space-x-2 border border-white/20 hover:border-indigo-400 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              <SkipForward className="h-4 w-4" />
              <span>Skip</span>
            </button>
          )}

          <button
            onClick={onNext}
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Continue to Social Media
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCStep;
