import React, { useState } from 'react';
import { Users, Search, Plus, Mail, UserCheck, UserX, FileText, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface ArtistManagementStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

interface Artist {
  id: string;
  stageName: string;
  realName?: string;
  email: string;
  phone?: string;
  status: 'linked' | 'pending' | 'invited' | 'unlinked';
  linkedDate?: string;
  contractStatus: 'active' | 'expired' | 'pending' | 'none';
  catalogSize: number;
  lastActivity?: string;
}

const ArtistManagementStep: React.FC<ArtistManagementStepProps> = ({ onNext, onPrevious }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState('');

  // Demo data for existing linked artists
  const [linkedArtists, setLinkedArtists] = useState<Artist[]>([
    {
      id: '1',
      stageName: 'Sarkodie',
      realName: 'Michael Owusu Addo',
      email: 'sarkodie@management.com',
      status: 'linked',
      linkedDate: '2024-01-15',
      contractStatus: 'active',
      catalogSize: 45,
      lastActivity: '2024-10-01'
    },
    {
      id: '2',
      stageName: 'Stonebwoy',
      realName: 'Livingstone Satekla',
      email: 'stonebwoy@management.com',
      status: 'linked',
      linkedDate: '2024-02-20',
      contractStatus: 'active',
      catalogSize: 38,
      lastActivity: '2024-09-28'
    }
  ]);

  // Demo search results
  const [availableArtists] = useState<Artist[]>([
    {
      id: '3',
      stageName: 'Shatta Wale',
      realName: 'Charles Nii Armah Mensah Jr.',
      email: 'shatta@management.com',
      status: 'unlinked',
      contractStatus: 'none',
      catalogSize: 52,
      lastActivity: '2024-09-15'
    },
    {
      id: '4',
      stageName: 'Efya',
      realName: 'Jane Awindor',
      email: 'efya@management.com',
      status: 'invited',
      contractStatus: 'pending',
      catalogSize: 28,
      lastActivity: '2024-08-20'
    },
    {
      id: '5',
      stageName: 'Kuami Eugene',
      realName: 'Eugene Kwame Marfo',
      email: 'kuami@management.com',
      status: 'unlinked',
      contractStatus: 'none',
      catalogSize: 35,
      lastActivity: '2024-09-10'
    }
  ]);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    stageName: '',
    message: 'You have been invited to join our publishing catalog. Please accept this invitation to start earning royalties.'
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    // Simulate API search
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Filter available artists based on search query
    const filtered = availableArtists.filter(artist =>
      artist.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(filtered);
    setIsSearching(false);
  };

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(artistId)) {
        newSet.delete(artistId);
      } else {
        newSet.add(artistId);
      }
      return newSet;
    });
  };

  const handleLinkArtists = async () => {
    if (selectedArtists.size === 0) {
      setError('Please select at least one artist to link');
      return;
    }

    setIsLinking(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Move selected artists to linked artists
    const newlyLinked = searchResults.filter(artist => selectedArtists.has(artist.id));
    setLinkedArtists(prev => [...prev, ...newlyLinked.map(artist => ({
      ...artist,
      status: 'linked' as const,
      linkedDate: new Date().toISOString().split('T')[0]
    }))]);

    // Remove from search results
    setSearchResults(prev => prev.filter(artist => !selectedArtists.has(artist.id)));
    setSelectedArtists(new Set());
    setIsLinking(false);
  };

  const handleInviteArtist = async () => {
    if (!inviteForm.email.trim()) {
      setError('Email is required to send invitation');
      return;
    }

    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add to search results as invited
    const newInvitedArtist: Artist = {
      id: Date.now().toString(),
      stageName: inviteForm.stageName || 'New Artist',
      email: inviteForm.email,
      status: 'invited',
      contractStatus: 'pending',
      catalogSize: 0
    };

    setSearchResults(prev => [...prev, newInvitedArtist]);
    setInviteForm({ email: '', stageName: '', message: inviteForm.message });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'linked':
        return <UserCheck className="w-4 h-4 text-green-400" />;
      case 'invited':
        return <Mail className="w-4 h-4 text-blue-400" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <UserX className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'linked':
        return 'text-green-400 bg-green-500/20';
      case 'invited':
        return 'text-blue-400 bg-blue-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20';
      case 'expired':
        return 'text-red-400 bg-red-500/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-semibold text-white mb-4">
          Artist Management
        </h3>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Connect with artists and manage your publishing relationships. Link existing artists or invite new ones to join your catalog for royalty collection.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Linked Artists */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-semibold text-white">Your Artists</h4>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-slate-400">{linkedArtists.length} linked</span>
            </div>
          </div>

          {linkedArtists.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No artists linked yet</p>
              <p className="text-sm text-slate-500">Search and link artists below to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {linkedArtists.map((artist) => (
                <div key={artist.id} className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                        {getStatusIcon(artist.status)}
                      </div>
                      <div>
                        <h5 className="font-medium text-white">{artist.stageName}</h5>
                        <p className="text-sm text-slate-400">{artist.email}</p>
                        <p className="text-xs text-slate-500">
                          Linked {artist.linkedDate} • {artist.catalogSize} songs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractStatusColor(artist.contractStatus)}`}>
                        {artist.contractStatus.charAt(0).toUpperCase() + artist.contractStatus.slice(1)}
                      </span>
                      <button className="p-2 text-slate-400 hover:text-white transition-colors">
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Artist Search & Invitation */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Find & Connect Artists</h4>

          {/* Search Section */}
          <div className="mb-8">
            <div className="flex space-x-2 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by stage name or email..."
                  className="w-full rounded-lg border border-white/20 bg-slate-800/50 pl-10 pr-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-3 mb-6">
                <h5 className="font-medium text-white">Search Results</h5>
                {searchResults.map((artist) => (
                  <div key={artist.id} className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedArtists.has(artist.id)}
                          onChange={() => handleArtistSelect(artist.id)}
                          className="rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-400"
                        />
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                          {getStatusIcon(artist.status)}
                        </div>
                        <div>
                          <h6 className="font-medium text-white">{artist.stageName}</h6>
                          <p className="text-sm text-slate-400">{artist.email}</p>
                          <p className="text-xs text-slate-500">{artist.catalogSize} songs</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(artist.status)}`}>
                          {artist.status.charAt(0).toUpperCase() + artist.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractStatusColor(artist.contractStatus)}`}>
                          {artist.contractStatus.charAt(0).toUpperCase() + artist.contractStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {selectedArtists.size > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleLinkArtists}
                      disabled={isLinking}
                      className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      {isLinking ? 'Linking...' : `Link ${selectedArtists.size} Artist${selectedArtists.size > 1 ? 's' : ''}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400">No artists found</p>
              </div>
            )}
          </div>

          {/* Invitation Section */}
          <div className="border-t border-white/10 pt-6">
            <h5 className="font-medium text-white mb-4">Invite New Artist</h5>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="artist@email.com"
                  className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <input
                  type="text"
                  value={inviteForm.stageName}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, stageName: e.target.value }))}
                  placeholder="Stage name (optional)"
                  className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <textarea
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                placeholder="Custom invitation message..."
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />

              <button
                onClick={handleInviteArtist}
                disabled={!inviteForm.email.trim()}
                className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Management Info */}
      <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-2xl p-6 mt-8">
        <div className="flex items-center space-x-3 mb-3">
          <Users className="w-5 h-5 text-indigo-400" />
          <h5 className="font-medium text-indigo-300">Artist Management Overview</h5>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-300 mb-2"><strong>Linked Artists:</strong></p>
            <ul className="text-slate-400 space-y-1">
              <li>• Automatic royalty collection</li>
              <li>• Contract management</li>
              <li>• Catalog tracking</li>
              <li>• Performance analytics</li>
            </ul>
          </div>
          <div>
            <p className="text-slate-300 mb-2"><strong>Invited Artists:</strong></p>
            <ul className="text-slate-400 space-y-1">
              <li>• Email invitation system</li>
              <li>• Custom invitation messages</li>
              <li>• Pending approval tracking</li>
              <li>• Follow-up reminders</li>
            </ul>
          </div>
          <div>
            <p className="text-slate-300 mb-2"><strong>Ghana Integration:</strong></p>
            <ul className="text-slate-400 space-y-1">
              <li>• GHAMRO compliance</li>
              <li>• Local artist discovery</li>
              <li>• Mobile money payments</li>
              <li>• Regional reporting</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center text-red-400 text-sm mt-4">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Continue to Payment Setup
        </button>
      </div>
    </div>
  );
};

export default ArtistManagementStep;
