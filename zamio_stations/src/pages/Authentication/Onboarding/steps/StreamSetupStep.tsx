import React, { useState } from 'react';
import { Radio, Wifi, Settings, Play, Pause, Volume2, Monitor, CheckCircle, AlertTriangle } from 'lucide-react';

interface StreamSetupStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const StreamSetupStep: React.FC<StreamSetupStepProps> = ({ onNext, onPrevious }) => {
  const [formData, setFormData] = useState({
    primaryStreamUrl: '',
    backupStreamUrl: '',
    streamType: 'icecast',
    bitrate: '128',
    format: 'mp3',
    mountPoint: '/stream',
    username: '',
    password: '',
    enableMonitoring: true,
    monitoringInterval: '60',
    autoRestart: true,
    qualityCheck: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const streamTypes = [
    { value: 'icecast', label: 'Icecast/Shoutcast' },
    { value: 'hls', label: 'HLS (HTTP Live Streaming)' },
    { value: 'dash', label: 'DASH (Dynamic Adaptive Streaming)' },
    { value: 'rtmp', label: 'RTMP (Real-Time Messaging Protocol)' }
  ];

  const bitrates = [
    { value: '64', label: '64 kbps (Low Quality)' },
    { value: '128', label: '128 kbps (Standard Quality)' },
    { value: '256', label: '256 kbps (High Quality)' },
    { value: '320', label: '320 kbps (Studio Quality)' }
  ];

  const formats = [
    { value: 'mp3', label: 'MP3' },
    { value: 'aac', label: 'AAC' },
    { value: 'ogg', label: 'OGG Vorbis' },
    { value: 'opus', label: 'Opus' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.primaryStreamUrl.trim()) {
      newErrors.primaryStreamUrl = 'Primary stream URL is required';
    } else if (!formData.primaryStreamUrl.startsWith('http')) {
      newErrors.primaryStreamUrl = 'Please enter a valid URL starting with http:// or https://';
    }

    if (formData.backupStreamUrl && !formData.backupStreamUrl.startsWith('http')) {
      newErrors.backupStreamUrl = 'Please enter a valid backup URL';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required for stream authentication';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required for stream authentication';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestStream = async () => {
    if (!validateForm()) return;

    setIsTesting(true);
    setTestStatus('idle');

    // Simulate stream testing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Demo: Random success/failure for testing
    const success = Math.random() > 0.3;
    setTestStatus(success ? 'success' : 'error');
    setIsTesting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm() && testStatus === 'success') {
      // Demo: Log the form data
      console.log('Stream configuration:', formData);
      onNext();
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-semibold text-white mb-4">
          Stream Configuration
        </h3>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Set up your audio streams for comprehensive monitoring and reporting. Zamio will track your broadcasts for music detection and royalty calculation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Stream URLs */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Stream Information</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="primaryStreamUrl" className="block text-sm font-medium text-slate-200 mb-2">
                Primary Stream URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="primaryStreamUrl"
                  name="primaryStreamUrl"
                  value={formData.primaryStreamUrl}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border pl-10 pr-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    errors.primaryStreamUrl
                      ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                  }`}
                  placeholder="https://your-station.com:8000/stream"
                />
                <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {errors.primaryStreamUrl && <p className="text-red-400 text-sm mt-1">{errors.primaryStreamUrl}</p>}
              <p className="text-xs text-slate-400 mt-2">
                Your main streaming URL that listeners connect to
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="backupStreamUrl" className="block text-sm font-medium text-slate-200 mb-2">
                Backup Stream URL (Optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="backupStreamUrl"
                  name="backupStreamUrl"
                  value={formData.backupStreamUrl}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border pl-10 pr-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    errors.backupStreamUrl
                      ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                  }`}
                  placeholder="https://backup.your-station.com:8000/stream"
                />
                <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {errors.backupStreamUrl && <p className="text-red-400 text-sm mt-1">{errors.backupStreamUrl}</p>}
              <p className="text-xs text-slate-400 mt-2">
                Alternative stream URL for redundancy (optional)
              </p>
            </div>

            <div>
              <label htmlFor="streamType" className="block text-sm font-medium text-slate-200 mb-2">
                Stream Type
              </label>
              <select
                id="streamType"
                name="streamType"
                value={formData.streamType}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {streamTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bitrate" className="block text-sm font-medium text-slate-200 mb-2">
                Bitrate
              </label>
              <select
                id="bitrate"
                name="bitrate"
                value={formData.bitrate}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {bitrates.map((rate) => (
                  <option key={rate.value} value={rate.value}>{rate.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="format" className="block text-sm font-medium text-slate-200 mb-2">
                Audio Format
              </label>
              <select
                id="format"
                name="format"
                value={formData.format}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {formats.map((format) => (
                  <option key={format.value} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="mountPoint" className="block text-sm font-medium text-slate-200 mb-2">
                Mount Point
              </label>
              <input
                type="text"
                id="mountPoint"
                name="mountPoint"
                value={formData.mountPoint}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="/stream"
              />
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Stream Authentication</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.username
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
                placeholder="Stream username"
              />
              {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.password
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
                placeholder="Stream password"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>
          </div>
        </div>

        {/* Monitoring Settings */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Monitoring Configuration</h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-indigo-400" />
                <div>
                  <label htmlFor="enableMonitoring" className="text-slate-200 font-medium">
                    Enable Continuous Monitoring
                  </label>
                  <p className="text-sm text-slate-400">
                    Monitor your stream 24/7 for music detection and airplay tracking
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="enableMonitoring"
                name="enableMonitoring"
                checked={formData.enableMonitoring}
                onChange={handleInputChange}
                className="rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-400"
              />
            </div>

            {formData.enableMonitoring && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="monitoringInterval" className="block text-sm font-medium text-slate-200 mb-2">
                      Monitoring Interval (seconds)
                    </label>
                    <select
                      id="monitoringInterval"
                      name="monitoringInterval"
                      value={formData.monitoringInterval}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-white/20 bg-slate-800/50 px-4 py-3 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                      <option value="30">30 seconds (High frequency)</option>
                      <option value="60">60 seconds (Standard)</option>
                      <option value="120">2 minutes (Conservative)</option>
                      <option value="300">5 minutes (Minimal impact)</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoRestart"
                      name="autoRestart"
                      checked={formData.autoRestart}
                      onChange={handleInputChange}
                      className="rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-400"
                    />
                    <div>
                      <label htmlFor="autoRestart" className="text-slate-200 font-medium">
                        Auto-restart on failure
                      </label>
                      <p className="text-sm text-slate-400">
                        Automatically restart monitoring if connection fails
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="qualityCheck"
                    name="qualityCheck"
                    checked={formData.qualityCheck}
                    onChange={handleInputChange}
                    className="rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-400"
                  />
                  <div>
                    <label htmlFor="qualityCheck" className="text-slate-200 font-medium">
                      Audio Quality Monitoring
                    </label>
                    <p className="text-sm text-slate-400">
                      Monitor audio quality and detect stream interruptions
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stream Testing */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8">
          <h4 className="text-xl font-semibold text-white mb-6">Stream Testing</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                testStatus === 'success' ? 'bg-green-500/20 text-green-400' :
                testStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-slate-700 text-slate-400'
              }`}>
                {testStatus === 'success' ? <CheckCircle className="w-5 h-5" /> :
                 testStatus === 'error' ? <AlertTriangle className="w-5 h-5" /> :
                 <Volume2 className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-slate-200 font-medium">
                  {testStatus === 'success' ? 'Stream connection successful!' :
                   testStatus === 'error' ? 'Stream connection failed' :
                   'Test your stream configuration'}
                </p>
                <p className="text-sm text-slate-400">
                  {testStatus === 'success' ? 'Your stream is accessible and properly configured' :
                   testStatus === 'error' ? 'Please check your stream URL and credentials' :
                   'Verify that your stream URL and authentication are working'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestStream}
              disabled={isTesting || !formData.primaryStreamUrl}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                isTesting
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : testStatus === 'success'
                    ? 'bg-green-500 hover:bg-green-400 text-white'
                    : testStatus === 'error'
                      ? 'bg-red-500 hover:bg-red-400 text-white'
                      : 'bg-indigo-500 hover:bg-indigo-400 text-white'
              }`}
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Test Stream</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Technical Requirements */}
        <div className="bg-indigo-500/10 border border-indigo-400/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h5 className="font-medium text-indigo-300">Technical Requirements</h5>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-300 mb-2"><strong>Supported Formats:</strong></p>
              <ul className="text-slate-400 space-y-1">
                <li>• MP3 (recommended for compatibility)</li>
                <li>• AAC (better quality, smaller files)</li>
                <li>• OGG Vorbis (open source)</li>
                <li>• Opus (high efficiency)</li>
              </ul>
            </div>
            <div>
              <p className="text-slate-300 mb-2"><strong>Network Requirements:</strong></p>
              <ul className="text-slate-400 space-y-1">
                <li>• Publicly accessible stream URL</li>
                <li>• Stable internet connection</li>
                <li>• Minimum 64 kbps bitrate</li>
                <li>• Continuous availability</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Previous
          </button>
          <button
            type="submit"
            disabled={testStatus !== 'success'}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {testStatus === 'success' ? 'Continue to Staff Setup' : 'Test Stream First'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StreamSetupStep;
