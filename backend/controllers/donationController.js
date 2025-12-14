const Donation = require('../models/Donation');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const BlockchainVerifier = require('../utils/blockchainVerifier');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Cache for exchange rates
const rateCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// Get crypto rates
const getCryptoRates = async () => {
  const cacheKey = 'crypto_rates';
  const cached = rateCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get(`${process.env.COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: 'bitcoin,ethereum,solana',
        vs_currencies: 'usd',
      },
    });

    const rates = {
      bitcoin: response.data.bitcoin.usd,
      ethereum: response.data.ethereum.usd,
      solana: response.data.solana.usd,
    };

    rateCache.set(cacheKey, { data: rates, timestamp: Date.now() });
    return rates;
  } catch (error) {
    console.error('Error fetching crypto rates:', error);
    throw new Error('Unable to fetch exchange rates');
  }
};

// @desc    Create a donation
// @route   POST /api/donations
// @access  Private
exports.createDonation = async (req, res, next) => {
  try {
    const {
      amount,
      cryptoType,
      recipientName,
      recipientAddress,
      recipientDescription,
      impactCategory,
      impactDescription,
      isPublic,
      displayName,
      message,
      isRecurring,
      recurringFrequency,
    } = req.body;

    // Validate input
    if (!amount || !recipientName || !recipientAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount, recipientName, and recipientAddress',
      });
    }

    // Get exchange rate
    const rates = await getCryptoRates();
    const cryptoRate = rates[cryptoType || 'bitcoin'];

    if (!cryptoRate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid crypto type',
      });
    }

    // Calculate crypto amount
    const cryptoAmount = amount / cryptoRate;

    // Create donation
    const donation = await Donation.create({
      donor: req.user._id,
      amount,
      currency: 'USD',
      cryptoType: cryptoType || 'bitcoin',
      cryptoAmount,
      exchangeRate: cryptoRate,
      recipientName,
      recipientAddress,
      recipientDescription: recipientDescription || '',
      impact: {
        category: impactCategory || 'other',
        description: impactDescription || '',
      },
      isPublic: isPublic !== false,
      displayName: displayName || 'Anonymous',
      message: message || '',
      isRecurring: isRecurring || false,
      recurringDetails: isRecurring
        ? {
            frequency: recurringFrequency || 'monthly',
            nextDonationDate: calculateNextDonationDate(recurringFrequency || 'monthly'),
            totalRecurringAmount: amount,
            donationCount: 1,
          }
        : null,
    });

    // Create transaction record
    await Transaction.create({
      type: 'donation',
      status: 'pending',
      initiator: req.user._id,
      amount,
      currency: 'USD',
      netAmount: amount,
      description: `Donation to ${recipientName}`,
      metadata: {
        donationId: donation._id.toString(),
        recipientName,
        impactCategory: impactCategory || 'other',
      },
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalTransactions: 1,
        totalVolume: amount,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      donation,
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating donation',
      error: error.message,
    });
  }
};

// @desc    Get all donations (public)
// @route   GET /api/donations
// @access  Public
exports.getDonations = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20, sort } = req.query;

    const filter = { isPublic: true, status: 'completed' };
    if (category) filter['impact.category'] = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const donations = await Donation.find(filter)
      .populate('donor', 'firstName lastName')
      .sort(sort || '-donatedAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: donations.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message,
    });
  }
};

// @desc    Get user's donations
// @route   GET /api/donations/my-donations
// @access  Private
exports.getMyDonations = async (req, res, next) => {
  try {
    const { status, sort } = req.query;

    const filter = { donor: req.user._id };
    if (status) filter.status = status;

    const donations = await Donation.find(filter).sort(sort || '-donatedAt');

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your donations',
      error: error.message,
    });
  }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Public
exports.getDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id).populate(
      'donor',
      'firstName lastName'
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Check if public or user is donor
    if (!donation.isPublic && donation.donor._id.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this donation',
      });
    }

    res.status(200).json({
      success: true,
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donation',
      error: error.message,
    });
  }
};

// @desc    Get impact metrics
// @route   GET /api/donations/impact/metrics
// @access  Public
exports.getImpactMetrics = async (req, res, next) => {
  try {
    const { category } = req.query;

    const filter = { status: 'completed' };
    if (category) filter['impact.category'] = category;

    const donations = await Donation.find(filter);

    const metrics = {
      totalDonations: donations.length,
      totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
      totalCrypto: donations.reduce((sum, d) => sum + d.cryptoAmount, 0),
      averageDonation: donations.length > 0 ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length : 0,
      byCategory: {},
      topRecipients: [],
    };

    // Group by category
    donations.forEach((d) => {
      const cat = d.impact.category;
      if (!metrics.byCategory[cat]) {
        metrics.byCategory[cat] = { count: 0, amount: 0 };
      }
      metrics.byCategory[cat].count += 1;
      metrics.byCategory[cat].amount += d.amount;
    });

    // Get top recipients
    const recipientMap = {};
    donations.forEach((d) => {
      if (!recipientMap[d.recipientName]) {
        recipientMap[d.recipientName] = { amount: 0, count: 0 };
      }
      recipientMap[d.recipientName].amount += d.amount;
      recipientMap[d.recipientName].count += 1;
    });

    metrics.topRecipients = Object.entries(recipientMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching impact metrics',
      error: error.message,
    });
  }
};

// @desc    Verify donation on blockchain
// @route   POST /api/donations/:id/verify
// @access  Private
exports.verifyDonation = async (req, res, next) => {
  try {
    const { transactionHash, network } = req.body;

    if (!transactionHash || !network) {
      return res.status(400).json({
        success: false,
        message: 'Please provide transactionHash and network',
      });
    }

    let donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Check ownership
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this donation',
      });
    }

    // Verify on blockchain
    let verification;
    if (network === 'solana') {
      verification = await BlockchainVerifier.verifySolanaTransaction(transactionHash);
    } else if (network === 'ethereum') {
      verification = await BlockchainVerifier.verifyEthereumTransaction(transactionHash);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported network',
      });
    }

    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        message: 'Transaction verification failed',
        verification,
      });
    }

    // Update donation
    donation.blockchain.network = network;
    donation.blockchain.transactionHash = transactionHash;
    donation.blockchain.isConfirmed = true;
    donation.blockchain.confirmedAt = new Date();
    donation.blockchain.confirmations = verification.confirmations || 0;
    donation.status = 'completed';
    donation.completedAt = new Date();

    donation = await donation.save();

    // Generate tax receipt
    if (donation.tax.isDeductible && !donation.tax.receiptGenerated) {
      // TODO: Generate PDF receipt
      donation.tax.receiptGenerated = true;
      donation.tax.receiptGeneratedAt = new Date();
      await donation.save();
    }

    res.status(200).json({
      success: true,
      message: 'Donation verified successfully',
      donation,
      verification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying donation',
      error: error.message,
    });
  }
};

// @desc    Generate tax receipt
// @route   GET /api/donations/:id/tax-receipt
// @access  Private
exports.generateTaxReceipt = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    // Check ownership
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this receipt',
      });
    }

    if (!donation.tax.isDeductible) {
      return res.status(400).json({
        success: false,
        message: 'This donation is not tax deductible',
      });
    }

    // TODO: Generate PDF receipt
    const receiptData = {
      donationId: donation._id,
      donor: req.user.fullName,
      amount: donation.amount,
      currency: donation.currency,
      recipient: donation.recipientName,
      date: donation.donatedAt,
      isVerified: donation.blockchain.isConfirmed,
      transactionHash: donation.blockchain.transactionHash,
    };

    res.status(200).json({
      success: true,
      message: 'Tax receipt generated',
      receipt: receiptData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating tax receipt',
      error: error.message,
    });
  }
};

// @desc    Get leaderboard (top donors)
// @route   GET /api/donations/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 20, period = 'all' } = req.query;

    let dateFilter = {};
    if (period === 'month') {
      dateFilter = { donatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    } else if (period === 'week') {
      dateFilter = { donatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    }

    const leaderboard = await Donation.aggregate([
      { $match: { ...dateFilter, isPublic: true, status: 'completed' } },
      {
        $group: {
          _id: '$donor',
          totalDonated: { $sum: '$amount' },
          donationCount: { $sum: 1 },
          totalCrypto: { $sum: '$cryptoAmount' },
        },
      },
      { $sort: { totalDonated: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'donor',
        },
      },
      { $unwind: '$donor' },
      {
        $project: {
          _id: 0,
          donorId: '$_id',
          displayName: '$donor.firstName',
          totalDonated: 1,
          donationCount: 1,
          totalCrypto: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      period,
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message,
    });
  }
};

// Helper function to calculate next donation date
function calculateNextDonationDate(frequency) {
  const now = new Date();
  switch (frequency) {
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'quarterly':
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    case 'yearly':
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}
