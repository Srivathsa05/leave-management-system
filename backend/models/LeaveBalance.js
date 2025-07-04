const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  earnedLeave: {
    type: Number,
    default: 0
  },
  sickLeave: {
    type: Number,
    default: 5
  },
  casualLeave: {
    type: Number,
    default: 7
  }
}, {
  timestamps: true
});

// Compound index for user and year
leaveBalanceSchema.index({ userId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
