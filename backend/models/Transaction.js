const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'card_upload',
        'card_conversion',
        'crypto_transfer',
        'marketplace_buy',
        'marketplace_sell',
        'referral_reward',
        'donation',
        'withdrawal',
        'deposit',
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'disputed'],
      default: 'pending',
      index: true,
    },
    // Parties Involved
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Amount Details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    fee: {
      type: Number,
      default: 0,
    },
    feePercentage: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    // Conversion Details (if applicable)
    conversion: {
      fromCurrency: String,
      toCurrency: String,
      fromAmount: Number,
      toAmount: Number,
      exchangeRate: Number,
      rateTimestamp: Date,
    },
    // Card Details (if applicable)
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      default: null,
    },
    cardBrand: String,
    cardDenomination: Number,
    // Marketplace Details (if applicable)
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null,
    },
    // Blockchain Details
    blockchain: {
      network: {
        type: String,
        enum: ['solana', 'ethereum', 'polygon', 'none'],
        default: 'none',
      },
      transactionHash: String,
      blockNumber: Number,
      gasUsed: Number,
      gasPrice: Number,
      contractAddress: String,
      walletAddress: String,
      confirmations: {
        type: Number,
        default: 0,
      },
      isConfirmed: {
        type: Boolean,
        default: false,
      },
      confirmedAt: Date,
    },
    // Referral Details (if applicable)
    referralCode: String,
    referralBonus: {
      type: Number,
      default: 0,
    },
    // Metadata
    description: String,
    notes: String,
    metadata: {
      type: Map,
      of: String,
    },
    // Dispute Information
    dispute: {
      isDisputed: {
        type: Boolean,
        default: false,
      },
      reason: String,
      reportedAt: Date,
      reportedBy: mongoose.Schema.Types.ObjectId,
      status: {
        type: String,
        enum: ['open', 'investigating', 'resolved', 'rejected'],
        default: null,
      },
      resolution: String,
      resolvedAt: Date,
    },
    // Timestamps
    initiatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    failureReason: String,
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

// Virtual for duration
transactionSchema.virtual('duration').get(function () {
  if (!this.completedAt) return null;
  return this.completedAt - this.initiatedAt;
});

// Virtual for is recent (within 24 hours)
transactionSchema.virtual('isRecent').get(function () {
  return Date.now() - this.createdAt < 24 * 60 * 60 * 1000;
});

// Indexes for performance
transactionSchema.index({ initiator: 1, createdAt: -1 });
transactionSchema.index({ recipient: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ 'blockchain.transactionHash': 1 });
transactionSchema.index({ 'blockchain.isConfirmed': 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
