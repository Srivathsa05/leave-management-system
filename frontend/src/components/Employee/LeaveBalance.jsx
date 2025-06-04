import React from 'react';

const LeaveBalance = ({ earnedLeave, sickLeave, casualLeave }) => {
  return (
    <div className="leave-balance-section">
      <div className="leave-card">
        <h3>Earned leave</h3>
        <div className="leave-count">{earnedLeave}</div>
      </div>
      <div className="leave-card">
        <h3>Sick leave</h3>
        <div className="leave-count">{sickLeave}</div>
      </div>
      <div className="leave-card">
        <h3>Casual leave</h3>
        <div className="leave-count">{casualLeave}</div>
      </div>
    </div>
  );
};

export default LeaveBalance;
