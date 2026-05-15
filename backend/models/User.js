const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skinProfile: {
    skinType: String,
    concerns: [String],
    sensitivity: String,
    routinePreference: String,
  },
  hairProfile: {
    hairType: String,
    hairConcerns: [String],
    scalpCondition: String,
    hairRoutinePreference: String,
  },
  recommendationCount: { type: Number, default: 0 },
  subscription: {
    isActive: { type: Boolean, default: false },
    plan: { type: String, enum: ['free', 'monthly', 'yearly'], default: 'free' },
    startDate: { type: Date },
    endDate: { type: Date },
    paymentId: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
