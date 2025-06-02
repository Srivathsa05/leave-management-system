const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/LMS');

async function createDemoUsers() {
  const users = [
    {
      name: "Demo Employee",
      email: "employee@test.com",
      password: await bcrypt.hash("password123", 12),
      role: "employee",
      employeeId: "EMP001"
    },
    {
      name: "Demo Admin",
      email: "admin@test.com",
      password: await bcrypt.hash("password123", 12),
      role: "admin",
      employeeId: "ADMIN001"
    }
  ];

  for (const userData of users) {
    const exists = await User.findOne({ email: userData.email });
    if (!exists) {
      await User.create(userData);
      console.log(`Created user: ${userData.email}`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }
  mongoose.disconnect();
}

createDemoUsers();
