const Listing = require('../models/Listing');
const Card = require('../models/Card');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

// @desc    Create a new listing
// @route   POST /api/marketplace/listings
// @access  Private
exports.createListing = async (req, res, next) => {
  try {
    const { cardId, title, description, askingPrice, discount } = req.body;

    // Validate input
    if (!cardId || !title || !askingPrice) {
      return res.status(400).json({
        success: false,
        message: 'Please provide cardId, title, and askingPrice',
      });
    }

    // Get card
    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    // Check ownership
    if (card.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to list this card',
      });
    }

    // Check if card is already listed
    if (card.isListed) {
      return res.status(400).json({
        success: false,
        message: 'Card is already listed',
      });
    }

    // Check card status
    if (card.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Card is ${card.status} and cannot be listed`,
      });
    }

    // Calculate price percentage
    const pricePercentage = (askingPrice / card.denomination) * 100;
    const calculatedDiscount = 100 - pricePercentage;

    // Create listing
    const listing = await Listing.create({
      seller: req.user._id,
      card: card._id,
      title,
      description: description || '',
      brand: card.brand,
      denomination: card.denomination,
      currency: card.currency,
      askingPrice,
      discount: discount || calculatedDiscount,
      pricePercentage,
    });

    // Update card to mark as listed
    card.isListed = true;
    card.listingId = listing._id;
    await card.save();

    // Populate seller info
    await listing.populate('seller', 'firstName lastName reputation');

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating listing',
      error: error.message,
    });
  }
};

// @desc    Get all listings
// @route   GET /api/marketplace/listings
// @access  Public
exports.getListings = async (req, res, next) => {
  try {
    const { brand, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = { status: 'active', isExpired: false };
    if (brand) filter.brand = brand;
    if (minPrice || maxPrice) {
      filter.askingPrice = {};
      if (minPrice) filter.askingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.askingPrice.$lte = parseFloat(maxPrice);
    }

    // Get listings with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const listings = await Listing.find(filter)
      .populate('seller', 'firstName lastName reputation')
      .populate('card', 'brand denomination currency')
      .sort(sort || '-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Listing.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      listings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching listings',
      error: error.message,
    });
  }
};

// @desc    Get single listing
// @route   GET /api/marketplace/listings/:id
// @access  Public
exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'firstName lastName reputation')
      .populate('card', 'brand denomination currency expirationDate')
      .populate('transaction.buyer', 'firstName lastName');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Increment views
    listing.views += 1;
    await listing.save();

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching listing',
      error: error.message,
    });
  }
};

// @desc    Update listing
// @route   PUT /api/marketplace/listings/:id
// @access  Private
exports.updateListing = async (req, res, next) => {
  try {
    const { title, description, askingPrice } = req.body;

    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check ownership
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing',
      });
    }

    // Can only update if not sold
    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${listing.status} listing`,
      });
    }

    // Update fields
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (askingPrice) {
      listing.askingPrice = askingPrice;
      listing.pricePercentage = (askingPrice / listing.denomination) * 100;
      listing.discount = 100 - listing.pricePercentage;
    }

    listing = await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating listing',
      error: error.message,
    });
  }
};

// @desc    Delete listing
// @route   DELETE /api/marketplace/listings/:id
// @access  Private
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check ownership
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing',
      });
    }

    // Can only delete if not sold
    if (listing.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a sold listing',
      });
    }

    // Update card to unlist
    await Card.findByIdAndUpdate(listing.card, {
      isListed: false,
      listingId: null,
    });

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting listing',
      error: error.message,
    });
  }
};

// @desc    Purchase a listing (initiate escrow)
// @route   POST /api/marketplace/listings/:id/purchase
// @access  Private
exports.purchaseListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check if listing is active
    if (!listing.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Listing is not available for purchase',
      });
    }

    // Check if buyer is not seller
    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot purchase your own listing',
      });
    }

    // Check if already purchased
    if (listing.transaction.buyer) {
      return res.status(400).json({
        success: false,
        message: 'Listing has already been purchased',
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      transactionId: uuidv4(),
      type: 'marketplace_buy',
      status: 'pending',
      initiator: req.user._id,
      recipient: listing.seller,
      amount: listing.askingPrice,
      currency: listing.currency,
      fee: (listing.askingPrice * 2.5) / 100, // 2.5% platform fee
      netAmount: listing.askingPrice - (listing.askingPrice * 2.5) / 100,
      listing: listing._id,
      description: `Purchase ${listing.brand} gift card from marketplace`,
    });

    // Update listing with transaction and escrow
    listing.transaction.buyer = req.user._id;
    listing.transaction.transactionId = transaction._id;
    listing.transaction.purchasedAt = new Date();
    listing.escrow.isEscrowed = true;
    listing.escrow.escrowStatus = 'held';
    listing.escrow.escrowAmount = listing.askingPrice;
    listing.status = 'sold';

    await listing.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalTransactions: 1,
        totalVolume: listing.askingPrice,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Purchase initiated. Escrow is now active.',
      transaction: {
        transactionId: transaction._id,
        status: transaction.status,
        amount: listing.askingPrice,
        fee: transaction.fee,
        escrowStatus: listing.escrow.escrowStatus,
      },
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Error purchasing listing',
      error: error.message,
    });
  }
};

