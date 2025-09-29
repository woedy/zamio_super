import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublisherId } from '../../../constants';
import ButtonLoader from '../../../common/button_loader';
import api from '../../../lib/api';
import {
  extractApiErrorMessage,
  navigateToOnboardingStep,
  skipPublisherOnboarding,
} from '../../../utils/onboarding';

type SearchResult = {
  artist_id: string;
  stage_name: string;
  contact_email?: string | null;
  user_email?: string | null;
  linked: boolean;
  linked_to_you: boolean;
  linked_publisher?: string | null;
};

const LinkArtist = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [linkingId, setLinkingId] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStageName, setInviteStageName] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  const navigate = useNavigate();
  const publisherId = getPublisherId();

  useEffect(() => {
    setError('');
    if (!publisherId) {
      setResults([]);
      return;
    }
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await api.get('api/publishers/link-artist/search/', {
          params: { q: query.trim() },
        });
        setResults(response.data?.data?.results ?? []);
      } catch (err) {
        console.error('Failed to search artists:', err);
        setResults([]);
        setError(extractApiErrorMessage(err, 'Search failed.'));
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [query, publisherId]);

  const ensureSession = () => {
    if (!publisherId) {
      setError('Missing publisher session. Please sign in again.');
      navigate('/sign-in');
      return false;
    }
    return true;
  };

  const linkArtist = async (artist_id: string) => {
    setError('');
    setInviteMsg('');
    if (!ensureSession()) {
      return;
    }
    try {
      setLinkingId(artist_id);
      await api.post('api/publishers/link-artist/link/', { artist_id });
      setSelected((prev) => ({ ...prev, [artist_id]: true }));
    } catch (err) {
      console.error('Failed to link artist:', err);
      setError(extractApiErrorMessage(err, 'Link failed.'));
    } finally {
      setLinkingId(null);
    }
  };

  const inviteArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInviteMsg('');
    if (!inviteEmail.trim()) {
      setError('Email is required to send invite');
      return;
    }
    if (!ensureSession()) {
      return;
    }
    try {
      setInviting(true);
      const parsed = inviteEmail
        .split(/[\s,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: Record<string, unknown> = parsed.length > 1 ? { emails: parsed } : { email: parsed[0] };
      if (inviteStageName.trim()) {
        payload.stage_name = inviteStageName.trim();
      }

      await api.post('api/publishers/link-artist/invite/', payload);
      setInviteMsg('Invitation sent successfully. Check email for the token.');
      setInviteEmail('');
      setInviteStageName('');
    } catch (err) {
      console.error('Failed to send invite:', err);
      setError(extractApiErrorMessage(err, 'Invite failed.'));
    } finally {
      setInviting(false);
    }
  };

  const linkSelected = async () => {
    setError('');
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) {
      setError('Select at least one artist to link');
      return;
    }
    if (!ensureSession()) {
      return;
    }
    try {
      setLinkingId('bulk');
      const response = await api.post('api/publishers/link-artist/link-multiple/', {
        artist_ids: ids,
      });
      const linked: string[] = response.data?.data?.linked ?? [];
      setSelected((prev) => {
        const copy = { ...prev };
        linked.forEach((id) => {
          copy[id] = true;
        });
        return copy;
      });
    } catch (err) {
      console.error('Failed to link selected artists:', err);
      setError(extractApiErrorMessage(err, 'Bulk link failed.'));
    } finally {
      setLinkingId(null);
    }
  };

  const completeStepAndContinue = async () => {
    if (!ensureSession()) {
      return;
    }
    try {
      const id = publisherId;
      if (!id) {
        return;
      }
      const response = await api.post('api/accounts/complete-link-artist/', {
        publisher_id: id,
      });
      const next = response.data?.data?.next_step as string | undefined;
      navigateToOnboardingStep(navigate, next);
    } catch (err) {
      console.error('Failed to complete link-artist step:', err);
      setError(extractApiErrorMessage(err, 'Failed to continue'));
    }
  };

  const handleSkip = async () => {
    if (!ensureSession()) {
      return;
    }
    try {
      const id = publisherId;
      if (!id) {
        return;
      }
      const { redirect_step } = await skipPublisherOnboarding(id, 'payment');
      navigateToOnboardingStep(navigate, redirect_step, { reloadOnDone: false });
    } catch (err) {
      console.error('Failed to skip link-artist step:', err);
      setError(extractApiErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center py-12">
      <div className="w-full max-w-5xl px-6">
        <h2 className="text-5xl font-bold text-white text-center mb-8">ZamIO</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {inviteMsg && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-3">
            <span className="block sm:inline">{inviteMsg}</span>
          </div>
        )}

        <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md w-full border border-white/20 shadow-xl">
          <h2 className="text-4xl font-bold text-white text-center mb-6">🎧 Sign/Link Artists</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-white text-center mb-4">Search artists and link to your catalog</p>
              <input
                type="text"
                placeholder="Search by stage name or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 mb-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="space-y-3 max-h-80 overflow-auto">
                {searching && <div className="text-white text-sm">Searching...</div>}
                {!searching && results.length === 0 && query && (
                  <div className="text-white/80 text-sm">No artists found. Try inviting them instead.</div>
                )}
                {results.map((r) => (
                  <div key={r.artist_id} className="flex items-center justify-between bg-white/10 rounded-md px-3 py-2 border border-white/10">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!selected[r.artist_id]}
                        onChange={(e) => setSelected((prev) => ({ ...prev, [r.artist_id]: e.target.checked }))}
                      />
                      <div className="text-white text-sm">
                        <div className="font-semibold">{r.stage_name || 'Unknown Stage Name'}</div>
                        <div className="text-white/80">{r.contact_email || r.user_email || ''}</div>
                        {r.linked && (
                          <div className="text-xs text-yellow-200 mt-1">
                            {r.linked_to_you ? 'Already linked to you' : `Linked to ${r.linked_publisher || 'another publisher'}`}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <button
                        disabled={(r.linked && !r.linked_to_you) || linkingId === r.artist_id}
                        onClick={() => linkArtist(r.artist_id)}
                        className={`px-3 py-2 rounded text-xs font-semibold ${
                          r.linked && !r.linked_to_you
                            ? 'bg-gray-500 cursor-not-allowed text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {linkingId === r.artist_id ? 'Linking...' : r.linked_to_you ? 'Linked' : 'Link'}
                      </button>
                    </div>
                  </div>
                ))}
                {results.length > 0 && (
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={linkSelected}
                      disabled={linkingId === 'bulk'}
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                    >
                      {linkingId === 'bulk' ? 'Linking…' : 'Link Selected'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-white text-center mb-4">Invite artists by email</p>
              <form onSubmit={inviteArtist} className="space-y-4">
                <input
                  type="text"
                  placeholder="artist1@email.com, artist2@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="Stage name (optional)"
                  value={inviteStageName}
                  onChange={(e) => setInviteStageName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {inviting ? (
                  <ButtonLoader />
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-lg"
                  >
                    Send Invite
                  </button>
                )}
              </form>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button onClick={handleSkip} className="underline text-white hover:text-blue-200">
              Skip
            </button>
            <button
              onClick={completeStepAndContinue}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkArtist;
