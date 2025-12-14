const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const listingSchema = new mongoose.Schema(
  {
    listingId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
      unique: true,
      index: true,
    },
    // Listing Details
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    brand: {
      type: String,
      required: true,
      index: true,
    },
    denomination: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    // Pricing
    askingPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0, // Percentage discount
    },
    pricePercentage: {
      type: Number,
      default: 100, // Percentage of face value
    },
    // Listing Status
    status: {
      type: String,
      enum: ['active', 'sold', 'cancelled', 'expired'],
      default: 'active',
      index: true,
    },
    // Escrow Information
    escrow: {
      isEscrowed: {
        type: Boolean,
        default: false,
      },
      escrowAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      escrowStatus: {
        type: String,
        enum: ['pending', 'held', 'released', 'refunded'],
        default: 'pending',
      },
      escrowAmount: {
        type: Number,
        default: 0,
      },
      escrowReleasedAt: {
        type: Date,
        default: null,
      },
      escrowRefundedAt: {
        type: Date,
        default: null,
      },
    },
    // Transaction Information
    transaction: {
      buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null,
      },
      purchasedAt: {
        type: Date,
        default: null,
      },
      completedAt: {
        type: Date,
        default: null,
      },
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
    // Ratings & Reviews
    rating: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
      ratings: [
        {
          rater: mongoose.Schema.Types.ObjectId,
          rating: Number,
          review: String,
          createdAt: Date,
        },
      ],
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
    // Metadata
    views: {
      type: Number,
      default: 0,
    },
    favorites: {
      type: Number,
      default: 0,
    },
    favoriteUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Expiration
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    // Blockchain
    blockchainVerification: {
      isVerifiedOnChain: {
        type: Boolean,
        default: false,
      },
      blockchainNetwork: String,
      transactionHash: String,
      verificationTimestamp: Date,
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

// Virtual for remaining time
listingSchema.virtual('remainingTime').get(function () {
  if (this.isExpired) return 0;
  return Math.max(0, this.expiresAt - Date.now());
});

// Virtual for is active
listingSchema.virtual('isActive').get(function () {
  return this.status === 'active' && !this.isExpired && this.remainingTime > 0;
});

// Check if listing is expired
listingSchema.pre('save', function (next) {
  if (this.expiresAt < new Date()) {
    this.isExpired = true;
    if (this.status === 'active') {
      this.status = 'expired';
    }
  }
  next();
});

// Indexes for performance
listingSchema.index({ seller: 1, status: 1 });
listingSchema.index({ brand: 1, status: 1 });
listingSchema.index({ status: 1, isExpired: 1 });
listingSchema.index({ 'transaction.buyer': 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ askingPrice: 1 });

module.exports = mongoose.model('Listing', listingSchema);
