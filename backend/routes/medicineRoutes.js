const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getLowStock,
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMedicines);
router.get('/low-stock', getLowStock);
router.get('/:id', getMedicineById);
router.post('/', authorize('admin', 'pharmacist'), createMedicine);
router.put('/:id', authorize('admin', 'pharmacist'), updateMedicine);
router.delete('/:id', authorize('admin'), deleteMedicine);

module.exports = router;
