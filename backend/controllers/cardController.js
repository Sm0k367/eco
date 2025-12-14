const Card = require('../models/Card');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

// Helper function to hash card code
const hashCardCode = (cardCode) => {
  return crypto.createHash('sha256').update(cardCode).digest('hex');
};

// @desc    Upload/Create a gift card
// @route   POST /api/cards
// @access  Private
exports.createCard = async (req, res, next) => {
  try {
    const { brand, denomination, currency, cardCode, expirationDate, source, notes } =
      req.body;

    // Validate input
    if (!brand || !denomination || !cardCode || !expirationDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if card code already exists
    const cardCodeHash = hashCardCode(cardCode);
    const existingCard = await Card.findOne({ cardCodeHash });

    if (existingCard) {
      return res.status(400).json({
        success: false,
        message: 'This card code has already been registered',
      });
    }

    // Create card
    const card = await Card.create({
      owner: req.user._id,
      brand,
      denomination,
      currency: currency || 'USD',
      cardCode,
      cardCodeHash,
      expirationDate: new Date(expirationDate),
      source: source || 'purchased',
      notes,
    });

    // Create transaction record
    await Transaction.create({
      type: 'card_upload',
      status: 'completed',
      initiator: req.user._id,
      amount: denomination,
      currency: currency || 'USD',
      netAmount: denomination,
      card: card._id,
      cardBrand: brand,
      cardDenomination: denomination,
      description: `Uploaded ${brand} gift card`,
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalTransactions: 1,
        totalVolume: denomination,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Gift card uploaded successfully',
      card,
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating card',
      error: error.message,
    });
  }
};

// @desc    Get all cards for user
// @route   GET /api/cards
// @access  Private
exports.getCards = async (req, res, next) => {
  try {
    const { status, brand, sort } = req.query;

    // Build filter
    const filter = { owner: req.user._id };
    if (status) filter.status = status;
    if (brand) filter.brand = brand;

    // Get cards
    const cards = await Card.find(filter)
      .sort(sort || '-createdAt')
      .select('-cardCode'); // Never return card code

    // Calculate stats
    const stats = {
      total: cards.length,
      active: cards.filter((c) => c.status === 'active').length,
      used: cards.filter((c) => c.status === 'used').length,
      expired: cards.filter((c) => c.status === 'expired').length,
      totalValue: cards.reduce((sum, c) => sum + c.denomination, 0),
      totalRemaining: cards.reduce((sum, c) => sum + c.remainingValue, 0),
    };

    res.status(200).json({
      success: true,
      count: cards.length,
      stats,
      cards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cards',
      error: error.message,
    });
  }
};

// @desc    Get single card
// @route   GET /api/cards/:id
// @access  Private
exports.getCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id).select('-cardCode');

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
        message: 'Not authorized to access this card',
      });
    }

    res.status(200).json({
      success: true,
      card,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching card',
      error: error.message,
    });
  }
};

// @desc    Update card
// @route   PUT /api/cards/:id
// @access  Private
exports.updateCard = async (req, res, next) => {
  try {
    const { notes, status } = req.body;

    let card = await Card.findById(req.params.id);

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
        message: 'Not authorized to update this card',
      });
    }

    // Update fields
    if (notes !== undefined) card.notes = notes;
    if (status && ['active', 'used', 'expired', 'cancelled'].includes(status)) {
      card.status = status;
    }

    card = await card.save();

    res.status(200).json({
      success: true,
      message: 'Card updated successfully',
      card,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating card',
      error: error.message,
    });
  }
};

// @desc    Delete card
// @route   DELETE /api/cards/:id
// @access  Private
exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

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
        message: 'Not authorized to delete this card',
      });
    }

    // Can only delete if not listed
    if (card.isListed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a card that is listed on marketplace',
      });
    }

    await Card.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting card',
      error: error.message,
    });
  }
};

// @desc    Verify card authenticity
// @route   POST /api/cards/:id/verify
// @access  Private
exports.verifyCard = async (req, res, next) => {
  try {
    const { verificationMethod } = req.body;

    let card = await Card.findById(req.params.id);

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
        message: 'Not authorized to verify this card',
      });
    }

    // Mark as verified
    card.isVerified = true;
    card.verificationMethod = verificationMethod || 'manual';
    card.verifiedAt = new Date();
    card.verifiedBy = req.user._id;

    card = await card.save();

    res.status(200).json({
      success: true,
      message: 'Card verified successfully',
      card,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying card',
      error: error.message,
    });
  }
};

// @desc    Report card dispute
// @route   POST /api/cards/:id/dispute
// @access  Private
exports.reportDispute = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a dispute reason',
      });
    }

    let card = await Card.findById(req.params.id);

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
        message: 'Not authorized to dispute this card',
      });
    }

    // Create dispute
    card.dispute = {
      isDisputed: true,
      reason,
      reportedAt: new Date(),
      reportedBy: req.user._id,
      status: 'open',
    };

    card.status = 'disputed';
    card = await card.save();

    res.status(200).json({
      success: true,
      message: 'Dispute reported successfully',
      card,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reporting dispute',
      error: error.message,
    });
  }
};

// @desc    Get card conversion history
// @route   GET /api/cards/:id/history
// @access  Private
exports.getConversionHistory = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

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
        message: 'Not authorized to access this card',
      });
    }

    res.status(200).json({
      success: true,
      history: card.conversionHistory,
      totalConverted: card.conversionHistory.reduce(
        (sum, conv) => sum + conv.fromAmount,
        0
      ),
      remaining: card.remainingValue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversion history',
      error: error.message,
    });
  }
};
