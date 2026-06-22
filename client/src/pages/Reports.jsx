import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Download, Calendar, TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        type: reportType,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const response = await axios.get(`${API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to generate report', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {
        type: reportType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        format: 'csv'
      };

      const response = await axios.get(`${API_URL}/api/reports/export`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      Swal.fire({ icon: 'success', title: 'Success', text: 'CSV exported successfully', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to export CSV', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
    }
  };

  const reportTypes = [
    { value: 'sales', label: 'Sales Report', icon: DollarSign },
    { value: 'inventory', label: 'Inventory Report', icon: Package },
    { value: 'customers', label: 'Customer Report', icon: Users },
    { value: 'orders', label: 'Order Report', icon: TrendingUp }
  ];

  const selectedReportType = reportTypes.find(rt => rt.value === reportType);
  const Icon = selectedReportType?.icon || BarChart3;

  return (
    <div className="space-y-4 lg:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
          Reports
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Generate and export business reports</p>
      </div>

      <div className="card mb-4 lg:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div>
            <label className="block text-[10px] lg:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input text-xs sm:text-sm"
            >
              {reportTypes.map((rt) => (
                <option key={rt.value} value={rt.value}>{rt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] lg:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input text-xs sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] lg:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input text-xs sm:text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="btn btn-primary flex-1 text-xs sm:text-sm py-2"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
            {reportData && (
              <button
                onClick={handleExportCSV}
                className="btn btn-secondary p-2"
                title="Export CSV"
              >
                <Download size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {reportData && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4 lg:mb-5">
            <Icon size={18} lg:size={20} className="text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedReportType?.label}</h2>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {startDate && `from ${new Date(startDate).toLocaleDateString()}`}
              {startDate && endDate && ' to '}
              {endDate && new Date(endDate).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Total Records</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{reportData.totalRecords || 0}</p>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {reportData.totalAmount ? `₹${Number(reportData.totalAmount).toLocaleString()}` : '-'}
              </p>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Average</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {reportData.average ? `₹${Number(reportData.average).toLocaleString()}` : '-'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  {reportData.columns?.map((col) => (
                    <th key={col} className="text-xs font-semibold uppercase tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.data?.length === 0 ? (
                  <tr>
                    <td colSpan={reportData.columns?.length || 1} className="text-center py-8 text-sm text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  reportData.data?.map((row, idx) => (
                    <tr key={idx}>
                      {reportData.columns?.map((col) => (
                        <td key={col} className="text-sm">
                          {typeof row[col] === 'number' && col.toLowerCase().includes('amount') || col.toLowerCase().includes('price') || col.toLowerCase().includes('total')
                            ? `₹${Number(row[col]).toLocaleString()}`
                            : row[col] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!reportData && !loading && (
        <div className="card">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-sm text-gray-600 dark:text-gray-400">Select report type and date range to generate a report</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
