import React, { useState } from 'react';
import { FiPlus, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Cards = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    brand: 'Amazon',
    denomination: '',
    cardCode: '',
    expirationDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.success('Gift card uploaded successfully!');
    setShowUploadForm(false);
    setFormData({ brand: 'Amazon', denomination: '', cardCode: '', expirationDate: '' });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Gift Cards</h1>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus />
          <span>Upload Card</span>
        </button>
      </div>

      {showUploadForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Upload Gift Card</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>Amazon</option>
                  <option>Apple</option>
                  <option>Google Play</option>
                  <option>Walmart</option>
                  <option>Target</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Denomination</label>
                <input
                  type="number"
                  name="denomination"
                  value={formData.denomination}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Code</label>
              <input
                type="text"
                name="cardCode"
                value={formData.cardCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
              <input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Upload Card
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <FiUpload className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No gift cards yet</h3>
        <p className="text-gray-600 mb-6">Upload your first gift card to get started</p>
        <button
          onClick={() => setShowUploadForm(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Upload Gift Card
        </button>
      </div>
    </div>
  );
};

export default Cards;
