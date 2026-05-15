const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// Available plans
const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 199,
    currency: 'INR',
    duration: 30, // days
    features: [
      'Unlimited AI Recommendations',
      'Personalized Skin Analysis',
      'Morning & Evening Routines',
      'Product Suggestions with Links',
      'Pro Skincare Tips',
    ],
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 1499,
    currency: 'INR',
    duration: 365, // days
    features: [
      'Everything in Monthly',
      'Save 37% vs Monthly',
      'Priority AI Analysis',
      'Seasonal Routine Updates',
      'Exclusive Ingredient Guides',
    ],
    popular: true,
  },
};

// GET /api/subscription/plans — return available plans
router.get('/plans', (req, res) => {
  res.json({ plans: PLANS });
});

// GET /api/subscription/status — return user's subscription status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Check if subscription has expired
    let isActive = user.subscription?.isActive || false;
    if (isActive && user.subscription.endDate && new Date() > new Date(user.subscription.endDate)) {
      // Subscription expired — deactivate it
      await User.findByIdAndUpdate(user._id, {
        'subscription.isActive': false,
        'subscription.plan': 'free',
      });
      isActive = false;
    }

    res.json({
      recommendationCount: user.recommendationCount || 0,
      subscription: {
        isActive,
        plan: isActive ? user.subscription.plan : 'free',
        endDate: user.subscription?.endDate || null,
      },
      freeUsesRemaining: Math.max(0, 1 - (user.recommendationCount || 0)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription status', error: error.message });
  }
});

// POST /api/subscription/activate — activate a subscription (simulated payment)
router.post('/activate', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!PLANS[planId]) {
      return res.status(400).json({ message: 'Invalid plan selected.' });
    }

    const plan = PLANS[planId];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // Simulate a payment ID
    const paymentId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscription: {
          isActive: true,
          plan: planId,
          startDate,
          endDate,
          paymentId,
        },
      },
      { new: true }
    );

    res.json({
      message: 'Subscription activated successfully!',
      subscription: {
        isActive: true,
        plan: planId,
        startDate,
        endDate,
        paymentId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error activating subscription', error: error.message });
  }
});

module.exports = router;
