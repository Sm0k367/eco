import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiDollarSign, FiTrendingUp, FiUsers, FiHeart } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user data
        const userRes = await axios.get(`${API_URL}/auth/me`);
        const userData = userRes.data.user;

        setStats({
          balance: userData.balance?.usd || 0,
          cryptoBalance: userData.balance?.crypto || 0,
          totalTransactions: userData.totalTransactions || 0,
          totalVolume: userData.totalVolume || 0,
          referralEarnings: userData.referralEarnings || 0,
          reputation: userData.reputation?.rating || 5,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_URL]);

  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 600 },
    { name: 'Mar', value: 800 },
    { name: 'Apr', value: 1200 },
    { name: 'May', value: 1600 },
    { name: 'Jun', value: 2000 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
        <p className="text-blue-100">Here's your financial overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">USD Balance</p>
              <p className="text-3xl font-bold text-gray-900">${stats?.balance?.toFixed(2)}</p>
            </div>
            <FiDollarSign className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Crypto Balance</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.cryptoBalance?.toFixed(4)} BTC</p>
            </div>
            <FiTrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Referral Earnings</p>
              <p className="text-3xl font-bold text-gray-900">${stats?.referralEarnings?.toFixed(2)}</p>
            </div>
            <FiUsers className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Reputation</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.reputation?.toFixed(1)}★</p>
            </div>
            <FiHeart className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Transaction Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-bold text-gray-900">{stats?.totalTransactions}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-600">Total Volume</span>
              <span className="font-bold text-gray-900">${stats?.totalVolume?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Account Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <p className="font-semibold text-gray-900">Gift Card Upload</p>
              <p className="text-sm text-gray-600">Amazon $100</p>
            </div>
            <span className="text-green-600 font-semibold">+$100</span>
          </div>
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <p className="font-semibold text-gray-900">Crypto Conversion</p>
              <p className="text-sm text-gray-600">To Bitcoin</p>
            </div>
            <span className="text-blue-600 font-semibold">-$97.50</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Referral Bonus</p>
              <p className="text-sm text-gray-600">From John Doe</p>
            </div>
            <span className="text-purple-600 font-semibold">+$5.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
