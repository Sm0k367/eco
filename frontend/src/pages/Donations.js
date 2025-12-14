import React, { useState } from 'react';
import { FiHeart, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Donations = () => {
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    cryptoType: 'bitcoin',
    recipientName: '',
    impactCategory: 'education',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Donation created successfully!');
    setShowDonationForm(false);
    setFormData({ amount: '', cryptoType: 'bitcoin', recipientName: '', impactCategory: 'education' });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
        <button
          onClick={() => setShowDonationForm(!showDonationForm)}
          className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <FiPlus />
          <span>Make Donation</span>
        </button>
      </div>

      {showDonationForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Make a Donation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USD)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crypto Type</label>
                <select
                  name="cryptoType"
                  value={formData.cryptoType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="bitcoin">Bitcoin</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="solana">Solana</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name</label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Organization name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Impact Category</label>
              <select
                name="impactCategory"
                value={formData.impactCategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="environment">Environment</option>
                <option value="poverty">Poverty Relief</option>
                <option value="disaster">Disaster Relief</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Donate
              </button>
              <button
                type="button"
                onClick={() => setShowDonationForm(false)}
                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Total Donated</p>
          <p className="text-3xl font-bold text-red-600">$5,240</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Donations Made</p>
          <p className="text-3xl font-bold text-gray-900">24</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Lives Impacted</p>
          <p className="text-3xl font-bold text-green-600">1,240</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Verified On-Chain</p>
          <p className="text-3xl font-bold text-blue-600">100%</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <FiHeart className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No donations yet</h3>
        <p className="text-gray-600 mb-6">Make your first donation to support a cause</p>
        <button
          onClick={() => setShowDonationForm(true)}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Make Donation
        </button>
      </div>
    </div>
  );
};

export default Donations;
