import React, { useState } from 'react';
import { Building2, Upload, MapPin, Phone, Mail, User, FileText, X } from 'lucide-react';

interface CompanyProfileStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const CompanyProfileStep: React.FC<CompanyProfileStepProps> = ({ onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    // Company Information
    companyName: '',
    companyType: '',
    industry: '',
    foundedYear: '',
    employeeCount: '',

    // Location
    country: 'Ghana',
    region: '',
    city: '',
    address: '',
    postalCode: '',

    // Business Details
    businessRegistration: '',
    taxId: '',
    licenseNumber: '',

    // Contact Information
    primaryContact: '',
    contactEmail: '',
    contactPhone: '',
    website: '',

    // Compliance Officer
    complianceOfficer: '',
    officerEmail: '',
    officerPhone: '',
    officerTitle: '',

    // Company Description
    description: '',

    // Logo Upload
    logoPreview: null as string | null,
    logoFile: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const companyTypes = [
    'Music Publishing Company',
    'Record Label',
    'Artist Management',
    'Music Production',
    'Entertainment Company',
    'Independent Publisher',
    'Other'
  ];

  const industries = [
    'Music Publishing',
    'Entertainment',
    'Media & Broadcasting',
    'Creative Arts',
    'Digital Media',
    'Music Technology',
    'Other'
  ];

  const regions = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Central',
    'Eastern',
    'Volta',
    'Northern',
    'Upper East',
    'Upper West',
    'Brong-Ahafo',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logoPreview: typeof reader.result === 'string' ? reader.result : null,
          logoFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logoPreview: null,
      logoFile: null
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.companyType) {
      newErrors.companyType = 'Company type is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    }

    if (!formData.complianceOfficer.trim()) {
      newErrors.complianceOfficer = 'Compliance officer name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Company description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Demo: Log the form data
      console.log('Company profile data:', formData);
      onNext();
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-semibold text-white mb-4">
          Company Profile Setup
        </h3>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Set up your publishing company profile with all the essential business information. This will be used for contracts, reporting, and official communications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Company Information</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-200 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.companyName
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
                placeholder="Your Publishing Company Ltd."
              />
              {errors.companyName && <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>}
            </div>

            <div>
              <label htmlFor="companyType" className="block text-sm font-medium text-slate-200 mb-2">
                Company Type *
              </label>
              <select
                id="companyType"
                name="companyType"
                value={formData.companyType}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white focus:outline-none focus:ring-1 ${
                  errors.companyType
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
              >
                <option value="">Select company type</option>
                {companyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.companyType && <p className="text-red-400 text-sm mt-1">{errors.companyType}</p>}
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-slate-200 mb-2">
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="">Select industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="foundedYear" className="block text-sm font-medium text-slate-200 mb-2">
                Founded Year
              </label>
              <input
                type="number"
                id="foundedYear"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="2020"
              />
            </div>

            <div>
              <label htmlFor="employeeCount" className="block text-sm font-medium text-slate-200 mb-2">
                Employee Count
              </label>
              <select
                id="employeeCount"
                name="employeeCount"
                value={formData.employeeCount}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="">Select size</option>
                <option value="1-5">1-5 employees</option>
                <option value="6-20">6-20 employees</option>
                <option value="21-50">21-50 employees</option>
                <option value="51-100">51-100 employees</option>
                <option value="100+">100+ employees</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-2">
              Company Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                errors.description
                  ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                  : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
              }`}
              placeholder="Describe your publishing company, its mission, and areas of expertise..."
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Location Information</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-200 mb-2">
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.country
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
                placeholder="Ghana"
              />
              {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-slate-200 mb-2">
                Region *
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white focus:outline-none focus:ring-1 ${
                  errors.region
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
              >
                <option value="">Select region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && <p className="text-red-400 text-sm mt-1">{errors.region}</p>}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-200 mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="Accra"
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-slate-200 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="GA-123-4567"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-200 mb-2">
                Business Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="123 Publishing Street, Business District"
              />
            </div>
          </div>
        </div>

        {/* Business Registration */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Business Registration</h4>
          <div className="grid md:grid-cols-2 gap-6">
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
              <label htmlFor="taxId" className="block text-sm font-medium text-slate-200 mb-2">
                Tax Identification Number (TIN)
              </label>
              <input
                type="text"
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="P123456789012"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-slate-200 mb-2">
                Publishing License Number (Optional)
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="PL-2024-001"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Contact Information</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="primaryContact" className="block text-sm font-medium text-slate-200 mb-2">
                Primary Contact Person
              </label>
              <input
                type="text"
                id="primaryContact"
                name="primaryContact"
                value={formData.primaryContact}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-200 mb-2">
                Business Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border pl-10 pr-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    errors.contactEmail
                      ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                  }`}
                  placeholder="contact@yourcompany.com"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {errors.contactEmail && <p className="text-red-400 text-sm mt-1">{errors.contactEmail}</p>}
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-200 mb-2">
                Business Phone *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border pl-10 pr-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    errors.contactPhone
                      ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                  }`}
                  placeholder="+233 XX XXX XXXX"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {errors.contactPhone && <p className="text-red-400 text-sm mt-1">{errors.contactPhone}</p>}
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-slate-200 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="https://www.yourcompany.com"
              />
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
                placeholder="Sarah Johnson"
              />
              {errors.complianceOfficer && <p className="text-red-400 text-sm mt-1">{errors.complianceOfficer}</p>}
            </div>

            <div>
              <label htmlFor="officerTitle" className="block text-sm font-medium text-slate-200 mb-2">
                Job Title
              </label>
              <input
                type="text"
                id="officerTitle"
                name="officerTitle"
                value={formData.officerTitle}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="Head of Compliance"
              />
            </div>

            <div>
              <label htmlFor="officerEmail" className="block text-sm font-medium text-slate-200 mb-2">
                Officer Email
              </label>
              <input
                type="email"
                id="officerEmail"
                name="officerEmail"
                value={formData.officerEmail}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="compliance@yourcompany.com"
              />
            </div>

            <div>
              <label htmlFor="officerPhone" className="block text-sm font-medium text-slate-200 mb-2">
                Officer Phone
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
          </div>
        </div>

        {/* Company Logo Upload */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Company Logo</h4>
          <div className="flex items-center justify-center">
            <div className="text-center">
              {formData.logoPreview ? (
                <div className="relative">
                  <img
                    src={formData.logoPreview}
                    alt="Company Logo Preview"
                    className="w-32 h-32 object-contain rounded-lg border-2 border-indigo-400 mx-auto mb-4"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
              )}

              <label htmlFor="logo-upload" className="cursor-pointer">
                <span className="inline-flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-lg transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{formData.logoPreview ? 'Change Logo' : 'Upload Logo'}</span>
                </span>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <p className="text-sm text-slate-400 mt-2">
                Recommended: Square image, at least 400x400px
              </p>
            </div>
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
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue to Revenue Split
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfileStep;
