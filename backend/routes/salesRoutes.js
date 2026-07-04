const express = require('express');
const router = express.Router();
const { createSale, getSales, getSaleById } = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);

module.exports = router;
