import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { applyLeave } from '../../services/api';

const LeaveApplication = ({ onLeaveSubmitted }) => {
  const [leaveApplication, setLeaveApplication] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    session: 'fullDay',
    reason: ''
  });

  // ✅ Only one definition
  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate || startDate);
    if (end < start) return 0;
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leaveApplication.leaveType || !leaveApplication.startDate || !leaveApplication.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    if (leaveApplication.endDate && new Date(leaveApplication.endDate) < new Date(leaveApplication.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }

    const days = calculateLeaveDays(leaveApplication.startDate, leaveApplication.endDate);

    try {
      await applyLeave({
        ...leaveApplication,
        endDate: leaveApplication.endDate || leaveApplication.startDate,
        leaveDays: days
      });

      toast.success('Leave application submitted successfully');
      setLeaveApplication({
        leaveType: '',
        startDate: '',
        endDate: '',
        session: 'fullDay',
        reason: ''
      });

      onLeaveSubmitted();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave application');
    }
  };

  return (
    <div className="apply-leave-section">
      <h2>Apply leave</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Leave type:</label>
          <select 
            name="leaveType" 
            value={leaveApplication.leaveType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select leave type</option>
            <option value="earnedLeave">Earned Leave</option>
            <option value="sickLeave">Sick Leave</option>
            <option value="casualLeave">Casual Leave</option>
          </select>
        </div>

        <div className="date-section">
          <label>Date:</label>
          <div className="date-inputs">
            <div className="date-group">
              <label>From:</label>
              <input 
                type="date" 
                name="startDate"
                value={leaveApplication.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="date-group">
              <label>To:</label>
              <input 
                type="date" 
                name="endDate"
                value={leaveApplication.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="session-options">
            <div className="session-group">
              <input 
                type="radio" 
                id="session1" 
                name="session" 
                value="session1"
                checked={leaveApplication.session === 'session1'}
                onChange={handleInputChange}
              />
              <label htmlFor="session1">Session -1</label>
            </div>
            <div className="session-group">
              <input 
                type="radio" 
                id="session2" 
                name="session" 
                value="session2"
                checked={leaveApplication.session === 'session2'}
                onChange={handleInputChange}
              />
              <label htmlFor="session2">Session -2</label>
            </div>
            <div className="session-group">
              <input 
                type="radio" 
                id="fullDay" 
                name="session" 
                value="fullDay"
                checked={leaveApplication.session === 'fullDay'}
                onChange={handleInputChange}
              />
              <label htmlFor="fullDay">Full Day</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <textarea 
            placeholder="Reason"
            name="reason"
            value={leaveApplication.reason}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default LeaveApplication;
