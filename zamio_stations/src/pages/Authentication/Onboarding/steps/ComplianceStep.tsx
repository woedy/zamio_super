import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, Shield, FileCheck, Download, Eye, Trash2 } from 'lucide-react';

interface ComplianceDocument {
  id: string;
  name: string;
  type: 'license' | 'certificate' | 'report' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  fileSize: string;
  expiryDate?: string;
}

interface ComplianceStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
}

const ComplianceStep: React.FC<ComplianceStepProps> = ({ onNext, onPrevious, onSkip }) => {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([
    {
      id: '1',
      name: 'Broadcasting License.pdf',
      type: 'license',
      status: 'approved',
      uploadedAt: '2024-01-15',
      fileSize: '2.4 MB',
      expiryDate: '2025-12-31'
    },
    {
      id: '2',
      name: 'Technical Certificate.pdf',
      type: 'certificate',
      status: 'pending',
      uploadedAt: '2024-10-01',
      fileSize: '1.8 MB',
      expiryDate: '2026-06-15'
    }
  ]);

  const [checklistItems, setChecklistItems] = useState([
    { id: 'license', label: 'Valid broadcasting license', completed: true, required: true },
    { id: 'technical', label: 'Technical compliance certificate', completed: false, required: true },
    { id: 'frequency', label: 'Frequency allocation documentation', completed: true, required: true },
    { id: 'insurance', label: 'Public liability insurance', completed: false, required: false },
    { id: 'content', label: 'Content compliance guidelines', completed: true, required: true },
    { id: 'emergency', label: 'Emergency broadcast procedures', completed: false, required: false },
    { id: 'reporting', label: 'Monthly reporting compliance', completed: true, required: true }
  ]);

  const [formData, setFormData] = useState({
    licenseNumber: 'NCA/BR/2024/001',
    licenseAuthority: 'National Communications Authority',
    licenseIssueDate: '2024-01-01',
    licenseExpiryDate: '2025-12-31',
    frequency: '102.3 MHz',
    power: '1000W',
    stationCategory: 'Commercial FM',
    complianceOfficer: 'Sarah Johnson',
    officerEmail: 'sarah@radiostation.com',
    officerPhone: '+233 24 123 4567',
    emergencyContact: '+233 24 987 6543'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const documentTypes = [
    { value: 'license', label: 'Broadcasting License' },
    { value: 'certificate', label: 'Technical Certificate' },
    { value: 'report', label: 'Compliance Report' },
    { value: 'other', label: 'Other Document' }
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

  const handleChecklistToggle = (itemId: string) => {
    setChecklistItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.licenseAuthority.trim()) {
      newErrors.licenseAuthority = 'License authority is required';
    }

    if (!formData.complianceOfficer.trim()) {
      newErrors.complianceOfficer = 'Compliance officer name is required';
    }

    if (!formData.officerEmail.trim()) {
      newErrors.officerEmail = 'Compliance officer email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.officerEmail)) {
      newErrors.officerEmail = 'Please enter a valid email address';
    }

    // Check if all required checklist items are completed
    const requiredItems = checklistItems.filter(item => item.required);
    const completedRequiredItems = requiredItems.filter(item => item.completed);

    if (completedRequiredItems.length !== requiredItems.length) {
      newErrors.checklist = 'All required compliance items must be completed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Demo: Log the form data
      console.log('Compliance data:', formData, 'Checklist:', checklistItems);
      onNext();
    }
  };

  const handleFileUpload = (type: string) => {
    // Demo file upload simulation
    const mockFile: ComplianceDocument = {
      id: Date.now().toString(),
      name: `${type}_document_${Date.now()}.pdf`,
      type: type as any,
      status: 'pending',
      uploadedAt: new Date().toISOString().split('T')[0],
      fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      expiryDate: type === 'license' ? '2025-12-31' : '2026-06-15'
    };

    setDocuments(prev => [...prev, mockFile]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-500/20';
      case 'rejected':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const completedItems = checklistItems.filter(item => item.completed).length;
  const totalItems = checklistItems.length;
  const requiredItems = checklistItems.filter(item => item.required).length;
  const completedRequiredItems = checklistItems.filter(item => item.completed && item.required).length;

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-semibold text-white mb-4">
          Compliance Setup
        </h3>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Ensure your station meets all regulatory requirements and maintain compliance with Ghanaian broadcasting standards and GHAMRO regulations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* License Information */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">License Information</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-200 mb-2">
                License Number *
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.licenseNumber
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
                placeholder="NCA/BR/2024/001"
              />
              {errors.licenseNumber && <p className="text-red-400 text-sm mt-1">{errors.licenseNumber}</p>}
            </div>

            <div>
              <label htmlFor="licenseAuthority" className="block text-sm font-medium text-slate-200 mb-2">
                Issuing Authority *
              </label>
              <select
                id="licenseAuthority"
                name="licenseAuthority"
                value={formData.licenseAuthority}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white focus:outline-none focus:ring-1 ${
                  errors.licenseAuthority
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
              >
                <option value="">Select authority</option>
                <option value="National Communications Authority">National Communications Authority</option>
                <option value="Ghana Broadcasting Corporation">Ghana Broadcasting Corporation</option>
                <option value="Ministry of Communications">Ministry of Communications</option>
              </select>
              {errors.licenseAuthority && <p className="text-red-400 text-sm mt-1">{errors.licenseAuthority}</p>}
            </div>

            <div>
              <label htmlFor="licenseIssueDate" className="block text-sm font-medium text-slate-200 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                id="licenseIssueDate"
                name="licenseIssueDate"
                value={formData.licenseIssueDate}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-slate-200 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                id="licenseExpiryDate"
                name="licenseExpiryDate"
                value={formData.licenseExpiryDate}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-slate-200 mb-2">
                Operating Frequency
              </label>
              <input
                type="text"
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="102.3 MHz"
              />
            </div>

            <div>
              <label htmlFor="power" className="block text-sm font-medium text-slate-200 mb-2">
                Transmitter Power
              </label>
              <input
                type="text"
                id="power"
                name="power"
                value={formData.power}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="1000W"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="stationCategory" className="block text-sm font-medium text-slate-200 mb-2">
                Station Category
              </label>
              <select
                id="stationCategory"
                name="stationCategory"
                value={formData.stationCategory}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="">Select category</option>
                <option value="Commercial FM">Commercial FM</option>
                <option value="Community Radio">Community Radio</option>
                <option value="Campus Radio">Campus Radio</option>
                <option value="Religious Radio">Religious Radio</option>
                <option value="Public Broadcasting">Public Broadcasting</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compliance Officer */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Compliance Officer</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="complianceOfficer" className="block text-sm font-medium text-slate-200 mb-2">
                Compliance Officer Name *
              </label>
              <input
                type="text"
                id="complianceOfficer"
                name="complianceOfficer"
                value={formData.complianceOfficer}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.complianceOfficer
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
                placeholder="Full name of compliance officer"
              />
              {errors.complianceOfficer && <p className="text-red-400 text-sm mt-1">{errors.complianceOfficer}</p>}
            </div>

            <div>
              <label htmlFor="officerEmail" className="block text-sm font-medium text-slate-200 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="officerEmail"
                name="officerEmail"
                value={formData.officerEmail}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.officerEmail
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
                placeholder="compliance@radiostation.com"
              />
              {errors.officerEmail && <p className="text-red-400 text-sm mt-1">{errors.officerEmail}</p>}
            </div>

            <div>
              <label htmlFor="officerPhone" className="block text-sm font-medium text-slate-200 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="officerPhone"
                name="officerPhone"
                value={formData.officerPhone}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="+233 XX XXX XXXX"
              />
            </div>

            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-slate-200 mb-2">
                Emergency Contact
              </label>
              <input
                type="tel"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="+233 XX XXX XXXX"
              />
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Required Documents</h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {documentTypes.map((docType) => (
              <button
                key={docType.value}
                type="button"
                onClick={() => handleFileUpload(docType.value)}
                className="p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-indigo-400 hover:bg-slate-800/50 transition-colors text-center"
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-200">{docType.label}</p>
                <p className="text-xs text-slate-400">Click to upload</p>
              </button>
            ))}
          </div>

          {documents.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-white">Uploaded Documents</h5>
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(doc.status)}
                    <div>
                      <p className="font-medium text-white text-sm">{doc.name}</p>
                      <p className="text-xs text-slate-400">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.fileSize}
                        {doc.expiryDate && ` • Expires ${new Date(doc.expiryDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                    <button className="p-1 text-slate-400 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compliance Checklist */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-semibold text-white">Compliance Checklist</h4>
            <div className="text-sm text-slate-400">
              {completedItems}/{totalItems} completed • {completedRequiredItems}/{requiredItems} required
            </div>
          </div>

          <div className="space-y-3">
            {checklistItems.map((item) => (
              <label key={item.id} className="flex items-start space-x-3 p-3 rounded-lg border border-white/10 bg-slate-800/50 hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleChecklistToggle(item.id)}
                  className="mt-0.5 rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-400"
                />
                <div className="flex-1">
                  <span className={`text-sm ${item.completed ? 'text-slate-300 line-through' : 'text-slate-200'}`}>
                    {item.label}
                    {item.required && <span className="text-red-400 ml-1">*</span>}
                  </span>
                </div>
                {item.completed && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
              </label>
            ))}
          </div>

          {errors.checklist && <p className="text-red-400 text-sm mt-3">{errors.checklist}</p>}
        </div>

        {/* GHAMRO Information */}
        <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h5 className="font-medium text-indigo-300">GHAMRO Compliance</h5>
          </div>
          <p className="text-sm text-slate-300 mb-3">
            Your station must be registered with the Ghana Music Rights Organization (GHAMRO) for music royalty collection.
          </p>
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              <Download className="w-4 h-4" />
              <span>Download GHAMRO Forms</span>
            </button>
            <button className="inline-flex items-center space-x-2 border border-indigo-400 text-indigo-300 hover:bg-indigo-500/20 px-4 py-2 rounded-lg transition-colors text-sm">
              <FileCheck className="w-4 h-4" />
              <span>View Requirements</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={onPrevious}
            className="bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Previous
          </button>
          <div className="flex space-x-3">
            {onSkip && (
              <button
                onClick={onSkip}
                className="border border-white/20 hover:border-indigo-400 text-slate-300 hover:text-white px-6 py-3 rounded-lg transition-colors"
              >
                Skip
              </button>
            )}
            <button
              type="submit"
              disabled={completedRequiredItems !== requiredItems}
              className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
            >
              {completedRequiredItems === requiredItems ? 'Continue to Payment' : 'Complete Required Items'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ComplianceStep;
