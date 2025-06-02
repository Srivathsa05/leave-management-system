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
    default: 12
  },
  sickLeave: {
    type: Number,
    default: 12
  },
  casualLeave: {
    type: Number,
    default: 12
  }
}, {
  timestamps: true
});

// Compound index for user and year
leaveBalanceSchema.index({ userId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
