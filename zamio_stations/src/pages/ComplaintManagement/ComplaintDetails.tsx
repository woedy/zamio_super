import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  MessageSquare,
  Edit,
  Send
} from 'lucide-react';
import api from '../../lib/api';

interface Complaint {
  id: number;
  complaint_id: string;
  station: number;
  station_name: string;
  complainant: number;
  complainant_name: string;
  complainant_email: string;
  subject: string;
  description: string;
  complaint_type: string;
  complaint_type_display: string;
  priority: string;
  priority_display: string;
  status: string;
  status_display: string;
  assigned_to: number | null;
  assigned_to_name: string | null;
  resolution_notes: string | null;
  resolved_by: number | null;
  resolved_by_name: string | null;
  resolved_at: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
  updates_count: number;
}

interface ComplaintUpdate {
  id: number;
  complaint: number;
  user: number;
  user_name: string;
  update_type: string;
  update_type_display: string;
  message: string;
  old_status: string | null;
  new_status: string | null;
  created_at: string;
}

const ComplaintDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [updates, setUpdates] = useState<ComplaintUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newUpdate, setNewUpdate] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchComplaintDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await api.get(`api/stations/get-complaint-details/?complaint_id=${id}`);
      
      if (response.data.message === 'Successful') {
        setComplaint(response.data.data);
        setUpdates(response.data.data.updates || []);
        setStatusUpdate(response.data.data.status);
        setResolutionNotes(response.data.data.resolution_notes || '');
      }
    } catch (error) {
      console.error('Error fetching complaint details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!complaint || !statusUpdate) return;
    
    setUpdating(true);
    try {
      const response = await api.post('api/stations/update-complaint-status/', {
        complaint_id: complaint.id,
        status: statusUpdate,
        resolution_notes: resolutionNotes
      });
      
      if (response.data.message === 'Complaint status updated successfully') {
        await fetchComplaintDetails(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!complaint || !newUpdate.trim()) return;
    
    setUpdating(true);
    try {
      const response = await api.post('api/stations/add-complaint-update/', {
        complaint_id: complaint.id,
        message: newUpdate,
        update_type: 'comment'
      });
      
      if (response.data.message === 'Update added successfully') {
        setNewUpdate('');
        await fetchComplaintDetails(); // Refresh data
      }
    } catch (error) {
      console.error('Error adding update:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'investigating':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Complaint not found</p>
          <Link
            to="/complaints"
            className="mt-4 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Complaints</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/complaints"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                {getStatusIcon(complaint.status)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {complaint.complaint_id}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {complaint.subject}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(complaint.status)}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(complaint.status)}`}>
                {complaint.status_display}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Complaint Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <p className="text-gray-900 dark:text-white">{complaint.subject}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{complaint.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {complaint.complaint_type_display}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(complaint.priority)}`}>
                      {complaint.priority_display}
                    </span>
                  </div>
                </div>

                {complaint.contact_email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Email
                    </label>
                    <p className="text-gray-900 dark:text-white">{complaint.contact_email}</p>
                  </div>
                )}

                {complaint.contact_phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contact Phone
                    </label>
                    <p className="text-gray-900 dark:text-white">{complaint.contact_phone}</p>
                  </div>
                )}

                {complaint.resolution_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resolution Notes
                    </label>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{complaint.resolution_notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Update */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                Update Status
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {statusUpdate === 'resolved' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resolution Notes
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter resolution details..."
                    />
                  </div>
                )}

                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || statusUpdate === complaint.status}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Update Status</span>
                </button>
              </div>
            </div>

            {/* Add Update */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Add Update
              </h2>
              
              <div className="space-y-4">
                <textarea
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a comment or update..."
                />
                
                <button
                  onClick={handleAddUpdate}
                  disabled={updating || !newUpdate.trim()}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Add Update</span>
                </button>
              </div>
            </div>

            {/* Updates History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Updates History ({updates.length})
              </h2>
              
              {updates.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No updates yet
                </p>
              ) : (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {update.user_name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {update.update_type_display}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(update.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {update.message}
                      </p>
                      {update.old_status && update.new_status && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Status changed from <span className="font-medium">{update.old_status}</span> to <span className="font-medium">{update.new_status}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Complaint Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Complaint Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Complaint ID
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">
                    {complaint.complaint_id}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Station
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {complaint.station_name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Complainant
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {complaint.complainant_name}
                  </p>
                  {complaint.complainant_email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {complaint.complainant_email}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Created
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(complaint.created_at).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Updated
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(complaint.updated_at).toLocaleString()}
                  </p>
                </div>

                {complaint.assigned_to_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assigned To
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {complaint.assigned_to_name}
                    </p>
                  </div>
                )}

                {complaint.resolved_by_name && complaint.resolved_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Resolved By
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {complaint.resolved_by_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(complaint.resolved_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;