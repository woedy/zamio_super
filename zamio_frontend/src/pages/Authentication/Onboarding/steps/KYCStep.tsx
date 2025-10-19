import React, { useState } from 'react';
import { Upload, FileText, Shield, AlertCircle, CheckCircle, SkipForward } from 'lucide-react';
import { OnboardingStepProps } from '../../../../components/onboarding/OnboardingWizard';

const KYCStep: React.FC<OnboardingStepProps> = ({ onNext, onPrevious, onSkip, canSkip }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    idType: '',
    idNumber: '',
    dateOfBirth: '',
    nationality: 'Ghana',
    address: ''
  });

  const [documents, setDocuments] = useState({
    idDocument: null as File | null,
    proofOfAddress: null as File | null,
    selfie: null as File | null
  });

  const [uploadStatus, setUploadStatus] = useState({
    idDocument: 'pending',
    proofOfAddress: 'pending',
    selfie: 'pending'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (documentType: keyof typeof documents) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [documentType]: file
      }));
      setUploadStatus(prev => ({
        ...prev,
        [documentType]: 'uploaded'
      }));

      // Simulate processing delay
      setTimeout(() => {
        setUploadStatus(prev => ({
          ...prev,
          [documentType]: 'verified'
        }));
      }, 2000);
    }
  };

  const idTypes = [
    'Ghana Card',
    'Passport',
    'Driver\'s License',
    'Voter ID'
  ];

  const nationalities = [
    'Ghana',
    'Nigeria',
    'Kenya',
    'South Africa',
    'United Kingdom',
    'United States',
    'Canada',
    'Other'
  ];

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Identity Verification</h2>
        <p className="text-slate-300">
          Upload KYC documents for account verification. This helps us ensure compliance and security.
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-4 rounded-lg bg-blue-500/10 border border-blue-400/20">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-300 mb-1">Why do we need this?</h3>
            <p className="text-sm text-blue-200">
              Identity verification helps us comply with regulatory requirements and ensures secure royalty payments.
              This step is recommended but optional for demo purposes.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Personal Information */}
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
                  <option key={nationality} value={nationality}>{nationality}</option>
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
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="idNumber" className="block text-sm font-medium text-slate-200 mb-2">
                ID Number *
              </label>
              <input
                id="idNumber"
                name="idNumber"
                type="text"
                required
                value={formData.idNumber}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="Enter your ID number"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-200 mb-2">
                Residential Address *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="Enter your full residential address"
              />
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Document Upload</h3>
          <p className="text-sm text-slate-400 mb-6">
            Upload clear photos of your identification documents. Files should be JPG, PNG, or PDF format (max 5MB each).
          </p>

          <div className="space-y-6">
            {/* ID Document */}
            <div className="border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="font-medium text-white">Government ID</h4>
                    <p className="text-sm text-slate-400">Passport, Ghana Card, or Driver's License</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 ${getStatusColor(uploadStatus.idDocument)}`}>
                  {getStatusIcon(uploadStatus.idDocument)}
                  <span className="text-sm">{getStatusText(uploadStatus.idDocument)}</span>
                </div>
              </div>

              {uploadStatus.idDocument === 'pending' && (
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400 mb-2">Drag and drop or click to upload</p>
                  <p className="text-xs text-slate-500">JPG, PNG, PDF (max 5MB)</p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUpload('idDocument')}
                    className="hidden"
                    id="idDocument"
                  />
                  <label
                    htmlFor="idDocument"
                    className="mt-3 inline-flex items-center px-4 py-2 border border-white/20 rounded-lg text-sm text-slate-300 hover:border-indigo-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}

              {uploadStatus.idDocument === 'uploaded' && (
                <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-lg p-4">
                  <p className="text-sm text-indigo-300">Document uploaded successfully. Processing verification...</p>
                </div>
              )}

              {uploadStatus.idDocument === 'verified' && (
                <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
                  <p className="text-sm text-green-300">Document verified successfully!</p>
                </div>
              )}
            </div>

            {/* Proof of Address */}
            <div className="border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="font-medium text-white">Proof of Address</h4>
                    <p className="text-sm text-slate-400">Utility bill, bank statement, or lease agreement (max 3 months old)</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 ${getStatusColor(uploadStatus.proofOfAddress)}`}>
                  {getStatusIcon(uploadStatus.proofOfAddress)}
                  <span className="text-sm">{getStatusText(uploadStatus.proofOfAddress)}</span>
                </div>
              </div>

              {uploadStatus.proofOfAddress === 'pending' && (
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400 mb-2">Drag and drop or click to upload</p>
                  <p className="text-xs text-slate-500">JPG, PNG, PDF (max 5MB)</p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileUpload('proofOfAddress')}
                    className="hidden"
                    id="proofOfAddress"
                  />
                  <label
                    htmlFor="proofOfAddress"
                    className="mt-3 inline-flex items-center px-4 py-2 border border-white/20 rounded-lg text-sm text-slate-300 hover:border-indigo-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}

              {uploadStatus.proofOfAddress === 'uploaded' && (
                <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-lg p-4">
                  <p className="text-sm text-indigo-300">Document uploaded successfully. Processing verification...</p>
                </div>
              )}

              {uploadStatus.proofOfAddress === 'verified' && (
                <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
                  <p className="text-sm text-green-300">Document verified successfully!</p>
                </div>
              )}
            </div>

            {/* Selfie with ID */}
            <div className="border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="font-medium text-white">Selfie with ID</h4>
                    <p className="text-sm text-slate-400">Photo of yourself holding your ID document</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 ${getStatusColor(uploadStatus.selfie)}`}>
                  {getStatusIcon(uploadStatus.selfie)}
                  <span className="text-sm">{getStatusText(uploadStatus.selfie)}</span>
                </div>
              </div>

              {uploadStatus.selfie === 'pending' && (
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400 mb-2">Drag and drop or click to upload</p>
                  <p className="text-xs text-slate-500">JPG, PNG (max 5MB)</p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileUpload('selfie')}
                    className="hidden"
                    id="selfie"
                  />
                  <label
                    htmlFor="selfie"
                    className="mt-3 inline-flex items-center px-4 py-2 border border-white/20 rounded-lg text-sm text-slate-300 hover:border-indigo-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}

              {uploadStatus.selfie === 'uploaded' && (
                <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-lg p-4">
                  <p className="text-sm text-indigo-300">Photo uploaded successfully. Processing verification...</p>
                </div>
              )}

              {uploadStatus.selfie === 'verified' && (
                <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
                  <p className="text-sm text-green-300">Photo verified successfully!</p>
                </div>
              )}
            </div>
          </div>
        </div>
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
