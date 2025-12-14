const Referral = require('../models/Referral');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

// Tier configuration
const TIER_CONFIG = {
  bronze: { minReferrals: 0, multiplier: 1.0, commissionRate: 5 },
  silver: { minReferrals: 11, multiplier: 1.4, commissionRate: 7 },
  gold: { minReferrals: 51, multiplier: 2.0, commissionRate: 10 },
  platinum: { minReferrals: 101, multiplier: 2.5, commissionRate: 12 },
};

// @desc    Get referral code
// @route   GET /api/referral/code
// @access  Private
exports.getReferralCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code not found',
      });
    }

    const referralLink = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;

    res.status(200).json({
      success: true,
      referralCode: user.referralCode,
      referralLink,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching referral code',
      error: error.message,
    });
  }
};

// @desc    Regenerate referral code
// @route   POST /api/referral/code/regenerate
// @access  Private
exports.regenerateReferralCode = async (req, res, next) => {
  try {
    const newCode = uuidv4().substring(0, 8).toUpperCase();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { referralCode: newCode },
      { new: true }
    );

    const referralLink = `${process.env.FRONTEND_URL}/register?ref=${newCode}`;

    res.status(200).json({
      success: true,
      message: 'Referral code regenerated',
      referralCode: newCode,
      referralLink,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error regenerating referral code',
      error: error.message,
    });
  }
};

// @desc    Get referral stats
// @route   GET /api/referral/stats
// @access  Private
exports.getReferralStats = async (req, res, next) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id });

    const stats = {
      totalReferrals: referrals.length,
      activeReferrals: referrals.filter((r) => r.status === 'active').length,
      totalEarned: referrals.reduce((sum, r) => sum + r.commission.totalEarned, 0),
      totalWithdrawn: referrals.reduce((sum, r) => sum + r.commission.totalWithdrawn, 0),
      pendingAmount: referrals.reduce((sum, r) => sum + r.commission.pendingAmount, 0),
      totalVolume: referrals.reduce((sum, r) => sum + r.metrics.totalTransactionVolume, 0),
    };

    // Calculate tier
    const tier = calculateTier(stats.totalReferrals);

    res.status(200).json({
      success: true,
      stats,
      tier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching referral stats',
      error: error.message,
    });
  }
};

// @desc    Get referral earnings
// @route   GET /api/referral/earnings
// @access  Private
exports.getReferralEarnings = async (req, res, next) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referredUser', 'firstName lastName email')
      .sort('-createdAt');

    const earnings = referrals.map((r) => ({
      referralId: r._id,
      referredUser: r.referredUser,
      status: r.status,
      totalEarned: r.commission.totalEarned,
      totalWithdrawn: r.commission.totalWithdrawn,
      pendingAmount: r.commission.pendingAmount,
      referredAt: r.referredAt,
    }));

    res.status(200).json({
      success: true,
      count: earnings.length,
      earnings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings',
      error: error.message,
    });
  }
};

// @desc    Get referred users
// @route   GET /api/referral/referrals
// @access  Private
exports.getReferredUsers = async (req, res, next) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referredUser', 'firstName lastName email createdAt')
      .sort('-referredAt');

    res.status(200).json({
      success: true,
      count: referrals.length,
      referrals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching referred users',
      error: error.message,
    });
  }
};

// @desc    Claim signup bonus
// @route   POST /api/referral/claim-bonus
// @access  Private
exports.claimSignupBonus = async (req, res, next) => {
  try {
    // Find referral where user is the referred user
    const referral = await Referral.findOne({ referredUser: req.user._id });

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'No referral found for this user',
      });
    }

    if (referral.signupBonus.claimed) {
      return res.status(400).json({
        success: false,
        message: 'Signup bonus already claimed',
      });
    }

    // Claim bonus
    referral.signupBonus.claimed = true;
    referral.signupBonus.claimedAt = new Date();
    referral.status = 'active';
    referral.activatedAt = new Date();

    await referral.save();

    // Add bonus to user balance
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'balance.usd': referral.signupBonus.amount,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Signup bonus claimed successfully',
      bonusAmount: referral.signupBonus.amount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error claiming bonus',
      error: error.message,
    });
  }
};

