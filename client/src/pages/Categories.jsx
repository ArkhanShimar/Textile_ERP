import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch categories', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (isEditing) {
        await axios.put(`${API_URL}/api/categories/${selectedCategory.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({ icon: 'success', title: 'Success', text: 'Category updated successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      } else {
        await axios.post(`${API_URL}/api/categories`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({ icon: 'success', title: 'Success', text: 'Category created successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      }

      setShowModal(false);
      setFormData({ name: '', description: '' });
      setIsEditing(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to save category', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ icon: 'success', title: 'Success', text: 'Category deleted successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      fetchCategories();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to delete category', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleView = (category) => {
    setSelectedCategory(category);
    setShowDetailsModal(true);
  };

  const filteredCategories = categories.filter(category => {
    const search = searchTerm.toLowerCase();
    return category.name?.toLowerCase().includes(search);
  });

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
            Categories
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage product categories</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2 py-2 px-3 lg:px-4 text-xs sm:text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Category</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="card mb-4 lg:mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search categories..."
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
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Name</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">Description</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Status</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-xs sm:text-sm text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td className="font-medium text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">{category.name}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">{category.description || '-'}</td>
                  <td className="px-3 lg:px-5 py-3 lg:py-4">
                    {category.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td className="px-3 lg:px-5 py-3 lg:py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(category)}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-danger-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
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
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{isEditing ? 'Edit Category' : 'New Category'}</h2>
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
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input text-sm"
                  rows="3"
                />
              </div>
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

      {showDetailsModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-gradient card max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Category Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Name</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedCategory.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">{selectedCategory.description || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                {selectedCategory.isActive ? (
                  <span className="badge badge-success">Active</span>
                ) : (
                  <span className="badge badge-danger">Inactive</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
