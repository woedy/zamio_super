import React, { useEffect, useState } from 'react';
import { Building2, TrendingUp, Eye, Users, MapPin, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { publisherService, PublisherMetrics } from '../../services/publisherService';

interface PublisherCardProps {
  publisher: {
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
  };
  onClick?: () => void;
}

const PublisherCard: React.FC<PublisherCardProps> = ({ publisher, onClick }) => {
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3 mb-3">
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
          <p className="text-gray-300 text-sm">{publisher.user.email}</p>
        </div>
      </div>

      {/* Location */}
      {(publisher.region || publisher.country) && (
        <div className="flex items-center space-x-2 mb-3">
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
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/5 rounded p-2">
          <div className="flex items-center space-x-1 mb-1">
            <Users className="w-3 h-3 text-blue-400" />
            <span className="text-gray-300 text-xs">Artists</span>
          </div>
          <div className="text-white text-sm font-semibold">{publisher.artist_count}</div>
        </div>
        
        <div className="bg-white/5 rounded p-2">
          <div className="flex items-center space-x-1 mb-1">
            <DollarSign className="w-3 h-3 text-green-400" />
            <span className="text-gray-300 text-xs">Earnings</span>
          </div>
          <div className="text-white text-sm font-semibold">
            {formatCurrency(publisher.total_earnings)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-gray-300">
            {formatDate(publisher.created_at)}
          </span>
        </div>
        <div className="text-gray-300">
          {publisher.total_plays.toLocaleString()} plays
        </div>
      </div>
    </div>
  );
};

interface PublisherNetworkSectionProps {
  maxPublishers?: number;
  showAnalytics?: boolean;
}

export const PublisherNetworkSection: React.FC<PublisherNetworkSectionProps> = ({
  maxPublishers = 6,
  showAnalytics = true
}) => {
  const [publisherData, setPublisherData] = useState<PublisherMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublisherData = async () => {
      try {
        setLoading(true);
        const data = await publisherService.getPublisherMetrics();
        setPublisherData(data);
      } catch (err) {
        console.error('Error fetching publisher data:', err);
        setError('Failed to load publisher network data');
      } finally {
        setLoading(false);
      }
    };

    fetchPublisherData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-300">Loading publisher network...</div>
        </div>
      </div>
    );
  }

  if (error || !publisherData) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-center h-32">
          <div className="text-red-400">{error || 'No publisher network data available'}</div>
        </div>
      </div>
    );
  }

  const displayedPublishers = publisherData.publishers.slice(0, maxPublishers);

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">
                  {publisherData.total_publishers}
                </div>
                <div className="text-sm text-gray-300">Publisher Network</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">
                  {publisherData.total_verified}
                </div>
                <div className="text-sm text-gray-300">Verified Publishers</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">
                  {publisherData.total_artists_managed}
                </div>
                <div className="text-sm text-gray-300">Total Artists</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">
                  {publisherData.total_agreements}
                </div>
                <div className="text-sm text-gray-300">Active Agreements</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publisher Network Cards */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-400" />
            Publisher Network
          </h2>
          {publisherData.publishers.length > maxPublishers && (
            <button className="text-sm text-gray-300 hover:text-white flex items-center">
              View All <Eye className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>

        {displayedPublishers.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No other publishers in network</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedPublishers.map((publisher) => (
              <PublisherCard
                key={publisher.publisher_id}
                publisher={publisher}
                onClick={() => {
                  console.log('Publisher clicked:', publisher);
                  // TODO: Navigate to publisher detail view or collaboration
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublisherNetworkSection;