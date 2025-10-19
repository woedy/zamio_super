import React, { useState } from 'react';
import { Radio, Upload, MapPin, Phone, Mail, Building2, Globe, Users, Camera } from 'lucide-react';

interface ProfileStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    stationName: '',
    stationType: '',
    location: '',
    region: '',
    coverageArea: '',
    licenseNumber: '',
    licenseExpiry: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    description: ''
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stationTypes = [
    'FM Radio',
    'Digital Radio',
    'Community Radio',
    'Campus Radio',
    'Religious Radio',
    'News/Talk Radio',
    'Music Radio',
    'Sports Radio'
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
    'Brong Ahafo',
    'Northern',
    'Oti',
    'North East',
    'Ahafo',
    'Bono East',
    'Western North',
    'Savannah'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Demo: Show preview without actual upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.stationName.trim()) {
      newErrors.stationName = 'Station name is required';
    }

    if (!formData.stationType) {
      newErrors.stationType = 'Station type is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.region) {
      newErrors.region = 'Region is required';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact person name is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Demo: Log the form data
      console.log('Station profile data:', formData);
      onNext();
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-semibold text-white mb-4">
          Station Profile Setup
        </h3>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Configure your station's basic information and licensing details to get started with Zamio Stations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Station Logo Upload */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Station Logo</h4>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className={`w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center bg-slate-800/50 ${logoPreview ? 'border-indigo-400' : 'border-slate-600'}`}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Station logo" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <button
                type="button"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 hover:bg-indigo-400 rounded-full flex items-center justify-center transition-colors"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Upload className="w-4 h-4 text-white" />
              </button>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-slate-200 mb-2">Upload your station logo</p>
              <p className="text-sm text-slate-400">
                JPG, PNG up to 2MB. This will be displayed on your station profile and reports.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Basic Information</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="stationName" className="block text-sm font-medium text-slate-200 mb-2">
                Station Name *
              </label>
              <input
                type="text"
                id="stationName"
                name="stationName"
                value={formData.stationName}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.stationName
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
                placeholder="e.g. Joy FM, Citi FM"
              />
              {errors.stationName && <p className="text-red-400 text-sm mt-1">{errors.stationName}</p>}
            </div>

            <div>
              <label htmlFor="stationType" className="block text-sm font-medium text-slate-200 mb-2">
                Station Type *
              </label>
              <select
                id="stationType"
                name="stationType"
                value={formData.stationType}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white focus:outline-none focus:ring-1 ${
                  errors.stationType
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
              >
                <option value="">Select station type</option>
                {stationTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.stationType && <p className="text-red-400 text-sm mt-1">{errors.stationType}</p>}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-200 mb-2">
                Location/City *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border pl-10 pr-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    errors.location
                      ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                  }`}
                  placeholder="e.g. Accra, Kumasi"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
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

            <div className="md:col-span-2">
              <label htmlFor="coverageArea" className="block text-sm font-medium text-slate-200 mb-2">
                Coverage Area
              </label>
              <input
                type="text"
                id="coverageArea"
                name="coverageArea"
                value={formData.coverageArea}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="e.g. Greater Accra Region, National coverage"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-2">
                Station Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                placeholder="Brief description of your station's format, audience, and programming..."
              />
            </div>
          </div>
        </div>

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
                placeholder="Broadcasting license number"
              />
              {errors.licenseNumber && <p className="text-red-400 text-sm mt-1">{errors.licenseNumber}</p>}
            </div>

            <div>
              <label htmlFor="licenseExpiry" className="block text-sm font-medium text-slate-200 mb-2">
                License Expiry Date
              </label>
              <input
                type="date"
                id="licenseExpiry"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Contact Information</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-slate-200 mb-2">
                Contact Person Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border pl-10 pr-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    errors.contactName
                      ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                  }`}
                  placeholder="Primary contact person"
                />
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {errors.contactName && <p className="text-red-400 text-sm mt-1">{errors.contactName}</p>}
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-200 mb-2">
                Contact Email *
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
                  placeholder="station@radiostation.com"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {errors.contactEmail && <p className="text-red-400 text-sm mt-1">{errors.contactEmail}</p>}
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-200 mb-2">
                Contact Phone *
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
              <div className="relative">
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border pl-10 pr-4 py-3 text-white placeholder:text-slate-400 border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  placeholder="https://yourstation.com"
                />
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Previous
          </button>
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue to Stream Setup
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileStep;
