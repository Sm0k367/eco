const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/leaderboard', referralController.getLeaderboard);

// Protected routes
router.use(protect);

// Referral code management
router.get('/code', referralController.getReferralCode);
router.post('/code/regenerate', referralController.regenerateReferralCode);

// Stats and earnings
router.get('/stats', referralController.getReferralStats);
router.get('/earnings', referralController.getReferralEarnings);
router.get('/referrals', referralController.getReferredUsers);

// Bonus and withdrawals
router.post('/claim-bonus', referralController.claimSignupBonus);
router.post('/withdraw', referralController.withdrawEarnings);

// Internal route for processing commissions
router.post('/process-commission', referralController.processCommission);

module.exports = router;
