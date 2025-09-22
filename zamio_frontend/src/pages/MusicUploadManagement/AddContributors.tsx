import { useEffect, useMemo, useState } from 'react';
import { Music2Icon, UploadCloud, FileMusic } from 'lucide-react';
import { baseUrl, userToken } from '../../constants';
import { getArtistId } from '../../lib/auth';
import ButtonLoader from '../../common/button_loader';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AddContributor() {
  const [contributorData, setContributorData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    percent_split: '',
  });
  const [inputError, setInputError] = useState(null); // "success", "error", null
  const [loading, setLoading] = useState(false);
  const [existingContributors, setExistingContributors] = useState<any[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<string>('');
  const [contributors, setContributors] = useState<any[]>([]);
  const [submitErrors, setSubmitErrors] = useState<string | null>(null);
  const [assignRemainder, setAssignRemainder] = useState<boolean>(true);

  const [roles, setRoles] = useState(['Composer', 'Producer', 'Writer', 'Featured Artist', 'Mixer', 'Engineer']);


  const navigate = useNavigate();

  const location = useLocation();
  const { track_id } = location.state || {};



  const handleChange = (e) => {
    const { name, value } = e.target;
    setContributorData({ ...contributorData, [name]: value });
  };

  const totalSplit = useMemo(() => {
    return contributors.reduce((acc, c) => acc + Number(c.percent_split || 0), 0);
  }, [contributors]);

  const addContributorToList = (e) => {
    e.preventDefault();
    setInputError(null);
    const { email, role, percent_split, first_name, last_name } = contributorData;
    if (!email || !role || !percent_split) {
      setInputError('Email, role and split are required');
      return;
    }
    const splitNum = Number(percent_split);
    if (isNaN(splitNum) || splitNum <= 0 || splitNum > 100) {
      setInputError('Split must be a number between 1 and 100');
      return;
    }
    // Avoid duplicate email entries
    if (contributors.find((c) => (c.email || '').toLowerCase() === email.toLowerCase())) {
      setInputError('Contributor with this email is already added');
      return;
    }
    const next = [...contributors, { email, role, percent_split: splitNum, first_name, last_name }];
    setContributors(next);
    // Clear current form (keep role for convenience)
    setContributorData({ email: '', first_name: '', last_name: '', role, percent_split: '' });
    setSelectedExisting('');
  };

  const removeContributor = (idx: number) => {
    setContributors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitAll = async (e) => {
    e.preventDefault();
    setSubmitErrors(null);
    if (!contributors.length) {
      setInputError('Please add at least one contributor');
      return;
    }
    if (totalSplit > 100) {
      setInputError('Total split cannot exceed 100%');
      return;
    }
    setLoading(true);
    try {
      const url = baseUrl + 'api/artists/add-contributor/';
      const failures: string[] = [];
      // Submit sequentially to surface errors clearly
      for (const c of contributors) {
        const formData = new FormData();
        formData.append('track_id', track_id);
        formData.append('email', c.email);
        if (c.first_name) formData.append('first_name', c.first_name);
        if (c.last_name) formData.append('last_name', c.last_name);
        formData.append('role', c.role);
        formData.append('percent_split', String(c.percent_split));
        const res = await fetch(url, {
          method: 'POST',
          body: formData,
          headers: { Authorization: `Token ${userToken}` },
        });
        const data = await res.json();
        if (!res.ok) {
          const errText = data?.errors ? Object.values(data.errors).flat().join(', ') : (data?.message || 'Failed');
          // Treat duplicate as non-fatal and continue
          if (String(errText).toLowerCase().includes('already added')) {
            // skip recording failure
          } else {
            failures.push(`${c.email}: ${errText}`);
          }
        }
      }
      // Assign remainder to artist automatically if enabled and remainder exists
      const remainder = 100 - totalSplit;
      if (assignRemainder && remainder > 0) {
        const formData = new FormData();
        formData.append('track_id', track_id);
        formData.append('percent_split', String(remainder));
        formData.append('artist_self', 'true');
        formData.append('role', 'Composer');
        const res = await fetch(url, { method: 'POST', body: formData, headers: { Authorization: `Token ${userToken}` } });
        const data = await res.json();
        if (!res.ok) {
          const errText = data?.errors ? Object.values(data.errors).flat().join(', ') : (data?.message || 'Failed');
          // Duplicate artist contributor: treat as non-fatal (artist already has a split)
          if (String(errText).toLowerCase().includes('already added')) {
            // ignore
          } else {
            failures.push(`Artist remainder: ${errText}`);
          }
        }
      }

      if (failures.length) {
        setSubmitErrors(failures.join('\n'));
        setLoading(false);
        return;
      }
      navigate('/track-details', {
        state: { successMessage: `Contributors added successfully.`, track_id: `${track_id}` },
      });
    } catch (error) {
      setSubmitErrors('Failed to submit contributors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing contributors for this artist
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await fetch(
          `${baseUrl}api/artists/get-artist-contributor-choices/?artist_id=${encodeURIComponent(getArtistId())}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${userToken}`,
            },
          },
        );
        if (!res.ok) return;
        const payload = await res.json();
        setExistingContributors(payload?.data?.contributors || []);
      } catch (e) {
        // ignore
      }
    };
    fetchExisting();
  }, []);

  // Prefill from existing choice
  const handleSelectExisting = (e) => {
    const uid = e.target.value;
    setSelectedExisting(uid);
    if (!uid) return;
    const found = existingContributors.find((c) => String(c.user_id) === String(uid));
    if (found) {
      setContributorData((prev) => ({
        ...prev,
        email: found.email || '',
        first_name: found.first_name || '',
        last_name: found.last_name || '',
      }));
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-emerald-300 flex items-center mb-4">
          <Music2Icon className="w-7 h-7 mr-3" /> Add Contributor
        </h2>
        <p className="text-gray-500">Add track contributor information</p>
      </div>

      {inputError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {inputError}</span>
        </div>
      )}

      {/* Stepper */}
      <div className="mb-4 flex items-center space-x-4 text-sm">
        {[
          { label: 'Upload' },
          { label: 'Cover Art' },
          { label: 'Contributors', active: true },
          { label: 'Review' },
        ].map((s, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center mr-2 ${
                s.active ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              {i + 1}
            </div>
            <span className={`mr-4 ${s.active ? 'text-white' : 'text-gray-400'}`}>{s.label}</span>
            {i < 3 && <div className="w-10 h-px bg-white/20 mr-4" />}
          </div>
        ))}
      </div>

      <div className="bg-boxdark rounded-lg shadow-xl p-8">
        {/* Existing contributor picker */}
        <div className="mb-6">
          <label className="block text-emerald-200 text-sm font-bold mb-2" htmlFor="existing">
            Select Existing Contributor (optional)
          </label>
          <select
            id="existing"
            value={selectedExisting}
            onChange={handleSelectExisting}
            className="shadow-inner border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
          >
            <option value="">-- Choose existing contributor --</option>
            {existingContributors.map((c) => (
              <option key={c.user_id} value={c.user_id}>
                {c.first_name || c.last_name ? `${c.first_name} ${c.last_name}`.trim() : c.email}
              </option>
            ))}
          </select>
        </div>
        {submitErrors && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3 whitespace-pre-wrap">
            <strong className="font-bold">Submission Errors</strong>
            <span className="block sm:inline"> {submitErrors}</span>
          </div>
        )}
        <form onSubmit={handleSubmitAll} noValidate className="space-y-6">
          {/* Contributor Email */}
          <div>
            <label htmlFor="email" className="block text-emerald-200 text-sm font-bold mb-2">
              Contributor Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={contributorData.email}
              onChange={handleChange}
              className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
              placeholder="Enter contributor email"
            />
          </div>

          {/* Optional First/Last Name for new contributors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-emerald-200 text-sm font-bold mb-2">
                First Name (optional)
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={contributorData.first_name}
                onChange={handleChange}
                className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
                placeholder="First name"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-emerald-200 text-sm font-bold mb-2">
                Last Name (optional)
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={contributorData.last_name}
                onChange={handleChange}
                className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
                placeholder="Last name"
              />
            </div>
          </div>


          <div className="">
            <label
              className="block text-emerald-200 text-sm font-bold mb-2"
              htmlFor="role"
            >
              Select Role
            </label>

            <select
              id="role"
              value={contributorData.role}
              onChange={(e) => setContributorData((prev) => ({...prev, role: e.target.value }))}
              className="shadow-inner border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
            >
              <option value="">Select Role</option>

              {roles.map((gen) => (
                <option
                  key={gen}
                  value={gen}
                  className="hover:bg-graydark dark:hover:bg-graydark"
                >
                  {gen}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="percent_split"
              className="block text-emerald-200 text-sm font-bold mb-2"
            >
              Contributor Split <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="percent_split"
              name="percent_split"
              value={contributorData.percent_split}
              //value={contributorData.percent_split}
              onChange={handleChange}
              className="shadow-inner appearance-none border rounded w-full py-3 px-4 text-gray-300 leading-tight focus:outline-none focus:shadow-outline bg-graydark"
              placeholder="Enter split"
            />
          </div>

          {/* Staging list */}
          <div className="rounded border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-semibold">Contributors Staged</div>
              <div className="text-sm text-gray-300">
                <span className={`${totalSplit > 100 ? 'text-red-400' : 'text-green-400'}`}>Contributors: {totalSplit}%</span>
                <span className="mx-2">|</span>
                <span className="text-indigo-300">Artist remainder: {Math.max(0, 100 - totalSplit)}%</span>
              </div>
            </div>
            {contributors.length === 0 ? (
              <div className="text-gray-400 text-sm">No contributors added yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase bg-white/5 text-gray-400">
                    <tr>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2">Split</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/5 divide-y divide-white/10">
                    {contributors.map((c, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{c.email}</td>
                        <td className="px-3 py-2">{(c.first_name || '') + (c.last_name ? ' ' + c.last_name : '')}</td>
                        <td className="px-3 py-2">{c.role}</td>
                        <td className="px-3 py-2">{c.percent_split}%</td>
                        <td className="px-3 py-2 text-right">
                          <button type="button" onClick={() => removeContributor(idx)} className="text-red-400 hover:text-red-300 text-xs">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <label className="flex items-center space-x-2 text-sm text-gray-300 mr-auto">
              <input type="checkbox" checked={assignRemainder} onChange={(e) => setAssignRemainder(e.target.checked)} />
              <span>Assign remainder to artist automatically</span>
            </label>
            <button
              type="button"
              onClick={addContributorToList}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-white/10 hover:bg-white/20"
            >
              Add To List
            </button>
            {loading ? (
              <ButtonLoader />
            ) : (
              <button
                type="submit"
                disabled={contributors.length === 0 || totalSplit > 100}
                className={`inline-flex items-center px-6 py-3 rounded-md text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  contributors.length === 0 || totalSplit > 100
                    ? 'bg-emerald-600/50 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <UploadCloud className="w-5 h-5 mr-2" /> Submit Contributors
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
