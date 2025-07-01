const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const moment = require('moment');

class LeaveController {
  // Calculate leave days
  calculateLeaveDays = (startDate, endDate, session) => {
  const start = moment(startDate);
  const end = moment(endDate);
  let totalDays = 0;

  // Iterate from start to end date (inclusive)
  for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
    const dayOfWeek = m.day(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Weekday: count this day
      totalDays += 1;
    }
  }

  // If session is half-day, count half day for the first day only
  if (session === 'session1' || session === 'session2') {
    // If totalDays is 0 (e.g., leave only on weekend), return 0
    if (totalDays === 0) return 0;
    return totalDays - 1 + 0.5; // First day half, rest full days
  }

  return totalDays;
};


  // Apply for leave
  applyLeave = async (req, res) => {
    try {
      const { leaveType, startDate, endDate, session, reason } = req.body;
      const userId = req.user.id;

      // Validate leaveType explicitly
      const validLeaveTypes = ['earnedLeave', 'sickLeave', 'casualLeave'];
      if (!validLeaveTypes.includes(leaveType)) {
        return res.status(400).json({ message: 'Invalid leave type' });
      }

      // Calculate total days
      const totalDays = this.calculateLeaveDays(startDate, endDate || startDate, session);

      // Fetch user to check joining date
      const user = await User.findById(userId);

      // Check earned leave eligibility
      if (leaveType === 'earnedLeave' && user && user.joiningDate) {
        const joining = new Date(user.joiningDate);
        const now = new Date();
        const years =
          now.getFullYear() -
          joining.getFullYear() -
          (now.getMonth() < joining.getMonth() ||
          (now.getMonth() === joining.getMonth() && now.getDate() < joining.getDate())
            ? 1
            : 0);
        if (years < 1) {
          return res.status(400).json({ message: 'Earned leave not available before completing 1 year' });
        }
      }

      // Fetch leave balance
      const currentYear = new Date().getFullYear();
      const leaveBalance = await LeaveBalance.findOne({ userId, year: currentYear });

      // Log for debugging
      console.log('Leave balance:', leaveBalance);
      console.log('Requested leaveType:', leaveType, 'Total days:', totalDays);

      if (!leaveBalance || leaveBalance[leaveType] == null) {
        return res.status(400).json({ message: `Leave balance for ${leaveType} not found` });
      }

      if (leaveBalance[leaveType] < totalDays) {
        return res.status(400).json({ message: 'Insufficient leave balance' });
      }

      // Create leave application
      const newLeave = new Leave({
        userId,
        leaveType,
        startDate,
        endDate: endDate || startDate,
        session,
        reason,
        totalDays,
      });

      await newLeave.save();
      res.status(201).json({ message: 'Leave application submitted successfully', leave: newLeave });
    } catch (error) {
      console.error('Error in applyLeave:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  // Get pending leaves for admin
  async getPendingLeaves(req, res) {
    try {
      const pendingLeaves = await Leave.find({ status: 'pending' })
        .populate('userId', 'name employeeId')
        .sort({ appliedDate: -1 });
      res.json(pendingLeaves);
    } catch (error) {
      console.error('Error in getPendingLeaves:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get user's leaves
  async getMyLeaves(req, res) {
    try {
      const userId = req.user.id;
      const leaves = await Leave.find({ userId }).sort({ appliedDate: -1 });
      res.json(leaves);
    } catch (error) {
      console.error('Error in getMyLeaves:', error);
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
        leave.rejectionReason = undefined;
      }

      if (status === 'approved') {
  const currentYear = new Date().getFullYear();

  const result = await LeaveBalance.findOneAndUpdate(
    { userId: leave.userId._id, year: currentYear },
    { $inc: { [leave.leaveType]: -leave.totalDays } },
    { new: true, useFindAndModify: false }
  );

  if (!result) {
    console.error('No LeaveBalance document matched for update');
    return res.status(500).json({ message: 'Failed to update leave balance' });
  }


}


      await leave.save();
      res.json({ message: `Leave ${status} successfully`, leave });
    } catch (error) {
      console.error('Error in updateLeaveStatus:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get leave balance (set EL only on creation, not on every fetch)
 async getLeaveBalance(req, res) {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();
    const user = await User.findById(userId);

    let leaveBalance = await LeaveBalance.findOne({ userId, year: currentYear });

    let earnedLeave = 0;
    if (user && user.joiningDate) {
      const joining = new Date(user.joiningDate);
      const now = new Date();
      const years =
        now.getFullYear() -
        joining.getFullYear() -
        (now.getMonth() < joining.getMonth() ||
        (now.getMonth() === joining.getMonth() && now.getDate() < joining.getDate())
          ? 1
          : 0);
      if (years >= 1) {
        earnedLeave = 12;
      }
    }

    if (!leaveBalance) {
      // Create new balance
      leaveBalance = new LeaveBalance({
        userId,
        year: currentYear,
        earnedLeave,
        sickLeave: 12,
        casualLeave: 12,
      });
      await leaveBalance.save();
    } else {
      // Update earnedLeave if it should be higher
      if (earnedLeave > leaveBalance.earnedLeave) {
        leaveBalance.earnedLeave = earnedLeave;
        await leaveBalance.save();
      }
    }

    res.json(leaveBalance);
  } catch (error) {
    console.error('Error in getLeaveBalance:', error);
    res.status(500).json({ message: 'Server error' });
  }
}



  // For fetching the logged-in user's approved leaves for a month
  async getMyApprovedLeaves(req, res) {
    try {
      const userId = req.user.id;
      const { month } = req.query;
      const start = new Date(`${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      const leaves = await Leave.find({
        userId,
        status: 'approved',
        startDate: { $lt: end },
        endDate: { $gte: start },
      });
      res.json(leaves);
    } catch (error) {
      console.error('Error in getMyApprovedLeaves:', error);
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
        endDate: { $gte: start },
      }).populate('userId', 'name');
      res.json(leaves);
    } catch (error) {
      console.error('Error in getAllApprovedLeaves:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new LeaveController();
