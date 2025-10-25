const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    length: 7
  },
  fullName: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['cse', 'ece', 'mech', 'civil', 'eee', 'it', 'chemical', 'biotech', 'other']
  },
  ken: {
    type: String,
    required: true,
    maxlength: 7,
    uppercase: true,
    trim: true
  },
  foodPreference: {
    type: String,
    required: true
  },
  registrationType: {
    type: String,
    required: true,
    enum: ['single', 'family']
  },
  accommodation: {
    type: String,
    required: true,
    enum: ['yes', 'no']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedNumber: {
    type: String,
    default: null,
    length: 7
  },
  verificationDate: {
    type: Date,
    default: null
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    default: 'user'
  }
}, {
  timestamps: true
});

// Generate unique 7-digit registration number
registrationSchema.statics.generateRegistrationNumber = function() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

// Generate unique 7-digit verified number
registrationSchema.statics.generateVerifiedNumber = function() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

// Method to get department full name
registrationSchema.methods.getDepartmentFullName = function() {
  const departmentMap = {
    'cse': 'Computer Science Engineering (CSE)',
    'ece': 'Electronics & Communication Engineering (ECE)',
    'mech': 'Mechanical Engineering',
    'civil': 'Civil Engineering',
    'eee': 'Electrical & Electronics Engineering (EEE)',
    'it': 'Information Technology',
    'chemical': 'Chemical Engineering',
    'biotech': 'Biotechnology',
    'other': 'Other'
  };
  return departmentMap[this.department] || this.department;
};

module.exports = mongoose.model('Registration', registrationSchema);