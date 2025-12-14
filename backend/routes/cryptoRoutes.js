const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/rates', cryptoController.getExchangeRates);
router.post('/estimate', cryptoController.estimateConversion);

// Protected routes
router.use(protect);
router.post('/convert', cryptoController.convertTocrypto);
router.get('/balance', cryptoController.getCryptoBalance);
router.get('/history', cryptoController.getConversionHistory);
router.get('/transaction/:transactionId', cryptoController.getTransactionStatus);

module.exports = router;
