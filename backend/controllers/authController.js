const User = require('../models/User');
const LeaveBalance = require('../models/LeaveBalance');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

class AuthController {
  generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'srivathsa@123', {
      expiresIn: '30d'
    });
  };

  register = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, role, employeeId } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email or employee ID' });
      }

      // Create user
      const user = new User({
        name,
        email,
        password,
        role: role || 'employee',
        employeeId
      });

      await user.save();

      // Create initial leave balance for the current year
      const currentYear = new Date().getFullYear();
      const leaveBalance = new LeaveBalance({
        userId: user._id,
        year: currentYear
      });
      await leaveBalance.save();

      const token = this.generateToken(user._id);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  login = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      console.log(user);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = this.generateToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  getMe = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

module.exports = new AuthController();
