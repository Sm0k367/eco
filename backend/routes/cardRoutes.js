const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

// All card routes require authentication
router.use(protect);

// Card CRUD operations
router.post('/', cardController.createCard);
router.get('/', cardController.getCards);
router.get('/:id', cardController.getCard);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

// Card operations
router.post('/:id/verify', cardController.verifyCard);
router.post('/:id/dispute', cardController.reportDispute);
router.get('/:id/history', cardController.getConversionHistory);

module.exports = router;
