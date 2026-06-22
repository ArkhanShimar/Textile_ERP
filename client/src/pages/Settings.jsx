import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();

  const settingsSections = [
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        { label: 'Dark Mode', description: 'Toggle dark/light theme', action: toggleTheme, value: isDark ? 'Enabled' : 'Disabled' }
      ]
    },
    {
      title: 'Account',
      icon: User,
      items: [
        { label: 'Profile Settings', description: 'Update your profile information', action: () => {}, value: 'Manage' },
        { label: 'Change Password', description: 'Update your password', action: () => {}, value: 'Change' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Email Notifications', description: 'Receive email alerts', action: () => {}, value: 'Enabled' },
        { label: 'Push Notifications', description: 'Receive push notifications', action: () => {}, value: 'Enabled' }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'Two-Factor Authentication', description: 'Add extra security to your account', action: () => {}, value: 'Disabled' },
        { label: 'Login History', description: 'View recent login activity', action: () => {}, value: 'View' }
      ]
    },
    {
      title: 'Data',
      icon: Database,
      items: [
        { label: 'Export Data', description: 'Export your data in various formats', action: () => {}, value: 'Export' },
        { label: 'Clear Cache', description: 'Clear application cache', action: () => {}, value: 'Clear' }
      ]
    }
  ];

  return (
    <div className="space-y-4 lg:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center gap-3 mb-3 lg:mb-4">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
                  <Icon className="text-white" size={16} />
                </div>
                <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
                    <div>
                      <p className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100">{item.label}</p>
                      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                    <button
                      onClick={item.action}
                      className="text-[10px] sm:text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      {item.value}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;
