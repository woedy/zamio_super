import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShieldCheck, 
  FileText,
  Info
} from 'lucide-react';
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
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [canSkipVerification, setCanSkipVerification] = useState<boolean>(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadKYCStatus = useCallback(async () => {
    try {
      const response = await api.get(`api/accounts/artist-onboarding-status/${getArtistId()}/`);
      const data = response.data.data;

      if (!isMountedRef.current) {
        return;
      }

      if (data) {
        setKycStatus(data.kyc_status || 'pending');
        setVerificationStatus(data.verification_status || 'pending');
        setCanSkipVerification(data.can_skip_verification !== false);

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
      } else {
        setKycStatus('pending');
        setVerificationStatus('pending');
        setCanSkipVerification(true);
      }
    } catch (error) {
      console.error('Failed to load KYC status:', error);
      if (isMountedRef.current) {
        setKycStatus('pending');
      }
    }
  }, []);

  useEffect(() => {
    loadKYCStatus();
  }, [loadKYCStatus]);

  const handleDocumentUpload = async (documentId: string, file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('document_type', documentId);
      formData.append('document_file', file);

      const response = await api.post('api/accounts/upload-kyc-documents/', formData);

      // Update document status
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, file, status: 'uploaded' }
          : doc
      ));

      setKycStatus(response.data.data.kyc_status);

      await loadKYCStatus();
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
    
    await onNext();
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      
      // Call the skip verification API
      await api.post('api/accounts/skip-verification/', {
        artist_id: getArtistId(),
        reason: 'Skipped during onboarding'
      });
      
      if (onSkip) {
        await onSkip();
      }
    } catch (error: any) {
      console.error('Failed to skip verification:', error);
      // Still proceed with onboarding even if API call fails
      if (onSkip) {
        await onSkip();
      }
    } finally {
      setLoading(false);
    }
  };

  const getKYCStatusMessage = () => {
    // Check verification status first, then KYC status
    if (verificationStatus === 'skipped') {
      return {
        message: 'Identity verification skipped - you can complete this later from your profile',
        color: theme.colors.warning,
        icon: Info
      };
    }
    
    if (verificationStatus === 'verified') {
      return {
        message: 'Identity verification completed',
        color: theme.colors.success,
        icon: ShieldCheck
      };
    }

    switch (kycStatus) {
      case 'pending':
        return {
          message: 'KYC verification not started',
          color: theme.colors.textSecondary,
          icon: FileText
        };
      case 'incomplete':
        return {
          message: 'KYC documents uploaded, under review',
          color: theme.colors.warning,
          icon: Info
        };
      case 'verified':
        return {
          message: 'KYC verification completed',
          color: theme.colors.success,
          icon: ShieldCheck
        };
      case 'rejected':
        return {
          message: 'KYC verification rejected, please resubmit',
          color: theme.colors.error,
          icon: Info
        };
      default:
        return {
          message: 'KYC status unknown',
          color: theme.colors.textSecondary,
          icon: FileText
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
          <ShieldCheck className="w-8 h-8" style={{ color: theme.colors.primary }} />
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
            <Info className="w-5 h-5" style={{ color: theme.colors.info }} />
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

      {/* Verification Skipped Message */}
      {verificationStatus === 'skipped' && (
        <div className="mb-6 p-4 rounded-lg"
             style={{ backgroundColor: theme.colors.warning + '10' }}>
          <div className="flex items-center space-x-3">
            <Info className="w-5 h-5" style={{ color: theme.colors.warning }} />
            <div>
              <p className="font-medium" style={{ color: theme.colors.text }}>
                Verification Skipped
              </p>
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                You've skipped identity verification. You can complete this later from your profile settings.
                Note: Some features like royalty withdrawals require verification.
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
          {onSkip && canSkipVerification && verificationStatus === 'pending' && (
            <button
              onClick={handleSkip}
              disabled={loading}
              className="px-6 py-3 rounded-lg border font-medium transition-colors disabled:opacity-50"
              style={{ 
                borderColor: theme.colors.border,
                color: theme.colors.textSecondary
              }}
            >
              {loading ? 'Skipping...' : 'Skip for Now'}
            </button>
          )}
          
          <button
            onClick={handleContinue}
            disabled={loading}
            className="px-8 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: theme.colors.primary }}
          >
            {loading ? 'Processing...' : 
             verificationStatus === 'skipped' ? 'Continue' :
             requiredDocsUploaded ? 'Continue' : 'Continue Without KYC'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCStep;