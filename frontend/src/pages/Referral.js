import React, { useState } from 'react';
import { FiCopy, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

const Referral = () => {
  const referralCode = 'ABC12345';
  const referralLink = `https://giftcardexchange.com/register?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>

      {/* Referral Code Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Your Referral Code</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-blue-100 mb-2">Share this code with friends:</p>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <p className="text-3xl font-bold text-center">{referralCode}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center space-x-2 bg-white text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition font-semibold"
            >
              <FiCopy />
              <span>Copy Link</span>
            </button>
          </div>
          <div className="flex items-center justify-center">
            <QRCode value={referralLink} size={200} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Total Referrals</p>
          <p className="text-3xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Active Referrals</p>
          <p className="text-3xl font-bold text-gray-900">10</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Total Earned</p>
          <p className="text-3xl font-bold text-green-600">$245.50</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-2">Current Tier</p>
          <p className="text-3xl font-bold text-purple-600">Silver</p>
        </div>
      </div>

      {/* Tier Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
          <FiTrendingUp className="text-blue-600" />
          <span>Tier Benefits</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <p className="font-semibold text-gray-900">Bronze</p>
              <p className="text-sm text-gray-600">0-10 referrals</p>
            </div>
            <span className="text-lg font-bold text-gray-900">5%</span>
          </div>
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <p className="font-semibold text-gray-900">Silver (Current)</p>
              <p className="text-sm text-gray-600">11-50 referrals</p>
            </div>
            <span className="text-lg font-bold text-purple-600">7%</span>
          </div>
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <p className="font-semibold text-gray-900">Gold</p>
              <p className="text-sm text-gray-600">51-100 referrals</p>
            </div>
            <span className="text-lg font-bold text-gray-900">10%</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Platinum</p>
              <p className="text-sm text-gray-600">100+ referrals</p>
            </div>
            <span className="text-lg font-bold text-gray-900">12%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;
