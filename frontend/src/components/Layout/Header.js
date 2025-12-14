import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-blue-600">GiftCard Exchange</h1>
        </div>

        <div className="flex items-center space-x-6">
          {user && (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <FiUser size={20} />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition"
              >
                <FiLogOut size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
