import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users as UsersIcon, Plus, Search, Edit, Trash2, Eye, Shield, Mail, Lock } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'OFFICE_STAFF',
    password: ''
  });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch users', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (isEditing) {
        const { password, ...data } = formData;
        await axios.put(`${API_URL}/api/users/${selectedUser.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({ icon: 'success', title: 'Success', text: 'User updated successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      } else {
        await axios.post(`${API_URL}/api/users`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({ icon: 'success', title: 'Success', text: 'User created successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      }

      setShowModal(false);
      setFormData({
        username: '',
        fullName: '',
        email: '',
        role: 'OFFICE_STAFF',
        password: ''
      });
      setIsEditing(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to save user', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ icon: 'success', title: 'Success', text: 'User deleted successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      fetchUsers();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to delete user', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/${selectedUser.id}/password`, passwordForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ icon: 'success', title: 'Success', text: 'Password changed successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: '' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to change password', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

  const canManageUsers = currentUser?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage system users and permissions</p>
        </div>
        {canManageUsers && (
          <button
            onClick={() => {
              setIsEditing(false);
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center gap-2 py-2 px-3 lg:px-4 text-xs sm:text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New User</span>
            <span className="sm:hidden">New</span>
          </button>
        )}
      </div>

      <div className="card mb-4 lg:mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Username</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Full Name</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">Email</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Role</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">Status</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-xs sm:text-sm text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">{user.username}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">{user.fullName}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">{user.email || '-'}</td>
                  <td className="px-3 lg:px-5 py-3 lg:py-4">
                    <span className="badge badge-info text-[10px] lg:text-xs">{user.role}</span>
                  </td>
                  <td className="px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">
                    {user.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td className="px-3 lg:px-5 py-3 lg:py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(user)}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      {canManageUsers && (
                        <>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleChangePassword(user)}
                            className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Change Password"
                          >
                            <Lock size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-danger-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-gradient card max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{isEditing ? 'Edit User' : 'New User'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input text-sm"
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Role *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input text-sm"
                >
                  <option value="OFFICE_STAFF">Office Staff</option>
                  <option value="STORE_MANAGER">Store Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {!isEditing && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input text-sm"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1 text-sm py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 text-sm py-2"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-gradient card max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">User Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Username</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedUser.username}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedUser.fullName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedUser.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Role</p>
                  <span className="badge badge-info text-xs">{selectedUser.role}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                {selectedUser.isActive ? (
                  <span className="badge badge-success">Active</span>
                ) : (
                  <span className="badge badge-danger">Inactive</span>
                )}
              </div>
              {canManageUsers && selectedUser.id !== currentUser?.id && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowPasswordModal(true);
                  }}
                  className="btn btn-secondary w-full text-sm py-2"
                >
                  Change Password
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-gradient card max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Changing password for: <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedUser.username}</span>
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ newPassword: e.target.value })}
                  className="input text-sm"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-secondary flex-1 text-sm py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 text-sm py-2"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
