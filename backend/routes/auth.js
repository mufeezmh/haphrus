const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoServerSelectionError') {
      res.status(503).json({ message: 'Database connection error. Please try again later.' });
    } else if (error.code === 11000) {
      res.status(400).json({ message: 'An account with this email already exists.' });
    } else {
      res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        skinProfile: user.skinProfile,
        recommendationCount: user.recommendationCount || 0,
        subscription: user.subscription || { isActive: false, plan: 'free' },
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

module.exports = router;
