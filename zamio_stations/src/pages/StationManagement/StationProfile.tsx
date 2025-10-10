import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Link as LinkIcon, Bell, Mail, X, Settings, Loader2, Plus, Users, Shield, ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

type StationDetails = {
  station_id: string;
  name: string;
  phone?: string;
  city?: string;
  region?: string;
  country?: string;
  bio?: string;
  about?: string;
  photo?: string;
  stream_url?: string;
  stream_status?: string;
  stream_status_display?: string;
  last_monitored?: string;
  stream_validation_errors?: string;
};

const StationProfilePage = () => {
  const navigate = useNavigate();
  const stationId = useMemo(() => {
    try {
      return localStorage.getItem('station_id') || '';
    } catch {
      return '';
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [station, setStation] = useState<StationDetails | null>(null);
  const [editing, setEditing] = useState(false);
  const [prefs, setPrefs] = useState({ top10Updated: true, weeklyDigest: false });

  // Local edit buffer
  const [form, setForm] = useState<Partial<StationDetails>>({});
  // Stream URL state
  const [streamUrlEditing, setStreamUrlEditing] = useState(false);
  const [streamUrlForm, setStreamUrlForm] = useState('');
  const [streamUrlError, setStreamUrlError] = useState('');
  const [streamTesting, setStreamTesting] = useState(false);
  // Legacy stream links state (keeping for backward compatibility)
  type StreamLink = { id?: number; link: string; active?: boolean };
  const [links, setLinks] = useState<StreamLink[]>([]);
  const [linksOriginal, setLinksOriginal] = useState<StreamLink[]>([]);
  const [linksEditing, setLinksEditing] = useState(false);

  const loadStation = async () => {
    if (!stationId) {
      setError('Missing station_id in storage');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/stations/get-station-details/', {
        params: { station_id: stationId },
      });
      const data = res?.data?.data as StationDetails;
      setStation(data);
      // Seed edit form
      setForm({
        name: data?.name,
        phone: data?.phone,
        region: data?.region,
        country: data?.country,
        bio: data?.bio || data?.about,
        stream_url: data?.stream_url,
      });
      setStreamUrlForm(data?.stream_url || '');
    } catch (e: any) {
      setError(e?.response?.data?.errors ? JSON.stringify(e.response.data.errors) : 'Failed to load station');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const updateField = (key: keyof StationDetails, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const validateStreamUrl = (url: string): boolean => {
    if (!url) return true; // Optional field
    
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        setStreamUrlError('Stream URL must use HTTP or HTTPS protocol');
        return false;
      }
      setStreamUrlError('');
      return true;
    } catch {
      setStreamUrlError('Please enter a valid URL (e.g., https://stream.example.com/live)');
      return false;
    }
  };

  const handleStreamUrlSave = async () => {
    if (!station) return;
    
    if (!validateStreamUrl(streamUrlForm)) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.post('/api/stations/edit-station/', {
        station_id: station.station_id,
        stream_url: streamUrlForm || null,
      });

      await loadStation();
      setStreamUrlEditing(false);
    } catch (e: any) {
      setError(e?.response?.data?.errors ? JSON.stringify(e.response.data.errors) : 'Failed to save stream URL');
    } finally {
      setSaving(false);
    }
  };

  const testStreamUrl = async () => {
    if (!station || !streamUrlForm) return;
    
    setStreamTesting(true);
    setError(null);
    try {
      const response = await api.post('/api/stations/test-stream-url/', {
        station_id: station.station_id,
      });
      
      const testResult = response.data?.data;
      if (testResult?.stream_accessible) {
        setStreamUrlError('');
        alert(`Stream test successful: ${testResult.test_message}`);
      } else {
        setStreamUrlError(`Stream test failed: ${testResult?.test_message || 'Unknown error'}`);
      }
    } catch (e: any) {
      setStreamUrlError(e?.response?.data?.errors ? JSON.stringify(e.response.data.errors) : 'Failed to test stream URL');
    } finally {
      setStreamTesting(false);
    }
  };

  const handleStationSave = async () => {
    if (!station) return;
    setSaving(true);
    setError(null);
    try {
      // 1) Update basic station fields
      await api.post('/api/stations/edit-station/', {
        station_id: station.station_id,
        name: form.name,
        phone: form.phone,
        country: form.country,
        about: form.bio,
      });

      // 2) Update profile completion fields (region/bio/country)
      await api.post('/api/accounts/complete-station-profile/', {
        station_id: station.station_id,
        bio: form.bio,
        country: form.country,
        region: form.region,
      });

      await loadStation();
      setEditing(false);
    } catch (e: any) {
      setError(e?.response?.data?.errors ? JSON.stringify(e.response.data.errors) : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen  text-white p-6">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 space-y-8 border border-white/20">
        {/* 🛰 Station Info */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-300">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading station...
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-400/30 text-red-200 p-3 rounded">
            {error}
          </div>
        ) : station ? (
          <div className="flex justify-between items-start">
            <div className="flex space-x-3">
              <img
                src={station.photo || ''}
                alt="station logo"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20"
              />
              <div>
                <h1 className="text-3xl font-bold text-white">{station.name}</h1>
                <p className="text-gray-300 mt-1">
                  {(station.region || 'N/A')}
                  {station.country ? ` • ${station.country}` : ''}
                </p>
                <p className="text-gray-300 mt-1">Phone: {station.phone || 'N/A'}</p>
                <p className="text-gray-300 mt-1">Bio: {station.bio || station.about || '—'}</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="bg-white/10 text-white px-4 py-2 rounded-lg flex items-center hover:bg-white/20 transition"
            >
              <Edit className="w-5 h-5 mr-2" /> Edit Info
            </button>
          </div>
        ) : null}

        {/* ✏️ Edit Station Modal */}
        {editing && station && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-900 p-6 rounded-2xl max-w-md w-full border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Station Info</h2>
                <button onClick={() => setEditing(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4 text-gray-300">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 rounded-lg focus:outline-none border border-white/20"
                    value={form.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 rounded-lg focus:outline-none border border-white/20"
                    value={form.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Region</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 rounded-lg focus:outline-none border border-white/20"
                    value={form.region || ''}
                    onChange={(e) => updateField('region', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Country</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 rounded-lg focus:outline-none border border-white/20"
                    value={form.country || ''}
                    onChange={(e) => updateField('country', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Bio</label>
                  <textarea
                    className="w-full px-3 py-2 bg-white/10 rounded-lg focus:outline-none border border-white/20 min-h-24"
                    value={form.bio || ''}
                    onChange={(e) => updateField('bio', e.target.value)}
                  />
                </div>
                {error && (
                  <div className="bg-red-500/10 border border-red-400/30 text-red-200 p-2 rounded text-sm">{error}</div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={handleStationSave}
                  disabled={saving}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50 flex items-center"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔗 Stream URL */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <LinkIcon className="w-5 h-5 mr-2 text-blue-400" /> Live Stream URL
            </h2>
            <button onClick={() => setStreamUrlEditing(true)} className="text-blue-300 hover:text-white">
              {station?.stream_url ? 'Edit' : 'Add'}
            </button>
          </div>
          
          {station?.stream_url ? (
            <div className="space-y-3">
              <div className="px-3 py-2 bg-white/10 rounded-lg break-all text-gray-300">
                {station.stream_url}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    station.stream_status === 'active' ? 'bg-green-500/20 text-green-300' :
                    station.stream_status === 'testing' ? 'bg-yellow-500/20 text-yellow-300' :
                    station.stream_status === 'error' ? 'bg-red-500/20 text-red-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {station.stream_status_display || station.stream_status || 'Unknown'}
                  </span>
                </div>
                {station.last_monitored && (
                  <span className="text-gray-400">
                    Last monitored: {new Date(station.last_monitored).toLocaleString()}
                  </span>
                )}
              </div>
              {station.stream_validation_errors && (
                <div className="bg-red-500/10 border border-red-400/30 text-red-200 p-2 rounded text-sm">
                  {station.stream_validation_errors}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-300">No stream URL configured. Add one to enable audio monitoring for royalty tracking.</p>
          )}
        </div>

        {/* ✏️ Edit Stream URL Modal */}
        {streamUrlEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-900 p-6 rounded-2xl max-w-md w-full border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Stream URL</h2>
                <button onClick={() => setStreamUrlEditing(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4 text-gray-300">
                <div>
                  <label className="block text-sm mb-1">Live Stream URL</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 bg-white/10 rounded-lg focus:outline-none border border-white/20"
                    value={streamUrlForm}
                    onChange={(e) => {
                      setStreamUrlForm(e.target.value);
                      if (streamUrlError) {
                        validateStreamUrl(e.target.value);
                      }
                    }}
                    onBlur={() => validateStreamUrl(streamUrlForm)}
                    placeholder="https://stream.example.com/live"
                  />
                  {streamUrlError && (
                    <p className="text-red-300 text-sm mt-1">{streamUrlError}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-1">
                    Provide your live stream URL so we can monitor your broadcasts for royalty tracking
                  </p>
                </div>
                {error && (
                  <div className="bg-red-500/10 border border-red-400/30 text-red-200 p-2 rounded text-sm">{error}</div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                {streamUrlForm && (
                  <button
                    onClick={testStreamUrl}
                    disabled={streamTesting}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg disabled:opacity-50 flex items-center"
                  >
                    {streamTesting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Test URL
                  </button>
                )}
                <button onClick={() => setStreamUrlEditing(false)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={handleStreamUrlSave}
                  disabled={saving || !!streamUrlError}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 flex items-center"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔐 Account & Notifications */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/20 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-300" /> Account Settings
            </h2>
            <button className="text-gray-300 hover:text-white">Change Password</button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-yellow-300" />
              <span className="text-white">Top 10 Played Songs Updated</span>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 text-yellow-300"
              checked={prefs.top10Updated}
              onChange={() => setPrefs({ ...prefs, top10Updated: !prefs.top10Updated })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-green-300" />
              <span className="text-white">Weekly Digest</span>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 text-green-300"
              checked={prefs.weeklyDigest}
              onChange={() => setPrefs({ ...prefs, weeklyDigest: !prefs.weeklyDigest })}
            />
          </div>
        </div>

        {/* 🔗 Quick Actions */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/20">
          <h2 className="text-lg font-semibold text-white mb-4">Station Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/staff-management')}
              className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors group"
            >
              <div className="flex items-center">
                <Users className="w-6 h-6 text-blue-400 mr-3" />
                <div className="text-left">
                  <h3 className="text-white font-medium">Staff Management</h3>
                  <p className="text-gray-400 text-sm">Manage station staff and permissions</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
            
            <button
              onClick={() => navigate('/compliance')}
              className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors group"
            >
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-green-400 mr-3" />
                <div className="text-left">
                  <h3 className="text-white font-medium">Compliance & Verification</h3>
                  <p className="text-gray-400 text-sm">Manage regulatory compliance</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => navigate('/playlog-management')}
              className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors group"
            >
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-purple-400 mr-3" />
                <div className="text-left">
                  <h3 className="text-white font-medium">Playlog Management</h3>
                  <p className="text-gray-400 text-sm">Upload and compare playlogs</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* 💾 Save */}
        <div className="flex justify-end">
          <button onClick={() => setEditing(true)} className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationProfilePage;
