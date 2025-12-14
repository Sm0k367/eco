import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiCreditCard, FiShoppingCart, FiUsers, FiHeart, FiSettings } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/cards', label: 'Gift Cards', icon: FiCreditCard },
    { path: '/marketplace', label: 'Marketplace', icon: FiShoppingCart },
    { path: '/referral', label: 'Referrals', icon: FiUsers },
    { path: '/donations', label: 'Donations', icon: FiHeart },
    { path: '/profile', label: 'Settings', icon: FiSettings },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-400">GiftCard</h2>
        <p className="text-xs text-gray-400">Digital Asset Exchange</p>
      </div>

      <nav className="mt-8 space-y-2 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">Platform Fee</p>
          <p className="text-lg font-bold text-green-400">2.5%</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
