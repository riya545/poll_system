const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  options: [optionSchema],
  creator: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['general', 'politics', 'sports', 'entertainment', 'technology', 'other'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
pollSchema.index({ createdAt: -1 });
pollSchema.index({ isActive: 1 });
pollSchema.index({ category: 1 });

// Virtual for poll URL
pollSchema.virtual('url').get(function() {
  return `/polls/${this._id}`;
});

// Method to check if poll is expired
pollSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Method to get poll results
pollSchema.methods.getResults = function() {
  const totalVotes = this.options.reduce((sum, option) => sum + option.votes, 0);
  
  return this.options.map(option => ({
    text: option.text,
    votes: option.votes,
    percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
  }));
};

module.exports = mongoose.model('Poll', pollSchema);
