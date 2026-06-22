import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    storeId: '',
    size: '',
    color: '',
    unitPrice: '',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStores();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch products', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/stores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice)
      };

      if (isEditing) {
        await axios.put(`${API_URL}/api/products/${selectedProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({ icon: 'success', title: 'Success', text: 'Product updated successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      } else {
        await axios.post(`${API_URL}/api/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({ icon: 'success', title: 'Success', text: 'Product created successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      }

      setShowModal(false);
      setFormData({
        code: '',
        name: '',
        categoryId: '',
        storeId: '',
        size: '',
        color: '',
        unitPrice: '',
        description: ''
      });
      setIsEditing(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to save product', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ icon: 'success', title: 'Success', text: 'Product deleted successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      fetchProducts();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to delete product', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      storeId: product.storeId,
      size: product.size,
      color: product.color,
      unitPrice: product.unitPrice,
      description: product.description
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const filteredProducts = products.filter(product => {
    const search = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(search) ||
      product.code?.toLowerCase().includes(search)
    );
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
            Products
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage your product inventory</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2 py-2 px-3 lg:px-4 text-xs sm:text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Product</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="card mb-4 lg:mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search products..."
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
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Code</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Name</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Category</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">Store</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">Size</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">Color</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Price</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">Status</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-xs sm:text-sm text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="font-medium text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">{product.code}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">{product.name}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">{product.category?.name || '-'}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">{product.store?.name || '-'}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">{product.size || '-'}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">{product.color || '-'}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">₹{Number(product.unitPrice).toLocaleString()}</td>
                  <td className="px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">
                    {product.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td className="px-3 lg:px-5 py-3 lg:py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(product)}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-danger-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-gradient card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
              <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">{isEditing ? 'Edit Product' : 'New Product'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] lg:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="input text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] lg:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    Store *
                  </label>
                  <select
                    required
                    value={formData.storeId}
                    onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                    className="input text-sm"
                  >
                    <option value="">Select Store</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    Size
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    Unit Price *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="input text-sm"
                  />
                </div>
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
              <div className="flex gap-2">
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

      {showDetailsModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-gradient card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Product Details - {selectedProduct.code}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Name</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Category</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedProduct.category?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Store</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedProduct.store?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Unit Price</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">₹{Number(selectedProduct.unitPrice).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Size</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedProduct.size || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Color</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedProduct.color || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  {selectedProduct.isActive ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-danger">Inactive</span>
                  )}
                </div>
              </div>
              {selectedProduct.description && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedProduct.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
