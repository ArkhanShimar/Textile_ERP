import { useState, useEffect } from 'react';
import axios from 'axios';
import { Warehouse, Plus, Minus, Search, AlertTriangle, History, ArrowUp, ArrowDown } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [adjustForm, setAdjustForm] = useState({ type: 'STOCK_IN', quantity: 0, notes: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch inventory', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (inventoryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/inventory/transactions/${inventoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch transactions', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const handleAdjust = async () => {
    if (!adjustForm.quantity || adjustForm.quantity <= 0) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please enter a valid quantity', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/inventory/adjust`, {
        inventoryId: selectedItem.id,
        type: adjustForm.type,
        quantity: parseInt(adjustForm.quantity),
        notes: adjustForm.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ icon: 'success', title: 'Success', text: 'Inventory adjusted successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      setShowAdjustModal(false);
      setAdjustForm({ type: 'STOCK_IN', quantity: 0, notes: '' });
      fetchInventory();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to adjust inventory', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const handleViewHistory = (item) => {
    setSelectedItem(item);
    fetchTransactions(item.id);
    setShowHistoryModal(true);
  };

  const getTransactionTypeBadge = (type) => {
    const styles = {
      STOCK_IN: 'bg-green-100 text-green-800',
      STOCK_OUT: 'bg-red-100 text-red-800',
      RESERVED: 'bg-blue-100 text-blue-800',
      RELEASED: 'bg-purple-100 text-purple-800',
      ADJUSTMENT: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  const filteredInventory = inventory.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.product?.name?.toLowerCase().includes(search) ||
      item.product?.code?.toLowerCase().includes(search) ||
      item.store?.name?.toLowerCase().includes(search)
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
      <div>
        <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
          Inventory Management
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Track and manage product inventory across stores</p>
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
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Product</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">Code</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Store</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">Total</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Available</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">Reserved</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">Status</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-xs sm:text-sm text-gray-500">
                  No inventory found
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">{item.product?.name || '-'}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">{item.product?.code || '-'}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">{item.store?.name || '-'}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">{item.totalQuantity}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">{item.availableQuantity}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">{item.reservedQuantity}</td>
                  <td className="px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">
                    {item.availableQuantity <= item.lowStockThreshold ? (
                      <span className="badge badge-warning text-[10px] lg:text-xs">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                  <td className="px-3 lg:px-5 py-3 lg:py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowAdjustModal(true);
                        }}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Adjust Stock"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => handleViewHistory(item)}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View History"
                      >
                        <History size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-gradient card max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Adjust Inventory</h2>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Minus size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Product</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedItem.product?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Current Available</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedItem.availableQuantity}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Adjustment Type
                </label>
                <select
                  value={adjustForm.type}
                  onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                  className="input text-sm"
                >
                  <option value="STOCK_IN">Stock In</option>
                  <option value="STOCK_OUT">Stock Out</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Notes
                </label>
                <textarea
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  className="input text-sm"
                  rows="3"
                />
              </div>
              <button
                onClick={handleAdjust}
                className="btn btn-primary w-full text-sm py-2"
              >
                Adjust Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-gradient card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Transaction History - {selectedItem.product?.name}</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Minus size={20} />
              </button>
            </div>
            <div className="p-6">
              {transactions.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-8">No transactions found</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'STOCK_IN' && <ArrowUp className="text-green-600" size={16} />}
                          {transaction.type === 'STOCK_OUT' && <ArrowDown className="text-red-600" size={16} />}
                          {getTransactionTypeBadge(transaction.type)}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-900 dark:text-gray-100">Quantity: {transaction.quantity}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {transaction.reference}
                        </span>
                      </div>
                      {transaction.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{transaction.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
