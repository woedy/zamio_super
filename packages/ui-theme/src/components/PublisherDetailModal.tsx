import React from 'react';
import { X, Building2, Users, Music, DollarSign, MapPin, Calendar, CheckCircle, TrendingUp, Eye } from 'lucide-react';

export interface PublisherDetailData {
  publisher: {
    publisher_id: string;
    company_name: string;
    verified: boolean;
    region?: string;
    city?: string;
    country?: string;
    writer_split: number;
    publisher_split: number;
    total_earnings: number;
    total_tracks: number;
    total_plays: number;
    created_at: string;
    user: {
      name: string;
      email: string;
      photo?: string;
    };
  };
  artists: Array<{
    artist_id: string;
    stage_name: string;
    name: string;
    track_count: number;
    earnings: number;
    relationship_type: string;
    royalty_split: number;
    start_date: string;
  }>;
  agreements: Array<{
    id: number;
    track_title: string;
    artist_name: string;
    writer_share: number;
    publisher_share: number;
    status: string;
    agreement_date: string;
    verified: boolean;
  }>;
}

interface PublisherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  publisherDetail: PublisherDetailData | null;
  loading?: boolean;
  error?: string | null;
}

export const PublisherDetailModal: React.FC<PublisherDetailModalProps> = ({
  isOpen,
  onClose,
  publisherDetail,
  loading = false,
  error = null
}) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'rejected':
      case 'terminated':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-blue-400" />
            Publisher Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-300">Loading publisher details...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32">
              <div className="text-red-400">{error}</div>
            </div>
          )}

          {publisherDetail && (
            <div className="space-y-6">
              {/* Publisher Info */}
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-2xl font-bold text-white">
                          {publisherDetail.publisher.company_name || publisherDetail.publisher.user.name}
                        </h3>
                        {publisherDetail.publisher.verified && (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        )}
                      </div>
                      <p className="text-gray-300">{publisherDetail.publisher.user.email}</p>
                    </div>
                  </div>
                  {publisherDetail.publisher.user.photo && (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                      <img
                        src={publisherDetail.publisher.user.photo}
                        alt={publisherDetail.publisher.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Location */}
                {(publisherDetail.publisher.region || publisherDetail.publisher.country) && (
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {[publisherDetail.publisher.city, publisherDetail.publisher.region, publisherDetail.publisher.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}

                {/* Join Date */}
                <div className="flex items-center space-x-2 mb-6">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">
                    Joined {formatDate(publisherDetail.publisher.created_at)}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">Total Earnings</span>
                    </div>
                    <div className="text-white font-semibold">
                      {formatCurrency(publisherDetail.publisher.total_earnings)}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Music className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300 text-sm">Total Tracks</span>
                    </div>
                    <div className="text-white font-semibold">
                      {publisherDetail.publisher.total_tracks}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300 text-sm">Total Plays</span>
                    </div>
                    <div className="text-white font-semibold">
                      {publisherDetail.publisher.total_plays.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">Artists</span>
                    </div>
                    <div className="text-white font-semibold">
                      {publisherDetail.artists.length}
                    </div>
                  </div>
                </div>

                {/* Split Information */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-gray-300 text-sm">Writer Split</span>
                    <div className="text-white font-semibold">
                      {publisherDetail.publisher.writer_split}%
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-gray-300 text-sm">Publisher Split</span>
                    <div className="text-white font-semibold">
                      {publisherDetail.publisher.publisher_split}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Artists */}
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  Managed Artists ({publisherDetail.artists.length})
                </h4>
                {publisherDetail.artists.length === 0 ? (
                  <p className="text-gray-300">No artists managed</p>
                ) : (
                  <div className="space-y-3">
                    {publisherDetail.artists.map((artist) => (
                      <div key={artist.artist_id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-white font-semibold">{artist.stage_name}</h5>
                            <p className="text-gray-300 text-sm">{artist.name}</p>
                            <p className="text-gray-400 text-xs">
                              {artist.relationship_type} • {artist.royalty_split}% split
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">
                              {artist.track_count} tracks
                            </div>
                            <div className="text-green-400 text-sm">
                              {formatCurrency(artist.earnings)}
                            </div>
                            <div className="text-gray-400 text-xs">
                              Since {formatDate(artist.start_date)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agreements */}
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-purple-400" />
                  Publishing Agreements ({publisherDetail.agreements.length})
                </h4>
                {publisherDetail.agreements.length === 0 ? (
                  <p className="text-gray-300">No agreements found</p>
                ) : (
                  <div className="space-y-3">
                    {publisherDetail.agreements.map((agreement) => (
                      <div key={agreement.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-white font-semibold">{agreement.track_title}</h5>
                            <p className="text-gray-300 text-sm">by {agreement.artist_name}</p>
                            <p className="text-gray-400 text-xs">
                              Writer: {agreement.writer_share}% • Publisher: {agreement.publisher_share}%
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(agreement.status)}`}>
                              {agreement.status}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              {formatDate(agreement.agreement_date)}
                            </div>
                            {agreement.verified && (
                              <div className="text-green-400 text-xs">
                                ✓ Verified
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublisherDetailModal;