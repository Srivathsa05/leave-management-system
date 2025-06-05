const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const moment = require('moment');

class LeaveController {
  // Calculate leave days
  calculateLeaveDays = (startDate, endDate, session) => { 
    const start = moment(startDate);
    const end = moment(endDate);
    const diffDays = end.diff(start, 'days') + 1;
    
    if (session === 'session1' || session === 'session2') {
      return diffDays * 0.5;
    }
    return diffDays;
  }

  // Apply for leave
  applyLeave = async (req, res) => {
    try {
      const { leaveType, startDate, endDate, session, reason } = req.body;
      const userId = req.user.id;

      // Calculate total days
      const totalDays = this.calculateLeaveDays(startDate, endDate || startDate, session);

      // Check leave balance
      const currentYear = new Date().getFullYear();
      const leaveBalance = await LeaveBalance.findOne({ userId, year: currentYear });
      
      if (!leaveBalance || leaveBalance[leaveType] < totalDays) {
        return res.status(400).json({ message: 'Insufficient leave balance' });
      }

      const newLeave = new Leave({
        userId,
        leaveType,
        startDate,
        endDate: endDate || startDate,
        session,
        reason,
        totalDays
      });

      await newLeave.save();
      res.status(201).json({ 
        message: 'Leave application submitted successfully', 
        leave: newLeave 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get pending leaves for admin
  async getPendingLeaves(req, res) {
    try {
      const pendingLeaves = await Leave.find({ status: 'pending' })
        .populate('userId', 'name employeeId')
        .sort({ appliedDate: -1 });
      
      res.json(pendingLeaves);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get user's leaves
  async getMyLeaves(req, res) {
    try {
      const userId = req.user.id;
      const leaves = await Leave.find({ userId })
        .sort({ appliedDate: -1 });
      
      res.json(leaves);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update leave status (admin only)
  async updateLeaveStatus(req, res) {
    try {
      const { leaveId, status, rejectionReason } = req.body;
      const adminId = req.user.id;

      const leave = await Leave.findById(leaveId).populate('userId');
      if (!leave) {
        return res.status(404).json({ message: 'Leave not found' });
      }

      leave.status = status;
      leave.approvedBy = adminId;
      leave.approvedDate = new Date();

      if (status === 'rejected') {
      leave.rejectionReason = rejectionReason || '';
    } else {
      leave.rejectionReason = undefined; // Clear reason if approved
    }

      if (status === 'approved') {
        // Update leave balance
        const currentYear = new Date().getFullYear();
        await LeaveBalance.findOneAndUpdate(
          { userId: leave.userId._id, year: currentYear },
          { $inc: { [leave.leaveType]: -leave.totalDays } }
        );
      }

      await leave.save();
      res.json({ message: `Leave ${status} successfully`, leave });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get leave balance
  async getLeaveBalance(req, res) {
    try {
      const userId = req.user.id;
      const currentYear = new Date().getFullYear();
      
      let leaveBalance = await LeaveBalance.findOne({ userId, year: currentYear });
      
      if (!leaveBalance) {
        // Create new balance for the year
        const previousYearBalance = await LeaveBalance.findOne({ 
          userId, 
          year: currentYear - 1 
        });
        
        leaveBalance = new LeaveBalance({
          userId,
          year: currentYear,
          earnedLeave: previousYearBalance ? previousYearBalance.earnedLeave + 12 : 12,
          sickLeave: 5,
          casualLeave: 7
        });
        
        await leaveBalance.save();
      }
      
      res.json(leaveBalance);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }


// For fetching the logged-in user's approved leaves for a month
async getMyApprovedLeaves(req, res) {
  try {
    const userId = req.user.id;
    const { month } = req.query; // e.g., "2025-01"
    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const leaves = await Leave.find({
      userId,
      status: 'approved',
      startDate: { $lt: end },
      endDate: { $gte: start }
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// For fetching all users' approved leaves for a month
async getAllApprovedLeaves(req, res) {
  try {
    const { month } = req.query;
    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

      const leaves = await Leave.find({
    status: 'approved',
    startDate: { $lt: end },
    endDate: { $gte: start }
    }).populate('userId', 'name');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

}

module.exports = new LeaveController();
