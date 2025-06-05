import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getMyApprovedLeaves, getAllApprovedLeaves } from "../../services/api";

const getMonthString = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const CalendarWithToggle = ({ user }) => {
  const [mode, setMode] = useState("mine"); // "mine" or "team"
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [activeMonth, setActiveMonth] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      const month = getMonthString(activeMonth);
      if (mode === "mine") {
        const res = await getMyApprovedLeaves(month);
        setMyLeaves(res.data);
      } else {
        const res = await getAllApprovedLeaves(month);
        setAllLeaves(res.data);
      }
    };
    fetchData();
  }, [mode, activeMonth]);

  // Helper to get all days covered by a leave
  const getLeaveDays = (leave) => {
    const days = [];
    let current = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    while (current <= end) {
      days.push(current.toDateString());
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  // For "mine" mode: days the user is on leave
  const myLeaveDays = new Set(myLeaves.flatMap(getLeaveDays));

  // For "team" mode: map of dateString -> count and names
  const teamLeaveCounts = {};
  const teamLeaveNames = {};
  allLeaves.forEach((leave) => {
    // Try to get the employee name from the leave object (userId.name if populated, fallback to userName or "Unknown")
    const empName = leave.userId?.name || leave.userName || "Unknown";
    getLeaveDays(leave).forEach((day) => {
      teamLeaveCounts[day] = (teamLeaveCounts[day] || 0) + 1;
      if (!teamLeaveNames[day]) teamLeaveNames[day] = [];
      if (!teamLeaveNames[day].includes(empName)) {
        teamLeaveNames[day].push(empName);
      }
    });
  });

  // Circle dates for "my leaves" mode
  const tileClassName = ({ date, view }) => {
    if (view === "month" && mode === "mine" && myLeaveDays.has(date.toDateString())) {
      return "my-leave-day";
    }
    return null;
  };

  // Red number for "team" mode, with tooltip on the entire cell
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toDateString();
    if (mode === "team" && teamLeaveCounts[dateStr]) {
      // The title is set on the outer div, which covers the cell
      return (
        <div
          title={teamLeaveNames[dateStr]?.join(", ")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "auto", // allow hover for tooltip
            zIndex: 3,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 8,
              color: "red",
              fontWeight: "bold",
              fontSize: 13,
              background: "rgba(255,255,255,0.85)",
              borderRadius: "50%",
              minWidth: 16,
              minHeight: 16,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              zIndex: 2,
              pointerEvents: "none",
              cursor: "pointer"
            }}
          >
            {teamLeaveCounts[dateStr]}
          </span>
        </div>
      );
    }
    return null;
  };

  // Custom Toggle Switch (unchanged)
  const ToggleSwitch = ({ checked, onChange }) => (
    <div
      className={`toggle-switch${checked ? " checked" : ""}`}
      onClick={() => onChange(!checked)}
      tabIndex={0}
      role="button"
      aria-pressed={checked}
      style={{ margin: "0 16px", cursor: "pointer" }}
    >
      <div className="toggle-track">
        <div className="toggle-thumb" />
      </div>
      <style>
        {`
        .toggle-switch {
          display: inline-block;
          width: 48px;
          height: 24px;
          vertical-align: middle;
        }
        .toggle-track {
          width: 100%;
          height: 100%;
          background: #eee;
          border-radius: 12px;
          position: relative;
          transition: background 0.2s;
        }
        .toggle-switch.checked .toggle-track {
          background: #2345a7;
        }
        .toggle-thumb {
          width: 22px;
          height: 22px;
          background: #fff;
          border-radius: 50%;
          position: absolute;
          top: 1px;
          left: 2px;
          transition: left 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .toggle-switch.checked .toggle-thumb {
          left: 18px;
        }
        `}
      </style>
    </div>
  );

  return (
    <div style={{ minWidth: 350, background: "#f9f9f9", borderRadius: 10, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <span style={{
          fontWeight: "bold",
          fontSize: 22,
          color: "#2345a7",
          marginRight: 12,
          background: "#3e5ed3",
          borderRadius: 12,
          padding: "8px 32px",
          color: "#fff"
        }}>
          Team Calendar
        </span>
        <span style={{ marginLeft: "auto", fontWeight: "bold", color: "#2345a7" }}>
          My Leaves
        </span>
        <ToggleSwitch
          checked={mode === "team"}
          onChange={(checked) => setMode(checked ? "team" : "mine")}
        />
        <span style={{ fontWeight: "bold", color: "#2345a7" }}>Team</span>
      </div>
      <Calendar
        value={activeMonth}
        onActiveStartDateChange={({ activeStartDate }) => setActiveMonth(activeStartDate)}
        tileClassName={tileClassName}
        tileContent={tileContent}
        showNeighboringMonth={false}
      />
      <div style={{ marginTop: 12, fontSize: 14, color: "#888" }}>
        {mode === "mine"
          ? "Circled days: Your approved leaves"
          : "Red number: Number of employees on leave (hover for names)"}
      </div>
      {/* Custom CSS for circled dates */}
      <style>
        {`
          .my-leave-day {
            position: relative;
            z-index: 1;
          }
          .my-leave-day abbr {
            border: 2px solid #2345a7;
            border-radius: 50%;
            padding: 6px 10px;
            color: #2345a7;
            background: #e6f0ff;
            font-weight: bold;
            display: inline-block;
            min-width: 28px;
            min-height: 28px;
            text-align: center;
          }
          /* Make calendar cells have enough space for the red number */
          .react-calendar__tile {
            position: relative !important;
            overflow: visible !important;
            padding: 14px 0 !important;
          }
        `}
      </style>
    </div>
  );
};

export default CalendarWithToggle;
