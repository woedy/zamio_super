import { useEffect, useState } from 'react';
import { Clock, User, Edit3 } from 'lucide-react';
import { baseUrl, userToken } from '../constants';

interface EditHistoryProps {
  resourceType: 'track' | 'album';
  resourceId: string;
  title?: string;
}

interface EditRecord {
  id: number;
  user_name: string;
  changed_fields: string[];
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  edit_reason: string;
  created_at: string;
}

export default function EditHistory({ resourceType, resourceId, title }: EditHistoryProps) {
  const [editHistory, setEditHistory] = useState<EditRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (resourceId && isExpanded) {
      fetchEditHistory();
    }
  }, [resourceId, isExpanded]);

  const fetchEditHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = resourceType === 'track' 
        ? `get-track-edit-history/?track_id=${encodeURIComponent(resourceId)}`
        : `get-album-edit-history/?album_id=${encodeURIComponent(resourceId)}`;
      
      const response = await fetch(`${baseUrl}api/artists/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch edit history');
      }

      const data = await response.json();
      setEditHistory(data.data.edit_history || []);
    } catch (error) {
      console.error('Error fetching edit history:', error);
      setError('Failed to load edit history');
    } finally {
      setLoading(false);
    }
  };

  const formatFieldName = (field: string) => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'None';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isExpanded) {
    return (
      <div className="bg-boxdark rounded-lg p-4">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center text-emerald-300 hover:text-emerald-200 transition-colors"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          View Edit History
        </button>
      </div>
    );
  }

  return (
    <div className="bg-boxdark rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-emerald-300 flex items-center">
          <Edit3 className="w-5 h-5 mr-2" />
          Edit History {title && `- ${title}`}
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Hide
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
          <p className="text-gray-400">Loading edit history...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && editHistory.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Edit3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No edit history available</p>
          <p className="text-sm">Changes will appear here after the first edit</p>
        </div>
      )}

      {!loading && !error && editHistory.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {editHistory.map((edit) => (
            <div key={edit.id} className="border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-sm text-gray-300">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium">{edit.user_name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(edit.created_at)}
                </div>
              </div>

              {edit.edit_reason && (
                <div className="mb-3">
                  <p className="text-sm text-gray-300">
                    <strong>Reason:</strong> {edit.edit_reason}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-emerald-300">
                  Changed Fields: {edit.changed_fields.join(', ')}
                </p>
                
                {edit.changed_fields.map((field) => (
                  <div key={field} className="bg-gray-800 rounded p-3">
                    <p className="text-sm font-medium text-gray-200 mb-1">
                      {formatFieldName(field)}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-red-400 font-medium">From:</span>
                        <span className="ml-2 text-gray-300">
                          {formatValue(edit.old_values[field])}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-400 font-medium">To:</span>
                        <span className="ml-2 text-gray-300">
                          {formatValue(edit.new_values[field])}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}