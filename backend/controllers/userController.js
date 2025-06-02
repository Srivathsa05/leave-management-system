const User = require('../models/User');

class UserController {
  // Get all employees (admin only)
  async getAllEmployees(req, res) {
    try {
      const employees = await User.find({ role: 'employee' })
        .select('-password')
        .sort({ createdAt: -1 });
      
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserController();
