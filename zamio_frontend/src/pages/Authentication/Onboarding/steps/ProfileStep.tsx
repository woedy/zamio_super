import React, { useState } from 'react';
import { Camera, Music, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { OnboardingStepProps } from '../../../../components/onboarding/OnboardingWizard';

const ProfileStep: React.FC<OnboardingStepProps> = ({ onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    artistName: '',
    bio: '',
    genre: '',
    style: '',
    location: '',
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
    youtube: ''
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const genres = [
    'Afrobeats', 'Afro-Pop', 'Afro-Fusion', 'Highlife', 'Hiplife',
    'Gospel', 'Reggae/Dancehall', 'Hip-Hop/Rap', 'R&B/Soul',
    'Traditional', 'Jazz', 'Electronic', 'Rock', 'Other'
  ];

  const styles = [
    'Contemporary', 'Traditional', 'Fusion', 'Experimental',
    'Commercial', 'Underground', 'Mainstream', 'Alternative'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Complete Your Artist Profile</h2>
        <p className="text-slate-300">Tell us about yourself and your music to help us personalize your experience.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Picture Upload */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-slate-800/50 ${
              profileImage ? 'border-indigo-400' : 'border-slate-600'
            }`}>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 hover:bg-indigo-400 rounded-full flex items-center justify-center cursor-pointer transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-1">Profile Picture</h3>
            <p className="text-sm text-slate-400">Upload a photo that represents you as an artist</p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="artistName" className="block text-sm font-medium text-slate-200 mb-2">
              Artist Name *
            </label>
            <input
              id="artistName"
              name="artistName"
              type="text"
              required
              value={formData.artistName}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              placeholder="Your artist name"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-200 mb-2">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              placeholder="City, Country"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-200 mb-2">
            Artist Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="Tell us about your musical journey, influences, and what makes your music unique..."
          />
        </div>

        {/* Music Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-slate-200 mb-2">
              Primary Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="">Select your primary genre</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="style" className="block text-sm font-medium text-slate-200 mb-2">
              Musical Style
            </label>
            <select
              id="style"
              name="style"
              value={formData.style}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="">Select your musical style</option>
              {styles.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-slate-200 mb-2">
            Website (Optional)
          </label>
          <input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="https://yourwebsite.com"
          />
        </div>

        {/* Social Media Links */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Social Media Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Instagram className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                className="w-full pl-10 rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="@instagram"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Twitter className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                className="w-full pl-10 rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="@twitter"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Facebook className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                className="w-full pl-10 rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="facebook.com/yourpage"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Youtube className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="youtube"
                value={formData.youtube}
                onChange={handleInputChange}
                className="w-full pl-10 rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="youtube.com/yourchannel"
              />
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
        <button
          onClick={onNext}
          className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Continue to Verification
        </button>
      </div>
    </div>
  );
};

export default ProfileStep;
