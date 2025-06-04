import React from "react";

const LeaveStatus = ({ leaves }) => (
  <div className="leave-status-section">
    <h2>My Leave Applications</h2>
    {leaves.length > 0 ? (
      <div className="leave-history">
        {leaves.map((leave) => (
          <div key={leave._id} className="leave-item">
            <div className="leave-info">
              <span>
                <strong>Type:</strong> {leave.leaveType}
              </span>
              <span>
                <strong>Date:</strong>{" "}
                {new Date(leave.startDate).toLocaleDateString()}
              </span>
              <span>
                <strong>Status:</strong>{" "}
                <span className={`status ${leave.status}`}>{leave.status}</span>
              </span>
            </div>
            <div className="leave-reason">{leave.reason}</div>
          </div>
        ))}
      </div>
    ) : (
      <p>No leave applications found</p>
    )}
  </div>
);

export default LeaveStatus;
