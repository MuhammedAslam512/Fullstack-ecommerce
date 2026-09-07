const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

// All user-management routes are admin-only
router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;