const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Protected routes - admin only
router.get('/employees', authMiddleware, adminMiddleware, userController.getAllEmployees);
router.get('/users', authMiddleware, adminMiddleware, userController.getAllUsers);

module.exports = router;
