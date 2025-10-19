import React, { useState } from 'react';
import { Users, Plus, Trash2, Shield, Edit, Mail, Phone, UserCheck, UserX, Crown, FileText, Settings } from 'lucide-react';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'reporter';
  permissions: string[];
  isActive: boolean;
  joinDate: string;
}

interface StaffStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
}

const StaffStep: React.FC<StaffStepProps> = ({ onNext, onPrevious, onSkip }) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@radiostation.com',
      phone: '+233 24 123 4567',
      role: 'manager',
      permissions: ['reports', 'monitoring', 'staff'],
      isActive: true,
      joinDate: '2024-01-15'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'reporter' as 'admin' | 'manager' | 'reporter',
    permissions: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableRoles = [
    {
      id: 'admin',
      name: 'Administrator',
      icon: Crown,
      description: 'Full access to all station features and settings',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      id: 'manager',
      name: 'Manager',
      icon: Shield,
      description: 'Manage reports, monitoring, and staff oversight',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      id: 'reporter',
      name: 'Reporter',
      icon: FileText,
      description: 'Access to reports and basic monitoring features',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    }
  ];

  const availablePermissions = [
    { id: 'reports', label: 'View Reports', description: 'Access to airplay and royalty reports' },
    { id: 'monitoring', label: 'Monitor Streams', description: 'Real-time stream monitoring access' },
    { id: 'staff', label: 'Manage Staff', description: 'Add/remove staff members and roles' },
    { id: 'settings', label: 'System Settings', description: 'Modify station configuration' },
    { id: 'payments', label: 'Payment Management', description: 'Access to payment and billing features' },
    { id: 'compliance', label: 'Compliance Tools', description: 'Access to regulatory compliance features' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStaff = () => {
    if (!validateForm()) return;

    const newMember: StaffMember = {
      id: Date.now().toString(),
      ...formData,
      isActive: true,
      joinDate: new Date().toISOString().split('T')[0]
    };

    setStaffMembers(prev => [...prev, newMember]);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'reporter',
      permissions: []
    });
    setShowAddForm(false);
    setErrors({});
  };

  const handleEditStaff = (memberId: string) => {
    const member = staffMembers.find(m => m.id === memberId);
    if (member) {
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        role: member.role,
        permissions: member.permissions
      });
      setEditingMember(memberId);
      setShowAddForm(true);
    }
  };

  const handleUpdateStaff = () => {
    if (!validateForm() || !editingMember) return;

    setStaffMembers(prev => prev.map(member =>
      member.id === editingMember
        ? { ...member, ...formData }
        : member
    ));

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'reporter',
      permissions: []
    });
    setEditingMember(null);
    setShowAddForm(false);
    setErrors({});
  };

  const handleRemoveStaff = (memberId: string) => {
    setStaffMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const toggleStaffStatus = (memberId: string) => {
    setStaffMembers(prev => prev.map(member =>
      member.id === memberId
        ? { ...member, isActive: !member.isActive }
        : member
    ));
  };

  const getRoleInfo = (roleId: string) => {
    return availableRoles.find(role => role.id === roleId);
  };

  const getDefaultPermissions = (roleId: string) => {
    switch (roleId) {
      case 'admin':
        return ['reports', 'monitoring', 'staff', 'settings', 'payments', 'compliance'];
      case 'manager':
        return ['reports', 'monitoring', 'staff'];
      case 'reporter':
        return ['reports'];
      default:
        return [];
    }
  };

  const handleRoleChange = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      role: roleId as 'admin' | 'manager' | 'reporter',
      permissions: getDefaultPermissions(roleId)
    }));
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-semibold text-white mb-4">
          Staff Management
        </h3>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Add team members and assign roles for efficient station operations. Control access levels and permissions for different team functions.
        </p>
      </div>

      {/* Staff Members List */}
      <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold text-white">Team Members</h4>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {staffMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No staff members added yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Team Member</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {staffMembers.map((member) => {
              const roleInfo = getRoleInfo(member.role);
              return (
                <div key={member.id} className={`border rounded-lg p-4 transition-colors ${
                  member.isActive ? 'border-white/10 bg-slate-800/50' : 'border-slate-700 bg-slate-800/30 opacity-60'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${roleInfo?.bgColor}`}>
                        <roleInfo.icon className={`w-6 h-6 ${roleInfo?.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-white">
                            {member.firstName} {member.lastName}
                          </h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{member.email}</p>
                        <p className="text-xs text-slate-500">
                          Joined {new Date(member.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditStaff(member.id)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit staff member"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStaffStatus(member.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          member.isActive
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                            : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                        }`}
                        title={member.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {member.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleRemoveStaff(member.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Remove staff member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-200 mb-1">Role: {roleInfo?.name}</p>
                        <p className="text-xs text-slate-400">{roleInfo?.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.map((permission) => {
                          const permInfo = availablePermissions.find(p => p.id === permission);
                          return (
                            <span key={permission} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full">
                              {permInfo?.label || permission}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Staff Form */}
      {showAddForm && (
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8 mb-8">
          <h4 className="text-xl font-semibold text-white mb-6">
            {editingMember ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h4>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-200 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.firstName
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-200 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                  errors.lastName
                    ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                    : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border pl-10 pr-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    errors.email
                      ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                  }`}
                  placeholder="staff@radiostation.com"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-200 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border pl-10 pr-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    errors.phone
                      ? 'border-red-400 bg-slate-800/50 focus:border-red-400 focus:ring-red-400'
                      : 'border-white/20 bg-slate-800/50 focus:border-indigo-400 focus:ring-indigo-400'
                  }`}
                  placeholder="+233 XX XXX XXXX"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-200 mb-3">Select Role *</label>
            <div className="grid md:grid-cols-3 gap-4">
              {availableRoles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleChange(role.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    formData.role === role.id
                      ? 'border-indigo-400 bg-indigo-500/20'
                      : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <role.icon className={`w-5 h-5 ${role.color}`} />
                    <span className="font-medium text-white">{role.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">{role.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-200 mb-3">
              Permissions {formData.role !== 'admin' && '(Based on selected role)'}
            </label>
            {formData.role === 'admin' ? (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-indigo-400/30">
                <p className="text-sm text-indigo-300">
                  Administrators have access to all features and permissions
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <label key={permission.id} className="flex items-start space-x-3 p-3 rounded-lg border border-white/10 bg-slate-800/50 hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="mt-0.5 rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-400"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-200">{permission.label}</span>
                      <p className="text-xs text-slate-400">{permission.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.permissions && <p className="text-red-400 text-sm mt-2">{errors.permissions}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingMember(null);
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  role: 'reporter',
                  permissions: []
                });
                setErrors({});
              }}
              className="px-6 py-2 border border-white/20 text-slate-300 hover:border-indigo-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={editingMember ? handleUpdateStaff : handleAddStaff}
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors"
            >
              {editingMember ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </div>
      )}

      {/* Role Information */}
      <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-8 mb-8">
        <h4 className="text-xl font-semibold text-white mb-6">Role Information</h4>
        <div className="grid md:grid-cols-3 gap-6">
          {availableRoles.map((role) => (
            <div key={role.id} className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${role.bgColor}`}>
                <role.icon className={`w-8 h-8 ${role.color}`} />
              </div>
              <h5 className="font-medium text-white mb-2">{role.name}</h5>
              <p className="text-sm text-slate-400">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Previous
        </button>
        <div className="flex space-x-3">
          {onSkip && (
            <button
              onClick={onSkip}
              className="border border-white/20 hover:border-indigo-400 text-slate-300 hover:text-white px-6 py-3 rounded-lg transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={onNext}
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue to Compliance
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffStep;
