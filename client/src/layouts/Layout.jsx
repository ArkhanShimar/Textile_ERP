import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  Users as UsersIcon,
  Package,
  Tag,
  Building2,
  Warehouse,
  FileText,
  Truck,
  Receipt,
  Users as CustomersIcon,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'OFFICE_STAFF'] },
    { path: '/users', icon: UsersIcon, label: 'Users', roles: ['ADMIN'] },
    { path: '/products', icon: Package, label: 'Products', roles: ['ADMIN', 'OFFICE_STAFF'] },
    { path: '/categories', icon: Tag, label: 'Categories', roles: ['ADMIN', 'OFFICE_STAFF'] },
    { path: '/stores', icon: Building2, label: 'Stores', roles: ['ADMIN', 'OFFICE_STAFF'] },
    { path: '/inventory', icon: Warehouse, label: 'Inventory', roles: ['ADMIN', 'OFFICE_STAFF'] },
    { path: '/purchase-orders', icon: FileText, label: 'Purchase Orders', roles: ['ADMIN', 'OFFICE_STAFF'] },
    { path: '/delivery-orders', icon: Truck, label: 'Delivery Orders', roles: ['ADMIN', 'OFFICE_STAFF'] },
    { path: '/invoices', icon: Receipt, label: 'Invoices', roles: ['ADMIN', 'OFFICE_STAFF'] },
    { path: '/customers', icon: CustomersIcon, label: 'Customers', roles: ['ADMIN', 'OFFICE_STAFF'] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['ADMIN', 'OFFICE_STAFF'] },
    { path: '/settings', icon: SettingsIcon, label: 'Settings', roles: ['ADMIN', 'OFFICE_STAFF'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-16'} ${isMobile ? 'translate-x-0' : ''} ${isMobile && !sidebarOpen ? '-translate-x-full' : ''}`}>
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow flex-shrink-0">
              <Package size={18} className="text-white" />
            </div>
            <h1 className={`font-bold text-lg bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent transition-opacity duration-200 ${!sidebarOpen && 'hidden'}`}>
              Textile ERP
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-400'} transition-colors flex-shrink-0`} />
                <span className={`text-xs font-medium transition-opacity duration-200 ${!sidebarOpen && 'hidden'}`}>{item.label}</span>
                {isActive && sidebarOpen && (
                  <ChevronRight size={14} className="ml-auto text-white/80" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200/50 dark:border-gray-700/50 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            {isDark ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
            <span className={`text-xs font-medium transition-opacity duration-200 ${!sidebarOpen && 'hidden'}`}>{isDark ? 'Light' : 'Dark'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all duration-200"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className={`text-xs font-medium transition-opacity duration-200 ${!sidebarOpen && 'hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} ${isMobile ? 'ml-0' : ''}`}>
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 border-b border-gray-200/50 dark:border-gray-700/50 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X size={20} className="text-gray-600 dark:text-gray-400" /> : <Menu size={20} className="text-gray-600 dark:text-gray-400" />}
            </button>
            
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 w-48 lg:w-64 rounded-lg border border-gray-200 bg-gray-50/50 backdrop-blur-sm text-xs focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
              <Bell size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{user?.fullName}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{user?.role}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-glow flex-shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
