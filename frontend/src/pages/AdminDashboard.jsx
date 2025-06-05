import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPendingLeaves, updateLeaveStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [decision, setDecision] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});
  const { logout } = useAuth();

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const response = await getPendingLeaves();
      setPendingLeaves(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending leaves');
    }
  };

  const handleDecisionChange = (leaveId, status) => {
    setDecision(prev => ({ ...prev, [leaveId]: status }));
    // Clear rejection reason if switching to approved
    if (status === 'approved') {
      setRejectionReasons(prev => ({ ...prev, [leaveId]: '' }));
    }
  };

  const handleReasonChange = (leaveId, value) => {
    setRejectionReasons(prev => ({ ...prev, [leaveId]: value }));
  };

  const handleSubmit = async (leaveId) => {
    const status = decision[leaveId];
    const reason = rejectionReasons[leaveId] || '';

    if (!status) {
      toast.error('Please select Yes or No');
      return;
    }
    if (status === 'rejected' && !reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await updateLeaveStatus(leaveId, status, reason);
      toast.success(`Leave ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      fetchPendingLeaves();
      setDecision(prev => ({ ...prev, [leaveId]: '' }));
      setRejectionReasons(prev => ({ ...prev, [leaveId]: '' }));
    } catch (error) {
      toast.error('Failed to update leave status');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const getLeaveTypeName = (leaveType) => {
    switch(leaveType) {
      case 'earnedLeave': return 'Earned leave';
      case 'sickLeave': return 'Sick leave';
      case 'casualLeave': return 'Casual leave';
      default: return leaveType;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Leave Management System</h1>
        <div>
          <span className="admin-label" style={{ marginRight: 16 }}>Admin</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>
      <div className="pending-leaves">
        <div className="leave-table-header" style={{ display: 'flex', fontWeight: 'bold', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>Emp name</div>
          <div style={{ flex: 1 }}>Type of leave</div>
          <div style={{ flex: 1 }}>Approval</div>
        </div>
        {pendingLeaves.length > 0 ? (
          pendingLeaves
            .filter(leave => leave.userId)
            .map((leave) => (
              <div key={leave._id} className="leave-request" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24 }}>
                {/* Employee Name & Reason */}
                <div style={{ flex: 1 }}>
                  <div style={{ background: '#e0e0e0', padding: 8, marginBottom: 4 }}>
                    {leave.userId?.name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 8 }}>
                    <strong>Reason:</strong> {leave.reason}
                  </div>
                </div>
                {/* Leave Type & Date */}
                <div style={{ flex: 1 }}>
                  <div style={{ background: '#e0e0e0', padding: 8, marginBottom: 4 }}>
                    {getLeaveTypeName(leave.leaveType)}
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 8 }}>
                    <strong>Date:</strong> {formatDate(leave.startDate)}
                    {leave.endDate !== leave.startDate && ` to ${formatDate(leave.endDate)}`}
                    {leave.session !== 'fullDay' && ` (${leave.session})`}
                  </div>
                </div>
                {/* Approval Buttons and Reason */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button
                      style={{
                        background: decision[leave._id] === 'approved' ? '#b8e994' : '#e0e0e0',
                        border: 'none',
                        padding: '8px 24px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDecisionChange(leave._id, 'approved')}
                    >
                      Yes
                    </button>
                    <button
                      style={{
                        background: decision[leave._id] === 'rejected' ? '#f8d7da' : '#e0e0e0',
                        border: 'none',
                        padding: '8px 24px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDecisionChange(leave._id, 'rejected')}
                    >
                      No
                    </button>
                  </div>
                  {/* Show rejection reason field only if No is selected */}
                  {decision[leave._id] === 'rejected' && (
                    <div style={{ marginBottom: 8 }}>
                      <textarea
                        placeholder="Reason for rejection"
                        value={rejectionReasons[leave._id] || ''}
                        onChange={e => handleReasonChange(leave._id, e.target.value)}
                        style={{ width: '100%', minHeight: 40, resize: 'vertical' }}
                        required
                      />
                    </div>
                  )}
                  <button
                    className="approve-btn"
                    onClick={() => handleSubmit(leave._id)}
                    disabled={!decision[leave._id] || (decision[leave._id] === 'rejected' && !rejectionReasons[leave._id])}
                  >
                    Submit Decision
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div className="no-leaves">No pending leave requests</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
