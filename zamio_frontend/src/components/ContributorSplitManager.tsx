import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { baseUrl, userToken } from '../constants';

interface Contributor {
  id?: number;
  user_id: number;
  user_name: string;
  user_email: string;
  role: string;
  percent_split: number;
  is_artist: boolean;
  publisher_name?: string;
}

interface ContributorSplitManagerProps {
  trackId: number;
  trackTitle: string;
  onSplitsUpdated?: (contributors: Contributor[]) => void;
  className?: string;
}

const ROLE_OPTIONS = [
  'Artist',
  'Composer',
  'Producer',
  'Writer',
  'Featured Artist',
  'Mixer',
  'Engineer',
];

export const ContributorSplitManager: React.FC<
  ContributorSplitManagerProps
> = ({ trackId, trackTitle, onSplitsUpdated, className = '' }) => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<
    Array<{ id: number; name: string; email: string }>
  >([]);

  // Load initial data
  useEffect(() => {
    loadContributors();
    loadAvailableUsers();
  }, [trackId]);

  const loadContributors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}api/artists/get-track-split-summary/?track_id=${trackId}`,
        {
          headers: {
            Authorization: `Token ${userToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to load contributors');
      }

      const data = await response.json();
      if (data.data && data.data.contributors) {
        setContributors(
          data.data.contributors.map((c: any) => ({
            id: c.id,
            user_id: c.user_id,
            user_name: c.user_name,
            user_email: c.user_email,
            role: c.role,
            percent_split: c.percentage,
            is_artist: c.is_artist,
            publisher_name: c.publisher,
          })),
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load contributors');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await fetch(
        `${baseUrl}api/artists/get-artist-contributor-choices/`,
        {
          headers: {
            Authorization: `Token ${userToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.users) {
          setAvailableUsers(
            data.data.users.map((u: any) => ({
              id: u.id,
              name:
                u.name || `${u.first_name} ${u.last_name}`.trim() || u.username,
              email: u.email,
            })),
          );
        }
      }
    } catch (err) {
      console.error('Failed to load available users:', err);
    }
  };

  const addContributor = () => {
    const newContributor: Contributor = {
      user_id: 0,
      user_name: '',
      user_email: '',
      role: 'Artist',
      percent_split: 0,
      is_artist: false,
    };
    setContributors([...contributors, newContributor]);
  };

  const removeContributor = (index: number) => {
    const newContributors = contributors.filter((_, i) => i !== index);
    setContributors(newContributors);
  };

  const updateContributor = (
    index: number,
    field: keyof Contributor,
    value: any,
  ) => {
    const newContributors = [...contributors];
    newContributors[index] = { ...newContributors[index], [field]: value };

    // If user_id changes, update user details
    if (field === 'user_id') {
      const selectedUser = availableUsers.find((u) => u.id === parseInt(value));
      if (selectedUser) {
        newContributors[index].user_name = selectedUser.name;
        newContributors[index].user_email = selectedUser.email;
      }
    }

    setContributors(newContributors);
  };

  const autoBalanceSplits = () => {
    if (contributors.length === 0) return;

    const equalSplit = Math.floor(10000 / contributors.length) / 100; // Round down to 2 decimal places
    const remainder = 100 - equalSplit * contributors.length;

    const newContributors = contributors.map((contributor, index) => ({
      ...contributor,
      percent_split: index === 0 ? equalSplit + remainder : equalSplit,
    }));

    setContributors(newContributors);
  };

  const getTotalSplit = () => {
    return contributors.reduce(
      (total, contributor) => total + contributor.percent_split,
      0,
    );
  };

  const isValidSplit = () => {
    const total = getTotalSplit();
    return Math.abs(total - 100) < 0.01; // Allow for small floating point errors
  };

  const saveContributors = async () => {
    if (!isValidSplit()) {
      setError('Contributor splits must total exactly 100%');
      return;
    }

    // Validate all contributors have required fields
    for (let i = 0; i < contributors.length; i++) {
      const contributor = contributors[i];
      if (!contributor.user_id || contributor.user_id === 0) {
        setError(`Contributor ${i + 1}: Please select a user`);
        return;
      }
      if (!contributor.role) {
        setError(`Contributor ${i + 1}: Please select a role`);
        return;
      }
      if (contributor.percent_split <= 0) {
        setError(
          `Contributor ${i + 1}: Split percentage must be greater than 0`,
        );
        return;
      }
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const contributorsData = contributors.map((c) => ({
        user_id: c.user_id,
        role: c.role,
        percent_split: c.percent_split,
      }));

      const response = await fetch(
        `${baseUrl}api/artists/tracks/${trackId}/contributors/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${userToken}`,
          },
          body: JSON.stringify({
            contributors: contributorsData,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update contributors');
      }

      setSuccess(
        'Contributors updated successfully! Processing in background...',
      );
      onSplitsUpdated?.(contributors);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to save contributors');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading contributors...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-emerald-600" />
          <h3 className="text-lg font-semibold">Contributor Splits</h3>
        </div>
        <div className="text-sm text-gray-600">
          Track: <span className="font-medium">{trackTitle}</span>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{success}</span>
        </div>
      )}

      {/* Split Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Total Split:</span>
          <span
            className={`font-bold ${
              isValidSplit() ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {getTotalSplit().toFixed(2)}%
          </span>
        </div>
        {!isValidSplit() && (
          <p className="text-sm text-red-600 mt-1">
            Splits must total exactly 100%
          </p>
        )}
      </div>

      {/* Contributors List */}
      <div className="space-y-4">
        {contributors.map((contributor, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <select
                  value={contributor.user_id}
                  onChange={(e) =>
                    updateContributor(
                      index,
                      'user_id',
                      parseInt(e.target.value),
                    )
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={0}>Select User</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={contributor.role}
                  onChange={(e) =>
                    updateContributor(index, 'role', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Split Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Split %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={contributor.percent_split}
                  onChange={(e) =>
                    updateContributor(
                      index,
                      'percent_split',
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-end">
                <button
                  onClick={() => removeContributor(index)}
                  className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Additional Info */}
            {contributor.user_name && (
              <div className="mt-2 text-xs text-gray-500">
                {contributor.is_artist && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                    Artist
                  </span>
                )}
                {contributor.publisher_name && (
                  <span>Publisher: {contributor.publisher_name}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={addContributor}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contributor
        </button>

        <button
          onClick={autoBalanceSplits}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={contributors.length === 0}
        >
          Auto Balance
        </button>

        <button
          onClick={saveContributors}
          disabled={!isValidSplit() || isSaving || contributors.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Contributors
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-medium mb-1">Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>All contributor splits must total exactly 100%</li>
          <li>
            Use "Auto Balance" to distribute splits equally among all
            contributors
          </li>
          <li>Changes are processed in the background after saving</li>
          <li>The track artist is automatically included as a contributor</li>
        </ul>
      </div>
    </div>
  );
};

export default ContributorSplitManager;