// @desc    Confirm receipt (release escrow)
// @route   POST /api/marketplace/listings/:id/confirm
// @access  Private
exports.confirmReceipt = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check if buyer
    if (listing.transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can confirm receipt',
      });
    }

    // Check escrow status
    if (listing.escrow.escrowStatus !== 'held') {
      return res.status(400).json({
        success: false,
        message: 'Escrow is not in held status',
      });
    }

    // Release escrow
    listing.escrow.escrowStatus = 'released';
    listing.escrow.escrowReleasedAt = new Date();
    listing.transaction.completedAt = new Date();

    await listing.save();

    // Update transaction
    await Transaction.findByIdAndUpdate(listing.transaction.transactionId, {
      status: 'completed',
      completedAt: new Date(),
    });

    // Update seller balance
    await User.findByIdAndUpdate(listing.seller, {
      $inc: {
        'balance.usd': listing.escrow.escrowAmount,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Receipt confirmed. Escrow released to seller.',
      listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error confirming receipt',
      error: error.message,
    });
  }
};

// @desc    Rate a transaction
// @route   POST /api/marketplace/listings/:id/rate
// @access  Private
exports.rateListing = async (req, res, next) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5',
      });
    }

    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check if transaction is completed
    if (listing.transaction.completedAt === null) {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed transactions',
      });
    }

    // Check if buyer or seller
    const isBuyer = listing.transaction.buyer.toString() === req.user._id.toString();
    const isSeller = listing.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this listing',
      });
    }

    // Add rating
    listing.rating.ratings.push({
      rater: req.user._id,
      rating,
      review: review || '',
      createdAt: new Date(),
    });

    // Calculate average rating
    const totalRating = listing.rating.ratings.reduce((sum, r) => sum + r.rating, 0);
    listing.rating.averageRating = totalRating / listing.rating.ratings.length;
    listing.rating.totalRatings = listing.rating.ratings.length;

    listing = await listing.save();

    // Update seller reputation
    const sellerRatings = await Listing.find({
      seller: listing.seller,
      'rating.ratings': { $exists: true, $ne: [] },
    });

    const allRatings = sellerRatings.flatMap((l) => l.rating.ratings);
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    const positiveRatings = allRatings.filter((r) => r.rating >= 4).length;

    await User.findByIdAndUpdate(listing.seller, {
      'reputation.rating': avgRating,
      'reputation.reviewCount': allRatings.length,
      'reputation.positiveReviews': positiveRatings,
    });

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rating listing',
      error: error.message,
    });
  }
};

// @desc    Get user's listings
// @route   GET /api/marketplace/my-listings
// @access  Private
exports.getMyListings = async (req, res, next) => {
  try {
    const { status, sort } = req.query;

    const filter = { seller: req.user._id };
    if (status) filter.status = status;

    const listings = await Listing.find(filter)
      .populate('card', 'brand denomination currency')
      .sort(sort || '-createdAt');

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your listings',
      error: error.message,
    });
  }
};

// @desc    Get user's purchases
// @route   GET /api/marketplace/my-purchases
// @access  Private
exports.getMyPurchases = async (req, res, next) => {
  try {
    const purchases = await Listing.find({
      'transaction.buyer': req.user._id,
    })
      .populate('seller', 'firstName lastName reputation')
      .populate('card', 'brand denomination currency')
      .sort('-transaction.purchasedAt');

    res.status(200).json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your purchases',
      error: error.message,
    });
  }
};

// @desc    Search listings
// @route   GET /api/marketplace/search
// @access  Public
exports.searchListings = async (req, res, next) => {
  try {
    const { q, brand, minPrice, maxPrice } = req.query;

    const filter = { status: 'active', isExpired: false };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
      ];
    }

    if (brand) filter.brand = brand;

    if (minPrice || maxPrice) {
      filter.askingPrice = {};
      if (minPrice) filter.askingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.askingPrice.$lte = parseFloat(maxPrice);
    }

    const listings = await Listing.find(filter)
      .populate('seller', 'firstName lastName reputation')
      .populate('card', 'brand denomination currency')
      .limit(50);

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching listings',
      error: error.message,
    });
  }
};

// @desc    Add to favorites
// @route   POST /api/marketplace/listings/:id/favorite
// @access  Private
exports.addToFavorites = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check if already favorited
    if (listing.favoriteUsers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Already added to favorites',
      });
    }

    listing.favoriteUsers.push(req.user._id);
    listing.favorites += 1;
    listing = await listing.save();

    res.status(200).json({
      success: true,
      message: 'Added to favorites',
      listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding to favorites',
      error: error.message,
    });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/marketplace/listings/:id/favorite
// @access  Private
exports.removeFromFavorites = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    listing.favoriteUsers = listing.favoriteUsers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    listing.favorites = Math.max(0, listing.favorites - 1);
    listing = await listing.save();

    res.status(200).json({
      success: true,
      message: 'Removed from favorites',
      listing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing from favorites',
      error: error.message,
    });
  }
};