// @desc    Withdraw earnings
// @route   POST /api/referral/withdraw
// @access  Private
exports.withdrawEarnings = async (req, res, next) => {
  try {
    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount',
      });
    }

    // Get all referrals for user
    const referrals = await Referral.find({ referrer: req.user._id });
    const totalAvailable = referrals.reduce(
      (sum, r) => sum + (r.commission.totalEarned - r.commission.totalWithdrawn),
      0
    );

    if (amount > totalAvailable) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: $${totalAvailable}`,
      });
    }

    // Create withdrawal record
    const withdrawalId = uuidv4();
    let remainingAmount = amount;

    // Distribute withdrawal across referrals
    for (const referral of referrals) {
      const available = referral.commission.totalEarned - referral.commission.totalWithdrawn;
      if (available > 0 && remainingAmount > 0) {
        const withdrawAmount = Math.min(available, remainingAmount);

        referral.commission.totalWithdrawn += withdrawAmount;
        referral.withdrawals.push({
          withdrawalId,
          amount: withdrawAmount,
          method: method || 'bank_transfer',
          status: 'pending',
          date: new Date(),
        });

        await referral.save();
        remainingAmount -= withdrawAmount;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Withdrawal initiated',
      withdrawalId,
      amount,
      status: 'pending',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error withdrawing earnings',
      error: error.message,
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/referral/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 20, period = 'all' } = req.query;

    // Calculate date range
    let dateFilter = {};
    if (period === 'month') {
      dateFilter = { referredAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    } else if (period === 'week') {
      dateFilter = { referredAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    }

    // Get top referrers
    const referrals = await Referral.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$referrer',
          totalReferrals: { $sum: 1 },
          totalEarned: { $sum: '$commission.totalEarned' },
          totalVolume: { $sum: '$metrics.totalTransactionVolume' },
        },
      },
      { $sort: { totalEarned: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          totalReferrals: 1,
          totalEarned: 1,
          totalVolume: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      period,
      count: referrals.length,
      leaderboard: referrals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message,
    });
  }
};

// Helper function to calculate tier
function calculateTier(totalReferrals) {
  if (totalReferrals >= 101) return 'platinum';
  if (totalReferrals >= 51) return 'gold';
  if (totalReferrals >= 11) return 'silver';
  return 'bronze';
}

// @desc    Process commission (called after transaction)
// @route   POST /api/referral/process-commission (Internal)
// @access  Private
exports.processCommission = async (req, res, next) => {
  try {
    const { userId, transactionAmount } = req.body;

    // Find referral where user is referred
    const referral = await Referral.findOne({ referredUser: userId });

    if (!referral || referral.status !== 'active') {
      return res.status(200).json({
        success: true,
        message: 'No active referral found',
      });
    }

    // Calculate commission
    const tier = calculateTier(referral.metrics.totalReferrals);
    const tierConfig = TIER_CONFIG[tier];
    const commissionAmount = (transactionAmount * tierConfig.commissionRate) / 100;

    // Update referral
    referral.commission.totalEarned += commissionAmount;
    referral.commission.pendingAmount += commissionAmount;
    referral.metrics.totalTransactionVolume += transactionAmount;
    referral.transactions.push({
      transactionId: new mongoose.Types.ObjectId(),
      amount: transactionAmount,
      commission: commissionAmount,
      date: new Date(),
    });

    // Update tier if needed
    const newTier = calculateTier(referral.metrics.totalReferrals);
    if (newTier !== referral.tier) {
      referral.tier = newTier;
      referral.tierMultiplier = TIER_CONFIG[newTier].multiplier;
    }

    await referral.save();

    // Update referrer's earnings
    await User.findByIdAndUpdate(referral.referrer, {
      $inc: {
        referralEarnings: commissionAmount,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Commission processed',
      commission: commissionAmount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing commission',
      error: error.message,
    });
  }
};
