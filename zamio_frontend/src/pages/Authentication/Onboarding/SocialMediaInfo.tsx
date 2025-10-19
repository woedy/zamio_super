import React, { useState } from 'react';
import { Instagram, Twitter, Facebook, Youtube, CheckCircle, ExternalLink, Unlink } from 'lucide-react';
import { OnboardingStepProps } from '../../../components/onboarding/OnboardingWizard';

interface SocialAccount {
  platform: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  connected: boolean;
  username?: string;
  verified?: boolean;
  followers?: number;
}

const SocialMediaStep: React.FC<OnboardingStepProps> = ({ onNext, onPrevious, onSkip }) => {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    {
      platform: 'Instagram',
      icon: Instagram,
      color: 'text-pink-400',
      connected: false,
      verified: false,
      followers: 0
    },
    {
      platform: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      connected: false,
      verified: false,
      followers: 0
    },
    {
      platform: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      connected: false,
      verified: false,
      followers: 0
    },
    {
      platform: 'YouTube',
      icon: Youtube,
      color: 'text-red-500',
      connected: false,
      verified: false,
      followers: 0
    }
  ]);

  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (platform: string) => {
    setConnecting(platform);

    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));

    setSocialAccounts(prev => prev.map(account =>
      account.platform === platform
        ? {
            ...account,
            connected: true,
            username: `@${platform.toLowerCase()}user`,
            followers: Math.floor(Math.random() * 50000) + 1000,
            verified: Math.random() > 0.7 // 30% chance of being verified
          }
        : account
    ));

    setConnecting(null);
  };

  const handleDisconnect = (platform: string) => {
    setSocialAccounts(prev => prev.map(account =>
      account.platform === platform
        ? { ...account, connected: false, username: undefined, verified: false, followers: 0 }
        : account
    ));
  };

  const connectedCount = socialAccounts.filter(account => account.connected).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Connect Your Social Media</h2>
        <p className="text-slate-300">
          Link your social media accounts to enhance your artist profile and reach more fans.
        </p>
      </div>

      {/* Connection Summary */}
      <div className="mb-8 p-4 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-indigo-300">Social Media Connections</h3>
            <p className="text-sm text-indigo-200">
              {connectedCount} of {socialAccounts.length} platforms connected
            </p>
          </div>
          {connectedCount > 0 && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-400 font-medium">
                {connectedCount} connected
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {socialAccounts.map((account) => {
          const IconComponent = account.icon;
          const isConnecting = connecting === account.platform;

          return (
            <div key={account.platform} className="border border-white/10 rounded-lg p-6 bg-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-slate-700/50 ${account.connected ? 'ring-2 ring-indigo-400/50' : ''}`}>
                    <IconComponent className={`w-6 h-6 ${account.connected ? account.color : 'text-slate-400'}`} />
                  </div>

                  <div>
                    <h3 className="font-medium text-white">{account.platform}</h3>
                    {account.connected ? (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-slate-300">{account.username}</span>
                        {account.verified && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-blue-400">Verified</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Not connected</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {account.connected && account.followers && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {account.followers.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">followers</p>
                    </div>
                  )}

                  {account.connected ? (
                    <button
                      onClick={() => handleDisconnect(account.platform)}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 border border-red-400/50 text-red-400 hover:bg-red-400/10 rounded-lg text-sm transition-colors"
                    >
                      <Unlink className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(account.platform)}
                      disabled={isConnecting === account.platform}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 text-white rounded-lg text-sm transition-colors disabled:cursor-not-allowed"
                    >
                      {isConnecting === account.platform ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3 h-3" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Connection Benefits */}
              {account.connected && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-300">
                        {account.platform} account connected successfully!
                      </p>
                      <p className="text-xs text-green-400 mt-1">
                        Your profile will display {account.platform} content and verification status.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="mt-8 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
        <h3 className="font-medium text-white mb-2">Why connect social media?</h3>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Display verified badges on your artist profile</li>
          <li>• Share your music directly to connected platforms</li>
          <li>• Reach fans across multiple social networks</li>
          <li>• Build credibility with social proof</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
        <button
          onClick={onPrevious}
          className="bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Previous
        </button>

        <div className="flex space-x-3">
          <button
            onClick={onSkip}
            className="inline-flex items-center space-x-2 border border-white/20 hover:border-indigo-400 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span>Skip</span>
          </button>

          <button
            onClick={onNext}
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStep;
