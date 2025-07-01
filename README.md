#  Leave Management System (LMS)
A full-stack Leave Management System built using the MERN stack that simplifies the process of requesting, approving, and tracking employee leaves. This system offers user-friendly dashboards for employees and administrators, complete with leave balances, calendars, and approval workflows.

🧰 Key Features
👩‍💼 Employee Features
📤 Apply for Leave: Choose leave type, date range, and reason.

📊 Leave Balance View: Track available Earned, Sick, and Casual leaves.

🗓️ Team Calendar:

Toggle between My Leaves and Team Leaves.

Monthly view with:

✅ Circled dates for your leaves.

🔴 Red numbers indicating employees on leave.

🧑‍🤝‍🧑 Tooltip showing names of team members on leave.

🛠️ Admin Features
📝 Review Requests: Approve or reject pending leave applications.

🧾 Manage Leave Types: Configure leave categories like Sick, Casual, and Earned leave.

👥 Employee Management: View and manage employee leave allocations.

🧪 Tech Stack
Layer	Technology
Frontend	React.js
Backend	Node.js + Express
Database	MongoDB + Mongoose
Calendar UI	react-calendar

🛠️ Installation & Setup
🔁 Clone the Repository
bash
git clone https://github.com/your-username/leave-management-system.git
cd leave-management-system
📦 Backend Setup
bash
cd backend
npm install
⚙️ Configure MongoDB
Make sure MongoDB is running locally or set your connection string in .env or config/db.js.
bash
npm start

🌐 Frontend Setup
bash
cd ../frontend
npm install
npm start
🔧 API Base URL
Update the backend API URL in frontend/src/services/api.js if needed.

🧑‍💻 Usage Guide
👩‍💼 For Employees
🔐 Log in with your credentials.

📈 View leave balance on the dashboard.

📝 Apply for leave with type, date range, and reason.

📅 Use the calendar toggle to switch views:

✅ My Leaves

👥 Team Leaves (with employee name tooltips)

🧑‍💼 For Admins
🔐 Log in as an administrator.

📬 Review and manage all leave requests.

✅ Approve or ❌ reject requests.

⚙️ Manage leave types and allocations for each employee.

📡 API Endpoints
Method	Endpoint	Description
GET	/api/leaves/my-approved?month=YYYY-MM	Get approved leaves of logged-in user
GET	/api/leaves/approved?month=YYYY-MM	Get all approved leaves for the month

leave-management-system/
├── backend/
│   ├── controllers/        # Route handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── config/             # Database config and environment variables
│   ├── server.js           # Entry point for the backend
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components (Employee/Admin)
│   │   ├── services/       # API service files
│   │   ├── App.js          # Main component
│   │   └── index.js        # Entry point
│   ├── public/             # Static files
│   └── package.json
├── .gitignore
├── README.md
└── ...
