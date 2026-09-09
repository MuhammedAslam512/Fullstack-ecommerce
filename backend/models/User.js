// ─────────────────────────────────────────
// USER MODEL (Fullstack Production Version)
// ─────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node module for generating random tokens

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required!'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required!'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email!'
      ]
    },

    password: {
      type: String,
      required: [true, 'Password is required!'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    isActive: {
      type: Boolean,
      default: true
    },

    avatar: {
      type: String,
      default: null
    },

    bio: {
      type: String,
      maxlength: 200,
      default: ''
    },

    // 🔑 FORGOT PASSWORD FIELDS (Added for Day 24):
    resetPasswordToken: {
      type: String,
      select: false
    },

    resetPasswordExpire: {
      type: Date,
      select: false
    }
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// HASH PASSWORD BEFORE SAVE
// ─────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─────────────────────────────────────────
// METHOD: Check if password matches
// ─────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─────────────────────────────────────────
// METHOD: Generate JWT Token
// ─────────────────────────────────────────
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ─────────────────────────────────────────
// METHOD: Generate Reset Password Token (Day 24)
// ─────────────────────────────────────────
userSchema.methods.getResetPasswordToken = function () {
  // 1. Generate a random 20-byte string (e.g. "a1b2c3d4e5f6...")
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 2. Hash the token and save it to MongoDB for security
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Set token expiry time (10 minutes from now)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // 4. Return the UNHASHED token (to send in the email link)
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;