const express = require('express');
const { body } = require('express-validator');
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Apply leave
router.post('/apply', [
  authMiddleware,
  body('leaveType').isIn(['earnedLeave', 'sickLeave', 'casualLeave']).withMessage('Invalid leave type'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('reason').notEmpty().withMessage('Reason is required')
], leaveController.applyLeave.bind(leaveController));

// Get leave balance
router.get('/balance', authMiddleware, leaveController.getLeaveBalance.bind(leaveController));

// Get my leaves
router.get('/my-leaves', authMiddleware, leaveController.getMyLeaves.bind(leaveController));

// Calendar API routes:
router.get('/my-approved', authMiddleware, leaveController.getMyApprovedLeaves.bind(leaveController));
router.get('/approved', authMiddleware, leaveController.getAllApprovedLeaves.bind(leaveController));

// Get pending leaves (admin only)
router.get('/pending', authMiddleware, adminMiddleware, leaveController.getPendingLeaves.bind(leaveController));

// Update leave status (admin only)
router.put('/update-status', authMiddleware, adminMiddleware, leaveController.updateLeaveStatus.bind(leaveController));

module.exports = router;
