import React, { useState, useEffect } from "react";
import LeaveBalance from "../components/Employee/LeaveBalance";
import LeaveApplication from "../components/Employee/LeaveApplication";
import LeaveStatus from "../components/Employee/LeaveStatus";
import { getLeaveBalance, getMyLeaves } from "../services/api";
import "../components/Employee/EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [refresh, setRefresh] = useState(false);

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
      setLeaveBalance({ earnedLeave: 0, sickLeave: 5, casualLeave: 7 });// 5 casual leaves and 7 sick leaves , after 1 year of joining it should be 12 earrned leaves added
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
      <h1>Leave Management System</h1>
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
  );
};

export default EmployeeDashboard;
