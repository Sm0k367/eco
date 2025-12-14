const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const donationSchema = new mongoose.Schema(
  {
    donationId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Donation Details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    cryptoType: {
      type: String,
      enum: ['bitcoin', 'ethereum', 'solana'],
      default: 'bitcoin',
    },
    cryptoAmount: {
      type: Number,
      default: 0,
    },
    exchangeRate: {
      type: Number,
      default: 0,
    },
    // Recipient/Cause
    recipientType: {
      type: String,
      enum: ['organization', 'individual', 'cause'],
      default: 'organization',
    },
    recipientName: {
      type: String,
      required: true,
    },
    recipientAddress: {
      type: String,
      required: true,
    },
    recipientDescription: {
      type: String,
      maxlength: 500,
    },
    // Impact Metrics
    impact: {
      category: {
        type: String,
        enum: ['education', 'healthcare', 'environment', 'poverty', 'disaster', 'other'],
        default: 'other',
      },
      description: String,
      estimatedBeneficiaries: Number,
      estimatedImpact: String, // e.g., "Provides 10 meals"
    },
    // Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    // Blockchain Verification
    blockchain: {
      network: {
        type: String,
        enum: ['solana', 'ethereum', 'polygon', 'none'],
        default: 'none',
      },
      transactionHash: String,
      blockNumber: Number,
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
      verificationUrl: String,
    },
    // Tax Information
    tax: {
      isDeductible: {
        type: Boolean,
        default: true,
      },
      taxId: String,
      receiptGenerated: {
        type: Boolean,
        default: false,
      },
      receiptUrl: String,
      receiptGeneratedAt: Date,
    },
    // Recurring Donation
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDetails: {
      frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
        default: null,
      },
      nextDonationDate: Date,
      totalRecurringAmount: Number,
      donationCount: {
        type: Number,
        default: 1,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    // Visibility
    isPublic: {
      type: Boolean,
      default: true,
    },
    displayName: {
      type: String,
      default: 'Anonymous', // Can be custom or "Anonymous"
    },
    // Metadata
    message: {
      type: String,
      maxlength: 500,
    },
    tags: [String],
    // Timestamps
    donatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    confirmedAt: {
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

// Virtual for days since donation
donationSchema.virtual('daysSinceDonation').get(function () {
  return Math.floor((Date.now() - this.donatedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is verified
donationSchema.virtual('isVerified').get(function () {
  return this.blockchain.isConfirmed || this.status === 'completed';
});

// Indexes for performance
donationSchema.index({ donor: 1, donatedAt: -1 });
donationSchema.index({ recipientName: 1 });
donationSchema.index({ 'impact.category': 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ isPublic: 1, donatedAt: -1 });
donationSchema.index({ 'blockchain.transactionHash': 1 });

module.exports = mongoose.model('Donation', donationSchema);
