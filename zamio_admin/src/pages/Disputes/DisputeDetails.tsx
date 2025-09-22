import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, User, Calendar, FileText, MessageSquare,
  Upload, Send, AlertCircle, CheckCircle, XCircle, ArrowUpDown,
  Paperclip, ExternalLink, Download, UserCheck, Settings
} from 'lucide-react';
import { disputeService, Dispute } from '../../services/disputeService';

export default function DisputeDetails() {
  const { disputeId } = useParams<{ disputeId: string }>();
  
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'comments' | 'timeline'>('overview');

  const fetchDispute = useCallback(async () => {
    if (!disputeId) return;
    
    setLoading(true);
    setError(null);
    try {
      const disputeData = await disputeService.getDispute(disputeId);
      setDispute(disputeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dispute');
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    fetchDispute();
  }, [fetchDispute]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'under_review':
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'escalated':
        return <ArrowUpDown className="w-5 h-5 text-orange-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'under_review':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'escalated':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dispute details...</p>
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Dispute</h2>
          <p className="text-gray-300 mb-4">{error || 'Dispute not found'}</p>
          <Link
            to="/disputes"
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Back to Disputes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                to="/disputes"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{dispute.title}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-400">
                    ID: {dispute.dispute_id.slice(0, 8)}...
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(dispute.status)}`}>
                    {getStatusIcon(dispute.status)}
                    {dispute.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-400">
                    {dispute.days_open} days open
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'evidence', label: `Evidence (${dispute.evidence?.length || 0})`, icon: Paperclip },
              { id: 'comments', label: `Comments (${dispute.comments?.length || 0})`, icon: MessageSquare },
              { id: 'timeline', label: 'Timeline', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{dispute.description}</p>
                </div>

                {/* Related Objects */}
                {(dispute.related_track_info || dispute.related_station_info) && (
                  <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                    <h3 className="text-lg font-semibold mb-4">Related Objects</h3>
                    <div className="space-y-3">
                      {dispute.related_track_info && (
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-400" />
                          <div>
                            <div className="font-medium">Track: {dispute.related_track_info.title}</div>
                            <div className="text-sm text-gray-400">Artist: {dispute.related_track_info.artist}</div>
                          </div>
                        </div>
                      )}
                      {dispute.related_station_info && (
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <FileText className="w-5 h-5 text-green-400" />
                          <div>
                            <div className="font-medium">Station: {dispute.related_station_info.name}</div>
                            <div className="text-sm text-gray-400">Location: {dispute.related_station_info.location}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'evidence' && (
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-4">Evidence</h3>
                <div className="space-y-4">
                  {dispute.evidence?.map((evidence) => (
                    <div key={evidence.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{evidence.title}</h4>
                        {evidence.file_url && (
                          <a
                            href={evidence.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        By {evidence.uploaded_by.username} on {formatDate(evidence.uploaded_at)}
                      </div>
                      {evidence.description && (
                        <p className="text-gray-300 mb-2">{evidence.description}</p>
                      )}
                      {evidence.text_content && (
                        <div className="bg-white/5 rounded p-2 text-sm">
                          <pre className="whitespace-pre-wrap">{evidence.text_content}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!dispute.evidence || dispute.evidence.length === 0) && (
                    <div className="text-center py-8 text-gray-400">
                      No evidence has been added to this dispute yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-4">Comments</h3>
                <div className="space-y-4">
                  {dispute.comments?.map((comment) => (
                    <div key={comment.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-6 h-6 text-gray-400" />
                          <div>
                            <div className="font-medium">{comment.author.username}</div>
                            <div className="text-sm text-gray-400">{formatDate(comment.created_at)}</div>
                          </div>
                        </div>
                        {comment.is_internal && (
                          <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                            Internal
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                  {(!dispute.comments || dispute.comments.length === 0) && (
                    <div className="text-center py-8 text-gray-400">
                      No comments have been added to this dispute yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-6">Dispute Timeline</h3>
                <div className="space-y-4">
                  {dispute.timeline?.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        {event.type === 'audit_log' && <Settings className="w-4 h-4 text-purple-400" />}
                        {event.type === 'comment' && <MessageSquare className="w-4 h-4 text-blue-400" />}
                        {event.type === 'evidence' && <Paperclip className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{event.actor}</span>
                          <span className="text-sm text-gray-400">{event.action.replace('_', ' ')}</span>
                          <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{event.description}</p>
                      </div>
                    </div>
                  ))}
                  {(!dispute.timeline || dispute.timeline.length === 0) && (
                    <div className="text-center py-8 text-gray-400">
                      No timeline events available.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dispute Info */}
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Dispute Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Type</label>
                  <div className="font-medium capitalize">{dispute.dispute_type.replace('_', ' ')}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Priority</label>
                  <div className="font-medium capitalize">{dispute.priority}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Created</label>
                  <div className="font-medium">{formatDate(dispute.created_at)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Last Updated</label>
                  <div className="font-medium">{formatDate(dispute.updated_at)}</div>
                </div>
                {dispute.resolved_at && (
                  <div>
                    <label className="text-sm text-gray-400">Resolved</label>
                    <div className="font-medium">{formatDate(dispute.resolved_at)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Parties */}
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Parties Involved</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Submitted By</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{dispute.submitted_by.username}</div>
                      <div className="text-sm text-gray-400">{dispute.submitted_by.user_type}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Assigned To</label>
                  {dispute.assigned_to ? (
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{dispute.assigned_to.username}</div>
                        <div className="text-sm text-gray-400">{dispute.assigned_to.user_type}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic mt-1">Unassigned</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}