import React, { useState, useEffect } from "react";
import LeaveBalance from "../components/Employee/LeaveBalance";
import LeaveApplication from "../components/Employee/LeaveApplication";
import LeaveStatus from "../components/Employee/LeaveStatus";
import CalendarWithToggle from "../components/Employee/CalendarWithToggle";
import { getLeaveBalance, getMyLeaves } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../components/Employee/EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchLeaveBalance();
    fetchLeaves();
    // eslint-disable-next-line
  }, [refresh]);

  const fetchLeaveBalance = async () => {
    try {
      const res = await getLeaveBalance();
      setLeaveBalance(res.data);
    } catch {
      setLeaveBalance({ earnedLeave: 0, sickLeave: 12, casualLeave: 12 });
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await getMyLeaves();
      setLeaves(res.data);
    } catch {
      setLeaves([]);
    }
  };

  const handleLeaveSubmitted = () => {
    setRefresh((r) => !r);
  };

  return (
    <div className="employee-dashboard">
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Leave Management System</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "32px" }}>
        <div style={{ flex: 2 }}>
          {leaveBalance && (
            <LeaveBalance
              earnedLeave={leaveBalance.earnedLeave}
              sickLeave={leaveBalance.sickLeave}
              casualLeave={leaveBalance.casualLeave}
            />
          )}
          <LeaveApplication onLeaveSubmitted={handleLeaveSubmitted} />
          <LeaveStatus leaves={leaves} />
        </div>
        <div style={{ flex: 1, minWidth: 350 }}>
          <CalendarWithToggle user={user} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
