import React from 'react';
import { Building2, Users, Music, TrendingUp, MapPin, DollarSign, CheckCircle, Clock } from 'lucide-react';

export interface PublisherCardData {
  publisher_id: string;
  company_name: string;
  verified: boolean;
  artist_count: number;
  agreement_count: number;
  total_tracks: number;
  total_earnings: number;
  total_plays: number;
  recent_plays: number;
  region?: string;
  country?: string;
  created_at: string;
  user: {
    name: string;
    email: string;
    photo?: string;
  };
}

interface PublisherCardProps {
  publisher: PublisherCardData;
  onClick?: (publisher: PublisherCardData) => void;
  className?: string;
  showMetrics?: boolean;
  compact?: boolean;
}

export const PublisherCard: React.FC<PublisherCardProps> = ({
  publisher,
  onClick,
  className = '',
  showMetrics = true,
  compact = false
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(publisher);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (compact) {
    return (
      <div
        className={`bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer ${className}`}
        onClick={handleClick}
      >
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-semibold truncate">
                {publisher.company_name || publisher.user.name}
              </h3>
              {publisher.verified && (
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-gray-300 text-sm">
              {publisher.artist_count} artists • {publisher.total_tracks} tracks
            </p>
          </div>
          <div className="text-right">
            <div className="text-white font-semibold">
              {formatCurrency(publisher.total_earnings)}
            </div>
            <div className="text-gray-300 text-xs">
              {publisher.total_plays.toLocaleString()} plays
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-white">
                {publisher.company_name || publisher.user.name}
              </h3>
              {publisher.verified && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>
            <p className="text-gray-300 text-sm">{publisher.user.email}</p>
          </div>
        </div>
        {publisher.user.photo && (
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
            <img
              src={publisher.user.photo}
              alt={publisher.user.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Location */}
      {(publisher.region || publisher.country) && (
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm">
            {publisher.region && publisher.country 
              ? `${publisher.region}, ${publisher.country}`
              : publisher.region || publisher.country
            }
          </span>
        </div>
      )}

      {/* Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300 text-sm">Artists</span>
            </div>
            <div className="text-white font-semibold">{publisher.artist_count}</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Music className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300 text-sm">Tracks</span>
            </div>
            <div className="text-white font-semibold">{publisher.total_tracks}</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm">Earnings</span>
            </div>
            <div className="text-white font-semibold">
              {formatCurrency(publisher.total_earnings)}
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-gray-300 text-sm">Total Plays</span>
            </div>
            <div className="text-white font-semibold">
              {publisher.total_plays.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">
            Joined {formatDate(publisher.created_at)}
          </span>
        </div>
        {publisher.recent_plays > 0 && (
          <div className="text-green-400">
            +{publisher.recent_plays} plays (30d)
          </div>
        )}
      </div>
    </div>
  );
};

export default PublisherCard;