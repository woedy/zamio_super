import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  ExternalLink
} from 'lucide-react';
import { userManagementService, UserDetails } from '../../../services/userManagementService';
import { fireToast } from '../../../hooks/fireToast';

interface UserDetailsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ userId, isOpen, onClose }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'kyc' | 'activity' | 'permissions'>('overview');

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetails();
    }
  }, [isOpen, userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      const details = await userManagementService.getUserDetails(userId);
      setUserDetails(details);
    } catch (error) {
      console.error('Failed to load user details:', error);
      fireToast('Failed to load user details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadKycDocument = (documentUrl: string, documentName: string) => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            User Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : userDetails ? (
          <div className="flex flex-col h-full">
            {/* User Header */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {userDetails.photo_url ? (
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={userDetails.photo_url}
                      alt=""
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userDetails.first_name} {userDetails.last_name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{userDetails.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userManagementService.getUserTypeColor(userDetails.user_type)}`}>
                      {userDetails.user_type}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userManagementService.getKycStatusColor(userDetails.kyc_status)}`}>
                      KYC: {userDetails.kyc_status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userManagementService.getAccountStatusColor(userDetails.is_active)}`}>
                      {userDetails.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'kyc', label: 'KYC Documents', icon: Shield },
                  { id: 'activity', label: 'Recent Activity', icon: Activity },
                  { id: 'permissions', label: 'Permissions', icon: FileText }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Basic Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {userDetails.email}
                          </span>
                        </div>
                        {userDetails.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-3" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {userDetails.phone}
                            </span>
                          </div>
                        )}
                        {userDetails.country && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {userDetails.country}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Joined {userManagementService.formatDate(userDetails.timestamp)}
                          </span>
                        </div>
                        {userDetails.last_activity && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-3" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Last active {userManagementService.formatDate(userDetails.last_activity)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Account Status
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
                          {userDetails.email_verified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Profile Complete</span>
                          {userDetails.profile_complete ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Two-Factor Auth</span>
                          {userDetails.two_factor_enabled ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        {userDetails.failed_login_attempts > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Failed Login Attempts</span>
                            <span className="text-sm font-medium text-red-600">
                              {userDetails.failed_login_attempts}
                            </span>
                          </div>
                        )}
                        {userDetails.account_locked_until && (
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-sm text-red-600">
                              Account locked until {userManagementService.formatDate(userDetails.account_locked_until)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Type-specific Information */}
                  {userDetails.artist_profile && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Artist Profile
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Stage Name:</span>
                          <p className="font-medium">{userDetails.artist_profile.stage_name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Self Published:</span>
                          <p className="font-medium">{userDetails.artist_profile.self_published ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Tracks:</span>
                          <p className="font-medium">{userDetails.artist_profile.total_tracks}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Earnings:</span>
                          <p className="font-medium">GHS {userDetails.artist_profile.total_earnings.toFixed(2)}</p>
                        </div>
                      </div>
                      {userDetails.artist_profile.bio && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Bio:</span>
                          <p className="text-sm mt-1">{userDetails.artist_profile.bio}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {userDetails.publisher_profile && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Publisher Profile
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Company Name:</span>
                          <p className="font-medium">{userDetails.publisher_profile.company_name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Verified:</span>
                          <p className="font-medium">{userDetails.publisher_profile.verified ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Artists:</span>
                          <p className="font-medium">{userDetails.publisher_profile.total_artists}</p>
                        </div>
                        {userDetails.publisher_profile.website && (
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Website:</span>
                            <a 
                              href={userDetails.publisher_profile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              {userDetails.publisher_profile.website}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {userDetails.station_profile && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Station Profile
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Station Name:</span>
                          <p className="font-medium">{userDetails.station_profile.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Frequency:</span>
                          <p className="font-medium">{userDetails.station_profile.frequency}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">City:</span>
                          <p className="font-medium">{userDetails.station_profile.city}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Region:</span>
                          <p className="font-medium">{userDetails.station_profile.region}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Compliance Status:</span>
                          <p className="font-medium capitalize">{userDetails.station_profile.compliance_status}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'kyc' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      KYC Documents
                    </h4>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${userManagementService.getKycStatusColor(userDetails.kyc_status)}`}>
                      {userDetails.kyc_status}
                    </span>
                  </div>

                  {userDetails.kyc_documents && Object.keys(userDetails.kyc_documents).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(userDetails.kyc_documents).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white capitalize">
                                {key.replace(/_/g, ' ')}
                              </h5>
                              {typeof value === 'object' && value !== null ? (
                                <div className="mt-2 space-y-1">
                                  {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                                    <div key={subKey} className="text-sm text-gray-600 dark:text-gray-400">
                                      <span className="font-medium capitalize">{subKey.replace(/_/g, ' ')}:</span>{' '}
                                      {typeof subValue === 'string' && subValue.startsWith('http') ? (
                                        <a 
                                          href={subValue}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 flex items-center inline-flex"
                                        >
                                          View Document
                                          <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                      ) : (
                                        String(subValue)
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {String(value)}
                                </p>
                              )}
                            </div>
                            {typeof value === 'string' && value.startsWith('http') && (
                              <button
                                onClick={() => downloadKycDocument(value, `${key}_${userDetails.first_name}_${userDetails.last_name}`)}
                                className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No KYC documents uploaded</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Recent Activity
                  </h4>

                  {userDetails.recent_activity && userDetails.recent_activity.length > 0 ? (
                    <div className="space-y-4">
                      {userDetails.recent_activity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex-shrink-0">
                            <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {userManagementService.formatDate(activity.timestamp)}
                              </span>
                            </div>
                            {activity.resource_type && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Resource: {activity.resource_type}
                                {activity.resource_id && ` (${activity.resource_id})`}
                              </p>
                            )}
                            {activity.ip_address && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                IP: {activity.ip_address}
                              </p>
                            )}
                            {activity.status_code && (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                                activity.status_code >= 200 && activity.status_code < 300
                                  ? 'bg-green-100 text-green-800'
                                  : activity.status_code >= 400
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.status_code}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    User Permissions
                  </h4>

                  {userDetails.permissions && userDetails.permissions.length > 0 ? (
                    <div className="space-y-4">
                      {userDetails.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {permission.permission}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Granted by {permission.granted_by} on {userManagementService.formatDate(permission.granted_at)}
                            </p>
                            {permission.expires_at && (
                              <p className="text-xs text-orange-600">
                                Expires: {userManagementService.formatDate(permission.expires_at)}
                              </p>
                            )}
                          </div>
                          <Shield className="h-5 w-5 text-green-500" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No special permissions assigned</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Failed to load user details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsModal;