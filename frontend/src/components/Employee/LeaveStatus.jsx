import React from "react";

const LeaveStatus = ({ leaves }) => (
  <div className="leave-status-section">
    <h2>My Leave Applications</h2>
    {leaves.length > 0 ? (
      <div className="leave-history">
        {leaves.map((leave) => (
          <div key={leave._id} className="leave-item" style={{ marginBottom: 24, padding: 16, border: '1px solid #eee', borderRadius: 6 }}>
            <div className="leave-info" style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
              <span>
                <strong>Type:</strong> {leave.leaveType}
              </span>
              <span>
                <strong>Date:</strong>{" "}
                {new Date(leave.startDate).toLocaleDateString()}
                {leave.endDate && leave.endDate !== leave.startDate
                  ? ` to ${new Date(leave.endDate).toLocaleDateString()}`
                  : ""}
                {leave.session && leave.session !== "fullDay"
                  ? ` (${leave.session})`
                  : ""}
              </span>
              <span>
                <strong>Status:</strong>{" "}
                <span className={`status ${leave.status}`}>{leave.status}</span>
              </span>
            </div>
            <div className="leave-reason" style={{ marginBottom: 4 }}>
              <strong>Reason:</strong> {leave.reason}
            </div>
            {leave.status === "rejected" && leave.rejectionReason && (
              <div
                className="rejection-reason"
                style={{ color: "red", marginTop: 4 }}
              >
                <strong>Rejection Reason:</strong> {leave.rejectionReason}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p>No leave applications found</p>
    )}
  </div>
);

export default LeaveStatus;
