import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getPendingLeaves, updateLeaveStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
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

  const handleDecision = async (leaveId, status) => {
    try {
      await updateLeaveStatus(leaveId, status);
      toast.success(`Leave ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      fetchPendingLeaves(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update leave status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

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
          pendingLeaves.map((leave) => (
            <div key={leave._id} className="leave-request" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24 }}>
              {/* Employee Name */}
              <div style={{ flex: 1 }}>
                <div style={{ background: '#e0e0e0', padding: 8, marginBottom: 4 }}>{leave.userId.name}</div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Reason:</strong> {leave.reason}
                </div>
              </div>
              {/* Leave Type */}
              <div style={{ flex: 1 }}>
                <div style={{ background: '#e0e0e0', padding: 8, marginBottom: 4 }}>{getLeaveTypeName(leave.leaveType)}</div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>Date:</strong> {formatDate(leave.startDate)}
                  {leave.endDate !== leave.startDate && ` to ${formatDate(leave.endDate)}`}
                  {leave.session !== 'fullDay' && ` (${leave.session})`}
                </div>
              </div>
              {/* Approval */}
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <button
                  style={{ background: '#b8e994', border: 'none', padding: '8px 24px', cursor: 'pointer' }}
                  onClick={() => handleDecision(leave._id, 'approved')}
                >
                  Yes
                </button>
                <button
                  style={{ background: '#f8d7da', border: 'none', padding: '8px 24px', cursor: 'pointer' }}
                  onClick={() => handleDecision(leave._id, 'rejected')}
                >
                  No
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
