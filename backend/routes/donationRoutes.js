const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/donations', donationController.getDonations);
router.get('/donations/:id', donationController.getDonation);
router.get('/impact/metrics', donationController.getImpactMetrics);
router.get('/leaderboard', donationController.getLeaderboard);

// Protected routes
router.use(protect);

// Donation management
router.post('/donations', donationController.createDonation);
router.get('/my-donations', donationController.getMyDonations);

// Verification and receipts
router.post('/donations/:id/verify', donationController.verifyDonation);
router.get('/donations/:id/tax-receipt', donationController.generateTaxReceipt);

module.exports = router;
