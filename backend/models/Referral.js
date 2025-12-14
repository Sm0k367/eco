const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const referralSchema = new mongoose.Schema(
  {
    referralId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    // Status
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    // Signup Bonus
    signupBonus: {
      amount: {
        type: Number,
        default: 10, // $10 default bonus
      },
      claimed: {
        type: Boolean,
        default: false,
      },
      claimedAt: {
        type: Date,
        default: null,
      },
    },
    // Commission Tracking
    commission: {
      rate: {
        type: Number,
        default: 5, // 5% default
      },
      totalEarned: {
        type: Number,
        default: 0,
      },
      totalWithdrawn: {
        type: Number,
        default: 0,
      },
      pendingAmount: {
        type: Number,
        default: 0,
      },
    },
    // Tier System
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    tierMultiplier: {
      type: Number,
      default: 1.0, // 1x for bronze
    },
    // Transaction Tracking
    transactions: [
      {
        transactionId: mongoose.Schema.Types.ObjectId,
        amount: Number,
        commission: Number,
        date: Date,
      },
    ],
    // Withdrawal History
    withdrawals: [
      {
        withdrawalId: String,
        amount: Number,
        method: String,
        status: String,
        date: Date,
      },
    ],
    // Performance Metrics
    metrics: {
      totalReferrals: {
        type: Number,
        default: 1,
      },
      activeReferrals: {
        type: Number,
        default: 1,
      },
      totalTransactionVolume: {
        type: Number,
        default: 0,
      },
      totalCommissionEarned: {
        type: Number,
        default: 0,
      },
      conversionRate: {
        type: Number,
        default: 0,
      },
      averageOrderValue: {
        type: Number,
        default: 0,
      },
    },
    // Dates
    referredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for available balance
referralSchema.virtual('availableBalance').get(function () {
  return this.commission.totalEarned - this.commission.totalWithdrawn;
});

// Virtual for days since referral
referralSchema.virtual('daysSinceReferral').get(function () {
  return Math.floor((Date.now() - this.referredAt) / (1000 * 60 * 60 * 24));
});

// Indexes for performance
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referredUser: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ tier: 1 });
referralSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Referral', referralSchema);
