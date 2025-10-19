import React, { useState } from 'react';
import { Search, Building2, CheckCircle, X, FileText, Users, Award } from 'lucide-react';
import { OnboardingStepProps } from '../../../components/onboarding/OnboardingWizard';

interface Publisher {
  id: string;
  name: string;
  type: 'Major' | 'Independent' | 'Digital';
  location: string;
  specialties: string[];
  connected?: boolean;
  verified?: boolean;
}

const PublisherStep: React.FC<OnboardingStepProps> = ({ onNext, onPrevious, onSkip }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'connecting' | 'connected' | 'failed'>('none');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Demo publishers data
  const publishers: Publisher[] = [
    {
      id: 'sony-music',
      name: 'Sony Music Entertainment',
      type: 'Major',
      location: 'New York, USA',
      specialties: ['Pop', 'Hip-Hop', 'R&B', 'International'],
      verified: true
    },
    {
      id: 'universal-music',
      name: 'Universal Music Group',
      type: 'Major',
      location: 'Santa Monica, USA',
      specialties: ['All Genres', 'Global Distribution'],
      verified: true
    },
    {
      id: 'empawa-africa',
      name: 'Empawa Africa',
      type: 'Independent',
      location: 'Lagos, Nigeria',
      specialties: ['Afrobeats', 'African Music', 'Digital Distribution'],
      verified: true
    },
    {
      id: 'boomplay-music',
      name: 'Boomplay Music',
      type: 'Digital',
      location: 'Lagos, Nigeria',
      specialties: ['Streaming', 'African Content', 'Digital Rights'],
      verified: true
    },
    {
      id: 'ghana-music-alliance',
      name: 'Ghana Music Alliance',
      type: 'Independent',
      location: 'Accra, Ghana',
      specialties: ['Ghanaian Music', 'Local Distribution', 'Cultural Preservation'],
      verified: true
    }
  ];

  const filteredPublishers = publishers.filter(publisher =>
    publisher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    publisher.specialties.some(specialty =>
      specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handlePublisherSelect = (publisher: Publisher) => {
    setSelectedPublisher(publisher);
  };

  const handleConnect = async () => {
    if (!selectedPublisher || !agreedToTerms) return;

    setConnectionStatus('connecting');

    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Random success/failure for demo
    const success = Math.random() > 0.3;
    setConnectionStatus(success ? 'connected' : 'failed');
  };

  const handleDisconnect = () => {
    setSelectedPublisher(null);
    setConnectionStatus('none');
    setAgreedToTerms(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Publisher (Optional)</h2>
        <p className="text-slate-300">
          Connect with a publisher if you have one, or continue as a self-published artist.
        </p>
      </div>

      {/* Self-Published Recommendation */}
      <div className="mb-8 p-6 rounded-lg border-l-4 bg-green-500/10 border-l-green-400">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-6 h-6 mt-0.5 text-green-400" />
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Self-Published Recommended
            </h3>
            <p className="text-sm text-slate-300">
              As a new artist joining Zamio directly, you're automatically set up as self-published.
              You have full control over your music and receive royalty payments directly. You can connect with a publisher later if needed.
            </p>
          </div>
        </div>
      </div>

      {/* Publisher Search */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4">Search Publishers</h3>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by publisher name or specialty..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/20 bg-slate-800/50 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>

        {/* Publisher Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {filteredPublishers.map((publisher) => (
            <div
              key={publisher.id}
              onClick={() => handlePublisherSelect(publisher)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedPublisher?.id === publisher.id
                  ? 'border-indigo-400 bg-indigo-500/20'
                  : 'border-white/10 bg-slate-800/50 hover:border-indigo-400/50 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-white">{publisher.name}</h4>
                  <p className="text-sm text-slate-400">{publisher.location}</p>
                </div>
                {publisher.verified && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  publisher.type === 'Major' ? 'bg-purple-500/20 text-purple-300' :
                  publisher.type === 'Independent' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {publisher.type}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {publisher.specialties.slice(0, 3).map((specialty) => (
                  <span key={specialty} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredPublishers.length === 0 && searchQuery && (
          <div className="text-center py-8 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No publishers found matching your search.</p>
          </div>
        )}
      </div>

      {/* Connection Section */}
      {selectedPublisher && (
        <div className="mb-8 p-6 rounded-lg bg-slate-800/50 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Connect with {selectedPublisher.name}</h3>
            <button
              onClick={handleDisconnect}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Publisher Info */}
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-indigo-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-white mb-1">About {selectedPublisher.name}</h4>
                <p className="text-sm text-slate-300 mb-2">
                  {selectedPublisher.type} publisher specializing in {selectedPublisher.specialties.join(', ')}.
                </p>
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <span>📍 {selectedPublisher.location}</span>
                  {selectedPublisher.verified && (
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Verified Publisher</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Agreement Terms */}
          <div className="mb-6">
            <h4 className="font-medium text-white mb-3">Connection Agreement</h4>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600 mb-4">
              <div className="flex items-start space-x-3 mb-3">
                <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <p className="mb-2">
                    <strong>Publisher Agreement Terms:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Publisher will have access to your catalog metadata</li>
                    <li>Royalty splits will be managed according to agreement</li>
                    <li>You retain ownership of your master recordings</li>
                    <li>Publishing rights may be administered by the publisher</li>
                    <li>Either party may terminate with 30 days notice</li>
                  </ul>
                </div>
              </div>
            </div>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-400"
              />
              <span className="text-sm text-slate-300">
                I agree to the publisher connection terms and understand the implications for my music rights and royalty distribution.
              </span>
            </label>
          </div>

          {/* Connection Status */}
          <div className="mb-4">
            {connectionStatus === 'connecting' && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-400/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-indigo-300">Connecting to publisher...</span>
                </div>
              </div>
            )}

            {connectionStatus === 'connected' && (
              <div className="p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">Successfully connected to {selectedPublisher.name}!</span>
                </div>
              </div>
            )}

            {connectionStatus === 'failed' && (
              <div className="p-3 bg-red-500/10 border border-red-400/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <X className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-300">Connection failed. Please try again.</span>
                </div>
              </div>
            )}
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            disabled={!agreedToTerms || connectionStatus === 'connecting'}
            className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 text-white py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {connectionStatus === 'connecting' ? 'Connecting...' : `Connect with ${selectedPublisher.name}`}
          </button>
        </div>
      )}

      {/* Publisher Benefits */}
      <div className="mb-8 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
        <h3 className="font-medium text-white mb-2">Publisher Benefits</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="flex items-start space-x-2">
            <Users className="w-4 h-4 text-indigo-400 mt-0.5" />
            <span>Professional publishing administration and royalty collection</span>
          </div>
          <div className="flex items-start space-x-2">
            <Building2 className="w-4 h-4 text-indigo-400 mt-0.5" />
            <span>Access to sync licensing and international markets</span>
          </div>
          <div className="flex items-start space-x-2">
            <Award className="w-4 h-4 text-indigo-400 mt-0.5" />
            <span>Established relationships with PROs and labels</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5" />
            <span>Legal and contractual support for your music</span>
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
          <button
            onClick={onSkip}
            className="inline-flex items-center space-x-2 border border-white/20 hover:border-indigo-400 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span>Skip</span>
          </button>

          <button
            onClick={onNext}
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublisherStep;
