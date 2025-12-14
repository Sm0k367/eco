import React, { useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const listings = [
    { id: 1, brand: 'Amazon', denomination: 100, price: 95, seller: 'John D.', rating: 4.8 },
    { id: 2, brand: 'Apple', denomination: 50, price: 48, seller: 'Jane S.', rating: 4.9 },
    { id: 3, brand: 'Walmart', denomination: 75, price: 72, seller: 'Mike T.', rating: 4.7 },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Search listings..."
          />
        </div>
        <button className="flex items-center space-x-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          <FiFilter />
          <span>Filter</span>
        </button>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{listing.brand}</h3>
              <span className="text-yellow-500">★ {listing.rating}</span>
            </div>
            <p className="text-gray-600 mb-4">Denomination: ${listing.denomination}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-blue-600">${listing.price}</span>
              <span className="text-sm text-gray-500">{Math.round((listing.price / listing.denomination) * 100)}%</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Seller: {listing.seller}</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
