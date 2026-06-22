import { useState, useEffect } from 'react';
import axios from 'axios';
import { Receipt, Plus, Search, Edit, Trash2, Eye, Download, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    purchaseOrderId: '',
    invoiceDate: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchInvoices();
    fetchPurchaseOrders();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch invoices', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/purchase-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchaseOrders(response.data.filter(po => ['CONFIRMED', 'COMPLETED'].includes(po.status)));
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        invoiceDate: formData.invoiceDate ? new Date(formData.invoiceDate).toISOString() : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      };

      if (isEditing) {
        await axios.put(`${API_URL}/api/invoices/${selectedInvoice.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({ icon: 'success', title: 'Success', text: 'Invoice updated successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      } else {
        await axios.post(`${API_URL}/api/invoices`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({ icon: 'success', title: 'Success', text: 'Invoice created successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      }

      setShowModal(false);
      setFormData({
        purchaseOrderId: '',
        invoiceDate: '',
        dueDate: '',
        notes: ''
      });
      setIsEditing(false);
      setSelectedInvoice(null);
      fetchInvoices();
      fetchPurchaseOrders();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to save invoice', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({ icon: 'success', title: 'Success', text: 'Invoice deleted successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
      fetchInvoices();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.error || 'Failed to delete invoice', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      purchaseOrderId: invoice.purchaseOrderId,
      invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '',
      dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
      notes: invoice.notes
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      Swal.fire({ icon: 'success', title: 'Success', text: 'PDF downloaded successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to download PDF', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const search = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber?.toLowerCase().includes(search) ||
      invoice.purchaseOrder?.poNumber?.toLowerCase().includes(search)
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
            Invoices
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage invoices and billing</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2 py-2 px-3 lg:px-4 text-xs sm:text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="card mb-4 lg:mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search invoices..."
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
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Invoice Number</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">PO Number</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">Customer</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">Invoice Date</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">Due Date</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Total</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">Status</th>
              <th className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider px-3 lg:px-5 py-3 lg:py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-xs sm:text-sm text-gray-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-medium text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">{invoice.invoiceNumber}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">{invoice.purchaseOrder?.poNumber || '-'}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">{invoice.purchaseOrder?.customer?.name || '-'}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : '-'}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4 hidden md:table-cell">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="text-xs sm:text-sm px-3 lg:px-5 py-3 lg:py-4">₹{Number(invoice.totalAmount).toLocaleString()}</td>
                  <td className="px-3 lg:px-5 py-3 lg:py-4 hidden sm:table-cell">
                    {invoice.status === 'PAID' ? (
                      <span className="badge badge-success">Paid</span>
                    ) : invoice.status === 'PENDING' ? (
                      <span className="badge badge-warning">Pending</span>
                    ) : (
                      <span className="badge badge-info">{invoice.status}</span>
                    )}
                  </td>
                  <td className="px-3 lg:px-5 py-3 lg:py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(invoice)}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(invoice.id)}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
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
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{isEditing ? 'Edit Invoice' : 'New Invoice'}</h2>
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
                  Purchase Order *
                </label>
                <select
                  required
                  value={formData.purchaseOrderId}
                  onChange={(e) => setFormData({ ...formData, purchaseOrderId: e.target.value })}
                  className="input text-sm"
                >
                  <option value="">Select Purchase Order</option>
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber} - {po.customer?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-gradient card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Invoice Details - {selectedInvoice.invoiceNumber}</h2>
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
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">PO Number</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedInvoice.purchaseOrder?.poNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedInvoice.purchaseOrder?.customer?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Invoice Date</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Due Date</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">₹{Number(selectedInvoice.totalAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  {selectedInvoice.status === 'PAID' ? (
                    <span className="badge badge-success">Paid</span>
                  ) : selectedInvoice.status === 'OVERDUE' ? (
                    <span className="badge badge-danger">Overdue</span>
                  ) : (
                    <span className="badge badge-info">Pending</span>
                  )}
                </div>
              </div>
              {selectedInvoice.notes && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedInvoice.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleDownloadPDF(selectedInvoice.id)}
                  className="btn btn-primary flex items-center gap-2 text-sm py-2"
                >
                  <FileText size={16} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
