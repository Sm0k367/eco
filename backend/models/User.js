const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
      index: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      minlength: 3,
      maxlength: 30,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false, // Don't return password by default
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    // Wallet Information
    wallet: {
      solanaAddress: {
        type: String,
        unique: true,
        sparse: true,
      },
      solanaPrivateKey: {
        type: String,
        select: false, // Never return this by default
      },
      ethereumAddress: {
        type: String,
        unique: true,
        sparse: true,
      },
      ethereumPrivateKey: {
        type: String,
        select: false,
      },
      walletCreatedAt: {
        type: Date,
        default: null,
      },
    },
    // Account Status
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      sparse: true,
    },
    // KYC (Know Your Customer)
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    kycData: {
      documentType: String,
      documentNumber: String,
      dateOfBirth: Date,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      verifiedAt: Date,
    },
    // Account Security
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Referral System
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referralEarnings: {
      type: Number,
      default: 0,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
    // Account Balance & Stats
    balance: {
      usd: {
        type: Number,
        default: 0,
      },
      crypto: {
        type: Number,
        default: 0,
      },
    },
    totalTransactions: {
      type: Number,
      default: 0,
    },
    totalVolume: {
      type: Number,
      default: 0,
    },
    reputation: {
      rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5,
      },
      reviewCount: {
        type: Number,
        default: 0,
      },
      positiveReviews: {
        type: Number,
        default: 0,
      },
    },
    // Preferences
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    // Account Status
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
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

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account if max attempts reached
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    const lockTime = parseInt(process.env.LOCK_TIME) || 900000; // 15 minutes
    updates.$set = { lockUntil: new Date(Date.now() + lockTime) };
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Index for queries
userSchema.index({ email: 1, status: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ 'wallet.solanaAddress': 1 });
userSchema.index({ 'wallet.ethereumAddress': 1 });

module.exports = mongoose.model('User', userSchema);
