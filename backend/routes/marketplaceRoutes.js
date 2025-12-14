const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/listings', marketplaceController.getListings);
router.get('/listings/:id', marketplaceController.getListing);
router.get('/search', marketplaceController.searchListings);

// Protected routes
router.use(protect);

// Listing management
router.post('/listings', marketplaceController.createListing);
router.put('/listings/:id', marketplaceController.updateListing);
router.delete('/listings/:id', marketplaceController.deleteListing);

// Purchase and transaction
router.post('/listings/:id/purchase', marketplaceController.purchaseListing);
router.post('/listings/:id/confirm', marketplaceController.confirmReceipt);

// Ratings and reviews
router.post('/listings/:id/rate', marketplaceController.rateListing);

// User listings and purchases
router.get('/my-listings', marketplaceController.getMyListings);
router.get('/my-purchases', marketplaceController.getMyPurchases);

// Favorites
router.post('/listings/:id/favorite', marketplaceController.addToFavorites);
router.delete('/listings/:id/favorite', marketplaceController.removeFromFavorites);

module.exports = router;
