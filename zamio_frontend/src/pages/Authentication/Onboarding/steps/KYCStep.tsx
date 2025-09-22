import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  DocumentIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../../contexts/ThemeContext';
import { OnboardingStepProps } from '../../../../components/onboarding/OnboardingWizard';
import KYCUpload from '../../../../components/onboarding/KYCUpload';
import api from '../../../../lib/api';
import { getArtistId } from '../../../../lib/auth';

interface KYCDocument {
  id: string;
  type: 'id_card' | 'passport' | 'drivers_license' | 'utility_bill' | 'bank_statement';
  name: string;
  file?: File;
  url?: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  rejectionReason?: string;
  isRequired: boolean;
}

const KYCStep: React.FC<OnboardingStepProps> = ({ onNext, onSkip, onBack }) => {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState<KYCDocument[]>([
    {
      id: 'id_card',
      type: 'id_card',
      name: 'National ID Card',
      status: 'pending',
      isRequired: true
    },
    {
      id: 'utility_bill',
      type: 'utility_bill',
      name: 'Utility Bill (Proof of Address)',
      status: 'pending',
      isRequired: true
    },
    {
      id: 'passport',
      type: 'passport',
      name: 'Passport',
      status: 'pending',
      isRequired: false
    },
    {
      id: 'bank_statement',
      type: 'bank_statement',
      name: 'Bank Statement',
      status: 'pending',
      isRequired: false
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>('pending');

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      const response = await api.get(`api/accounts/artist-onboarding-status/${getArtistId()}/`);
      const data = response.data.data;
      
      setKycStatus(data.kyc_status);
      
      // Update document statuses based on existing KYC documents
      if (data.kyc_documents) {
        setDocuments(prev => prev.map(doc => {
          const existingDoc = data.kyc_documents[doc.type];
          if (existingDoc) {
            return {
              ...doc,
              status: existingDoc.status || 'uploaded'
            };
          }
          return doc;
        }));
      }
    } catch (error) {
      console.error('Failed to load KYC status:', error);
    }
  };

  const handleDocumentUpload = async (documentId: string, file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('document_type', documentId);
      formData.append('document_file', file);

      const response = await api.post('api/accounts/upload-kyc-documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update document status
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, file, status: 'uploaded' }
          : doc
      ));

      setKycStatus(response.data.data.kyc_status);
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      // Handle error - you might want to show a toast notification
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentRemove = (documentId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, file: undefined, status: 'pending' }
        : doc
    ));
  };

  const handleContinue = async () => {
    // Check if required documents are uploaded
    const requiredDocs = documents.filter(doc => doc.isRequired);
    const uploadedRequiredDocs = requiredDocs.filter(doc => doc.status === 'uploaded' || doc.status === 'verified');
    
    if (uploadedRequiredDocs.length === requiredDocs.length) {
      // All required documents uploaded
      try {
        await api.post('api/accounts/update-onboarding-status/', {
          artist_id: getArtistId(),
          step: 'kyc',
          completed: true,
        });
      } catch (error) {
        console.error('Failed to update KYC status:', error);
      }
    }
    
    onNext();
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const getKYCStatusMessage = () => {
    switch (kycStatus) {
      case 'pending':
        return {
          message: 'KYC verification not started',
          color: theme.colors.textSecondary,
          icon: DocumentIcon
        };
      case 'incomplete':
        return {
          message: 'KYC documents uploaded, under review',
          color: theme.colors.warning,
          icon: InformationCircleIcon
        };
      case 'verified':
        return {
          message: 'KYC verification completed',
          color: theme.colors.success,
          icon: ShieldCheckIcon
        };
      case 'rejected':
        return {
          message: 'KYC verification rejected, please resubmit',
          color: theme.colors.error,
          icon: InformationCircleIcon
        };
      default:
        return {
          message: 'KYC status unknown',
          color: theme.colors.textSecondary,
          icon: DocumentIcon
        };
    }
  };

  const statusInfo = getKYCStatusMessage();
  const StatusIcon = statusInfo.icon;

  const requiredDocsUploaded = documents
    .filter(doc => doc.isRequired)
    .every(doc => doc.status === 'uploaded' || doc.status === 'verified');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
             style={{ backgroundColor: theme.colors.primary + '20' }}>
          <ShieldCheckIcon className="w-8 h-8" style={{ color: theme.colors.primary }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
          Identity Verification (KYC)
        </h2>
        <p style={{ color: theme.colors.textSecondary }}>
          Verify your identity to ensure secure royalty payments and comply with financial regulations
        </p>
      </div>

      {/* KYC Status */}
      <div className="mb-6 p-4 rounded-lg border-l-4"
           style={{ 
             backgroundColor: statusInfo.color + '10',
             borderLeftColor: statusInfo.color
           }}>
        <div className="flex items-center space-x-3">
          <StatusIcon className="w-5 h-5" style={{ color: statusInfo.color }} />
          <span className="font-medium" style={{ color: theme.colors.text }}>
            {statusInfo.message}
          </span>
        </div>
      </div>

      {/* Benefits of KYC */}
      <div className="mb-8 p-6 rounded-lg"
           style={{ backgroundColor: theme.colors.surface }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
          Why Verify Your Identity?
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: theme.colors.primary }}></div>
            <div>
              <p className="font-medium" style={{ color: theme.colors.text }}>Secure Payments</p>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                Protect your royalty payments with verified identity
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: theme.colors.primary }}></div>
            <div>
              <p className="font-medium" style={{ color: theme.colors.text }}>Regulatory Compliance</p>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                Meet international financial regulations
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: theme.colors.primary }}></div>
            <div>
              <p className="font-medium" style={{ color: theme.colors.text }}>Higher Trust</p>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                Verified artists get priority in partnerships
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: theme.colors.primary }}></div>
            <div>
              <p className="font-medium" style={{ color: theme.colors.text }}>Faster Processing</p>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                Verified accounts get faster royalty processing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Upload Component */}
      <KYCUpload
        documents={documents}
        onDocumentUpload={handleDocumentUpload}
        onDocumentRemove={handleDocumentRemove}
        isLoading={loading}
        className="mb-8"
      />

      {/* Progress Indicator */}
      {documents.some(doc => doc.status === 'uploaded' || doc.status === 'verified') && (
        <div className="mb-6 p-4 rounded-lg"
             style={{ backgroundColor: theme.colors.info + '10' }}>
          <div className="flex items-center space-x-3">
            <InformationCircleIcon className="w-5 h-5" style={{ color: theme.colors.info }} />
            <div>
              <p className="font-medium" style={{ color: theme.colors.text }}>
                Documents Under Review
              </p>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                Your documents are being reviewed. This typically takes 1-2 business days.
                You can continue with onboarding and we'll notify you once verification is complete.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg border font-medium transition-colors"
            style={{ 
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary
            }}
          >
            Back
          </button>
        )}
        
        <div className="flex space-x-4">
          {onSkip && (
            <button
              onClick={handleSkip}
              className="px-6 py-3 rounded-lg border font-medium transition-colors"
              style={{ 
                borderColor: theme.colors.border,
                color: theme.colors.textSecondary
              }}
            >
              Skip for Now
            </button>
          )}
          
          <button
            onClick={handleContinue}
            className="px-8 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: theme.colors.primary }}
          >
            {requiredDocsUploaded ? 'Continue' : 'Continue Without KYC'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCStep;