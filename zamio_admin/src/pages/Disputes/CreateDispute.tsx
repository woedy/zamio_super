import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import { disputeService, DisputeChoices } from '../../services/disputeService';

export default function CreateDispute() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dispute_type: '',
    priority: 'medium',
    related_track: '',
    related_detection: '',
    related_royalty: '',
    related_station: '',
    metadata: {},
  });
  
  const [choices, setChoices] = useState<DisputeChoices | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const choicesData = await disputeService.getChoices();
        setChoices(choicesData);
      } catch (err) {
        console.error('Failed to load choices:', err);
      }
    };
    
    fetchChoices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.dispute_type) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const disputeData = {
        title: formData.title,
        description: formData.description,
        dispute_type: formData.dispute_type,
        priority: formData.priority,
        ...(formData.related_track && { related_track: parseInt(formData.related_track) }),
        ...(formData.related_detection && { related_detection: parseInt(formData.related_detection) }),
        ...(formData.related_royalty && { related_royalty: parseInt(formData.related_royalty) }),
        ...(formData.related_station && { related_station: parseInt(formData.related_station) }),
        metadata: formData.metadata,
      };

      const newDispute = await disputeService.createDispute(disputeData);
      navigate(`/disputes/${newDispute.dispute_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dispute');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/disputes"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Create New Dispute</h1>
              <p className="text-gray-300 text-sm">Submit a new dispute for resolution</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description of the dispute"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dispute Type *
                </label>
                <select
                  value={formData.dispute_type}
                  onChange={(e) => handleInputChange('dispute_type', e.target.value)}
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select dispute type...</option>
                  {choices?.dispute_types.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {choices?.dispute_priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={6}
                  placeholder="Detailed description of the dispute, including relevant context and what resolution you're seeking..."
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-6">Related Objects (Optional)</h3>
            <p className="text-sm text-gray-400 mb-4">
              Link this dispute to specific tracks, detections, royalty distributions, or stations for context.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Related Track ID
                </label>
                <input
                  type="number"
                  value={formData.related_track}
                  onChange={(e) => handleInputChange('related_track', e.target.value)}
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Track ID (if applicable)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Related Detection ID
                </label>
                <input
                  type="number"
                  value={formData.related_detection}
                  onChange={(e) => handleInputChange('related_detection', e.target.value)}
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Detection ID (if applicable)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Related Royalty ID
                </label>
                <input
                  type="number"
                  value={formData.related_royalty}
                  onChange={(e) => handleInputChange('related_royalty', e.target.value)}
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Royalty Distribution ID (if applicable)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Related Station ID
                </label>
                <input
                  type="number"
                  value={formData.related_station}
                  onChange={(e) => handleInputChange('related_station', e.target.value)}
                  className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Station ID (if applicable)"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              to="/disputes"
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {loading ? 'Creating...' : 'Create Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}