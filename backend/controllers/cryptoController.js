const axios = require('axios');
const Card = require('../models/Card');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

// Cache for exchange rates (in-memory, replace with Redis in production)
const rateCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get exchange rates from CoinGecko
const getExchangeRates = async () => {
  const cacheKey = 'exchange_rates';
  const cached = rateCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await axios.get(`${process.env.COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: 'bitcoin,ethereum,solana',
        vs_currencies: 'usd',
        include_market_cap: true,
        include_24hr_vol: true,
      },
    });

    const rates = {
      bitcoin: response.data.bitcoin.usd,
      ethereum: response.data.ethereum.usd,
      solana: response.data.solana.usd,
      timestamp: Date.now(),
    };

    rateCache.set(cacheKey, { data: rates, timestamp: Date.now() });
    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return cached data if available, even if expired
    if (cached) return cached.data;
    throw new Error('Unable to fetch exchange rates');
  }
};

// @desc    Get current exchange rates
// @route   GET /api/crypto/rates
// @access  Public
exports.getExchangeRates = async (req, res, next) => {
  try {
    const rates = await getExchangeRates();

    res.status(200).json({
      success: true,
      rates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exchange rates',
      error: error.message,
    });
  }
};

// @desc    Convert gift card to crypto
// @route   POST /api/crypto/convert
// @access  Private
exports.convertTocrypto = async (req, res, next) => {
  try {
    const { cardId, cryptoType, walletAddress } = req.body;

    // Validate input
    if (!cardId || !cryptoType || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide cardId, cryptoType, and walletAddress',
      });
    }

    // Validate crypto type
    if (!['bitcoin', 'ethereum', 'solana'].includes(cryptoType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid crypto type. Must be bitcoin, ethereum, or solana',
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
        message: 'Not authorized to convert this card',
      });
    }

    // Check card status
    if (card.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Card is ${card.status} and cannot be converted`,
      });
    }

    // Check if card is expired
    if (card.isExpired) {
      return res.status(400).json({
        success: false,
        message: 'Card has expired',
      });
    }

    // Get exchange rates
    const rates = await getExchangeRates();
    const cryptoRate = rates[cryptoType.toLowerCase()];

    if (!cryptoRate) {
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch crypto rate',
      });
    }

    // Calculate conversion
    const usdAmount = card.remainingValue;
    const feePercentage = 2.5; // 2.5% platform fee
    const fee = (usdAmount * feePercentage) / 100;
    const netAmount = usdAmount - fee;
    const cryptoAmount = netAmount / cryptoRate;

    // Create transaction
    const transaction = await Transaction.create({
      transactionId: uuidv4(),
      type: 'card_conversion',
      status: 'pending',
      initiator: req.user._id,
      amount: usdAmount,
      currency: 'USD',
      fee,
      feePercentage,
      netAmount,
      card: card._id,
      cardBrand: card.brand,
      cardDenomination: card.denomination,
      conversion: {
        fromCurrency: 'USD',
        toCurrency: cryptoType.toUpperCase(),
        fromAmount: netAmount,
        toAmount: cryptoAmount,
        exchangeRate: cryptoRate,
        rateTimestamp: new Date(),
      },
      blockchain: {
        network: cryptoType === 'solana' ? 'solana' : 'ethereum',
        walletAddress,
      },
      description: `Convert ${card.brand} gift card to ${cryptoType}`,
    });

    // Update card conversion history
    card.conversionHistory.push({
      timestamp: new Date(),
      fromCurrency: 'USD',
      toCurrency: cryptoType.toUpperCase(),
      fromAmount: usdAmount,
      toAmount: cryptoAmount,
      exchangeRate: cryptoRate,
      fee,
      transactionId: transaction._id,
    });

    // If all value is used, mark card as used
    if (card.remainingValue <= 0) {
      card.status = 'used';
    }

    await card.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalTransactions: 1,
        totalVolume: usdAmount,
        'balance.crypto': cryptoAmount,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Conversion initiated successfully',
      transaction: {
        transactionId: transaction._id,
        status: transaction.status,
        usdAmount,
        fee,
        netAmount,
        cryptoAmount,
        cryptoType,
        walletAddress,
        exchangeRate: cryptoRate,
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error converting to crypto',
      error: error.message,
    });
  }
};

// @desc    Get user's crypto balance
// @route   GET /api/crypto/balance
// @access  Private
exports.getCryptoBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const rates = await getExchangeRates();

    const balances = {
      usd: user.balance.usd,
      crypto: user.balance.crypto,
      cryptoInUsd: user.balance.crypto * rates.bitcoin, // Simplified, should track individual coins
      total: user.balance.usd + user.balance.crypto * rates.bitcoin,
    };

    res.status(200).json({
      success: true,
      balances,
      rates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching crypto balance',
      error: error.message,
    });
  }
};

// @desc    Get conversion history
// @route   GET /api/crypto/history
// @access  Private
exports.getConversionHistory = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      initiator: req.user._id,
      type: 'card_conversion',
    })
      .populate('card', 'brand denomination')
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching conversion history',
      error: error.message,
    });
  }
};

// @desc    Estimate conversion amount
// @route   POST /api/crypto/estimate
// @access  Public
exports.estimateConversion = async (req, res, next) => {
  try {
    const { usdAmount, cryptoType } = req.body;

    if (!usdAmount || !cryptoType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide usdAmount and cryptoType',
      });
    }

    const rates = await getExchangeRates();
    const cryptoRate = rates[cryptoType.toLowerCase()];

    if (!cryptoRate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid crypto type',
      });
    }

    const feePercentage = 2.5;
    const fee = (usdAmount * feePercentage) / 100;
    const netAmount = usdAmount - fee;
    const cryptoAmount = netAmount / cryptoRate;

    res.status(200).json({
      success: true,
      estimate: {
        usdAmount,
        fee,
        feePercentage,
        netAmount,
        cryptoType,
        cryptoAmount,
        exchangeRate: cryptoRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error estimating conversion',
      error: error.message,
    });
  }
};

// @desc    Get transaction status
// @route   GET /api/crypto/transaction/:transactionId
// @access  Private
exports.getTransactionStatus = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId).populate(
      'card',
      'brand denomination'
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Check ownership
    if (transaction.initiator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction',
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message,
    });
  }
};
