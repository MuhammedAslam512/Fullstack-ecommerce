// ─────────────────────────────────────────
// USER MODEL
// ─────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    }
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// HASH PASSWORD BEFORE SAVE
// MUST use regular function, NOT arrow function!
// ─────────────────────────────────────────
userSchema.pre('save', async function () {
  // Only hash if password was changed
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

// ─────────────────────────────────────────
// METHOD: Check if password matches
// MUST use regular function, NOT arrow function!
// ─────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─────────────────────────────────────────
// METHOD: Generate JWT Token
// MUST use regular function, NOT arrow function!
// ─────────────────────────────────────────
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const User = mongoose.model('User', userSchema);
module.exports = User;