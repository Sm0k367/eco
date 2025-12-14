import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiTrendingUp, FiShield, FiZap } from 'react-icons/fi';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">GiftCard Exchange</h1>
          <div className="space-x-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Gift Cards Into Crypto
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The easiest way to convert your gift cards to Bitcoin, Ethereum, or Solana. 
            Trade peer-to-peer, earn referral rewards, and support causes you care about.
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 mx-auto text-lg font-semibold"
          >
            <span>Get Started</span>
            <FiArrowRight />
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <FiZap className="text-blue-600 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Instant Conversion</h3>
            <p className="text-gray-600">
              Convert your gift cards to crypto in minutes with real-time exchange rates.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <FiTrendingUp className="text-green-600 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
            <p className="text-gray-600">
              Refer friends and earn 5-12% commission on their transactions.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <FiShield className="text-purple-600 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Secure & Verified</h3>
            <p className="text-gray-600">
              Blockchain-verified transactions with escrow protection for all trades.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-20">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">100K+</p>
            <p className="text-gray-600">Active Users</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-green-600">$10M+</p>
            <p className="text-gray-600">Volume Traded</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">50K+</p>
            <p className="text-gray-600">Transactions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-orange-600">4.8★</p>
            <p className="text-gray-600">User Rating</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16 mt-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of users converting gift cards to crypto every day.
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Start Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
