const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const cardSchema = new mongoose.Schema(
  {
    cardId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Card Details
    brand: {
      type: String,
      enum: [
        'Amazon',
        'Apple',
        'Google Play',
        'Walmart',
        'Target',
        'Best Buy',
        'Starbucks',
        'Netflix',
        'Spotify',
        'Steam',
        'PlayStation',
        'Xbox',
        'Nintendo',
        'Uber',
        'DoorDash',
        'Other',
      ],
      required: true,
      index: true,
    },
    denomination: {
      type: Number,
      required: [true, 'Please provide card denomination'],
      min: 1,
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    },
    // Card Code (encrypted in production)
    cardCode: {
      type: String,
      required: true,
      select: false, // Never return by default
    },
    cardCodeHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Card Status
    status: {
      type: String,
      enum: ['active', 'used', 'expired', 'cancelled', 'disputed'],
      default: 'active',
      index: true,
    },
    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationMethod: {
      type: String,
      enum: ['manual', 'api', 'blockchain'],
      default: 'manual',
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Expiration
    expirationDate: {
      type: Date,
      required: true,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    // Marketplace Listing
    isListed: {
      type: Boolean,
      default: false,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null,
    },
    // Conversion History
    conversionHistory: [
      {
        timestamp: Date,
        fromCurrency: String,
        toCurrency: String,
        fromAmount: Number,
        toAmount: Number,
        exchangeRate: Number,
        fee: Number,
        transactionId: String,
      },
    ],
    // Blockchain Integration
    blockchainVerification: {
      isVerifiedOnChain: {
        type: Boolean,
        default: false,
      },
      blockchainNetwork: {
        type: String,
        enum: ['solana', 'ethereum', 'polygon'],
        default: null,
      },
      transactionHash: String,
      verificationTimestamp: Date,
      smartContractAddress: String,
    },
    // Metadata
    source: {
      type: String,
      enum: ['purchased', 'gifted', 'earned', 'other'],
      default: 'purchased',
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    purchasePrice: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      maxlength: 500,
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

// Virtual for remaining value
cardSchema.virtual('remainingValue').get(function () {
  if (this.conversionHistory.length === 0) {
    return this.denomination;
  }
  const totalConverted = this.conversionHistory.reduce(
    (sum, conv) => sum + conv.fromAmount,
    0
  );
  return Math.max(0, this.denomination - totalConverted);
});

// Virtual for age in days
cardSchema.virtual('ageInDays').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Check if card is expired
cardSchema.pre('save', function (next) {
  if (this.expirationDate < new Date()) {
    this.isExpired = true;
    this.status = 'expired';
  }
  next();
});

// Indexes for performance
cardSchema.index({ owner: 1, status: 1 });
cardSchema.index({ brand: 1, status: 1 });
cardSchema.index({ isListed: 1, status: 1 });
cardSchema.index({ createdAt: -1 });
cardSchema.index({ 'blockchainVerification.isVerifiedOnChain': 1 });

module.exports = mongoose.model('Card', cardSchema);
