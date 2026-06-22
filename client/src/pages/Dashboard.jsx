import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  ShoppingCart,
  Package,
  AlertCircle,
  Activity,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  User,
  Calendar
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Orders', value: stats?.orders?.total || 0, icon: ShoppingCart, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', color: 'text-blue-600' },
    { title: 'Pending Orders', value: stats?.orders?.pending || 0, icon: Clock, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10', color: 'text-amber-600' },
    { title: 'Completed Orders', value: stats?.orders?.completed || 0, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', color: 'text-emerald-600' },
    { title: 'Total Products', value: stats?.inventory?.totalProducts || 0, icon: Package, gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-500/10', color: 'text-violet-600' },
    { title: 'Low Stock Items', value: stats?.inventory?.lowStockProducts || 0, icon: AlertCircle, gradient: 'from-rose-500 to-rose-600', bg: 'bg-rose-500/10', color: 'text-rose-600' },
    { title: 'Monthly Revenue', value: `₹${(stats?.revenue?.monthly || 0).toLocaleString()}`, icon: IndianRupee, gradient: 'from-teal-500 to-teal-600', bg: 'bg-teal-500/10', color: 'text-teal-600' },
  ];

  const quickActions = [
    { title: 'New Order', icon: Plus, color: 'from-primary-500 to-primary-600', href: '/purchase-orders' },
    { title: 'Add Product', icon: Package, color: 'from-accent-500 to-accent-600', href: '/products' },
    { title: 'View Reports', icon: TrendingUp, color: 'from-success-500 to-success-600', href: '/reports' },
    { title: 'Manage Users', icon: User, color: 'from-warning-500 to-warning-600', href: '/users' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="card-gradient card p-4 lg:p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{getGreeting()}, {user?.fullName || 'User'}!</p>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Here's what's happening with your business today.</p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Today</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
              <Calendar className="text-white" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 lg:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <a
                key={index}
                href={action.href}
                className="group relative overflow-hidden rounded-xl lg:rounded-2xl p-3 lg:p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-medium transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-glow mb-2 lg:mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={16} />
                </div>
                <p className="text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{action.title}</p>
                <ArrowRight className={`absolute bottom-3 lg:bottom-4 right-3 lg:right-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0`} size={14} />
              </a>
            );
          })}
        </div>
      </div>

      {/* Stat Cards */}
      <div>
        <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 lg:mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-card group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] lg:text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 lg:mb-2">{stat.title}</p>
                    <p className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-glow group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="text-white" size={18} />
                  </div>
                </div>
                <div className={`mt-3 lg:mt-4 h-1 rounded-full ${stat.bg} overflow-hidden`}>
                  <div className={`h-full bg-gradient-to-r ${stat.gradient} w-0 group-hover:w-full transition-all duration-700 ease-out`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-4 lg:mb-5">
            <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">Recent Orders</h2>
            <div className="flex items-center gap-2 text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
              <TrendingUp size={12} />
              <span>Latest 5</span>
            </div>
          </div>
          <div className="space-y-2 lg:space-y-3">
            {stats?.latestOrders?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
                    <ShoppingCart className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-xs lg:text-sm text-gray-900 dark:text-gray-100">{order.poNumber}</p>
                    <p className="text-[10px] lg:text-xs text-gray-600 dark:text-gray-400">{order.customer?.name}</p>
                  </div>
                </div>
                <span className={`badge ${
                  order.status === 'COMPLETED' ? 'badge-success' :
                  order.status === 'PENDING' ? 'badge-warning' :
                  order.status === 'CANCELLED' ? 'badge-danger' :
                  'badge-primary'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4 lg:mb-5">
            <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">Recent Activities</h2>
            <div className="flex items-center gap-2 text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
              <Activity size={12} />
              <span>Latest 5</span>
            </div>
          </div>
          <div className="space-y-2 lg:space-y-3">
            {stats?.recentActivities?.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 hover:shadow-sm">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-glow">
                  <Activity className="text-white" size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-xs lg:text-sm text-gray-900 dark:text-gray-100">{activity.action}</p>
                  <p className="text-[10px] lg:text-xs text-gray-600 dark:text-gray-400">{activity.user?.fullName}</p>
                </div>
                <div className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
                  {new Date(activity.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
