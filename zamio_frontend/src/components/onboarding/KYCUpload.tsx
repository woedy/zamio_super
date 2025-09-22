import React, { useState, useCallback } from 'react';
import { 
  DocumentIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

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

interface KYCUploadProps {
  documents: KYCDocument[];
  onDocumentUpload: (documentId: string, file: File) => void;
  onDocumentRemove: (documentId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const KYCUpload: React.FC<KYCUploadProps> = ({
  documents,
  onDocumentUpload,
  onDocumentRemove,
  isLoading = false,
  className = "",
}) => {
  const { theme } = useTheme();
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const getDocumentTypeLabel = (type: KYCDocument['type']) => {
    const labels = {
      id_card: 'National ID Card',
      passport: 'Passport',
      drivers_license: "Driver's License",
      utility_bill: 'Utility Bill',
      bank_statement: 'Bank Statement',
    };
    return labels[type];
  };

  const getStatusIcon = (status: KYCDocument['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="w-5 h-5" style={{ color: theme.colors.success }} />;
      case 'rejected':
        return <ExclamationTriangleIcon className="w-5 h-5" style={{ color: theme.colors.error }} />;
      case 'uploaded':
        return <CloudArrowUpIcon className="w-5 h-5" style={{ color: theme.colors.info }} />;
      default:
        return <DocumentIcon className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />;
    }
  };

  const getStatusText = (status: KYCDocument['status']) => {
    const statusTexts = {
      pending: 'Upload required',
      uploaded: 'Under review',
      verified: 'Verified',
      rejected: 'Rejected',
    };
    return statusTexts[status];
  };

  const handleDragOver = useCallback((e: React.DragEvent, documentId: string) => {
    e.preventDefault();
    setDraggedOver(documentId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, documentId: string) => {
    e.preventDefault();
    setDraggedOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      onDocumentUpload(documentId, file);
    }
  }, [onDocumentUpload]);

  const handleFileSelect = (documentId: string, file: File) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      onDocumentUpload(documentId, file);
    }
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
          KYC Document Upload
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Please upload the required documents to verify your identity. Accepted formats: JPG, PNG, PDF (max 5MB each).
        </p>
      </div>

      <div className="space-y-4">
        {documents.map((document) => (
          <div
            key={document.id}
            className="border rounded-lg p-4 transition-all duration-200"
            style={{ 
              borderColor: draggedOver === document.id ? theme.colors.primary : theme.colors.border,
              backgroundColor: draggedOver === document.id ? theme.colors.primary + '10' : theme.colors.surface
            }}
            onDragOver={(e) => handleDragOver(e, document.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, document.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(document.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium" style={{ color: theme.colors.text }}>
                      {getDocumentTypeLabel(document.type)}
                    </h4>
                    {document.isRequired && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: theme.colors.error + '20',
                          color: theme.colors.error 
                        }}
                      >
                        Required
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
                    {getStatusText(document.status)}
                  </p>

                  {document.status === 'rejected' && document.rejectionReason && (
                    <div
                      className="text-xs p-2 rounded border-l-4 mb-2"
                      style={{ 
                        backgroundColor: theme.colors.error + '10',
                        borderLeftColor: theme.colors.error,
                        color: theme.colors.error
                      }}
                    >
                      Rejection reason: {document.rejectionReason}
                    </div>
                  )}

                  {document.file && (
                    <div className="flex items-center space-x-2 text-xs" style={{ color: theme.colors.textSecondary }}>
                      <DocumentIcon className="w-4 h-4" />
                      <span>{document.file.name}</span>
                      <span>({(document.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {document.status === 'pending' || document.status === 'rejected' ? (
                  <label
                    className="cursor-pointer px-3 py-1.5 text-xs font-medium rounded border transition-colors"
                    style={{ 
                      borderColor: theme.colors.primary,
                      color: theme.colors.primary,
                      backgroundColor: 'transparent'
                    }}
                  >
                    {document.file ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelect(document.id, file);
                        }
                      }}
                      disabled={isLoading}
                    />
                  </label>
                ) : null}

                {document.file && (
                  <button
                    onClick={() => onDocumentRemove(document.id)}
                    className="p-1.5 rounded hover:bg-red-50 transition-colors"
                    disabled={isLoading}
                  >
                    <XMarkIcon className="w-4 h-4" style={{ color: theme.colors.error }} />
                  </button>
                )}
              </div>
            </div>

            {/* Drag and Drop Area */}
            {(document.status === 'pending' || document.status === 'rejected') && !document.file && (
              <div
                className="mt-3 border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                style={{ 
                  borderColor: draggedOver === document.id ? theme.colors.primary : theme.colors.border
                }}
              >
                <CloudArrowUpIcon 
                  className="w-8 h-8 mx-auto mb-2" 
                  style={{ color: theme.colors.textSecondary }} 
                />
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  Drag and drop your {getDocumentTypeLabel(document.type).toLowerCase()} here, or{' '}
                  <label
                    className="cursor-pointer font-medium"
                    style={{ color: theme.colors.primary }}
                  >
                    browse files
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelect(document.id, file);
                        }
                      }}
                      disabled={isLoading}
                    />
                  </label>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upload Guidelines */}
      <div
        className="mt-6 p-4 rounded-lg border-l-4"
        style={{ 
          backgroundColor: theme.colors.info + '10',
          borderLeftColor: theme.colors.info
        }}
      >
        <h4 className="text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
          Document Guidelines
        </h4>
        <ul className="text-xs space-y-1" style={{ color: theme.colors.textSecondary }}>
          <li>• Documents must be clear and readable</li>
          <li>• All four corners of the document must be visible</li>
          <li>• No screenshots or photocopies</li>
          <li>• File size should not exceed 5MB</li>
          <li>• Accepted formats: JPG, PNG, PDF</li>
        </ul>
      </div>
    </div>
  );
};

export default KYCUpload;