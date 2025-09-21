const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  optionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  voterId: {
    type: String,
    required: true,
    trim: true
  },
  voterIP: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate votes from same voter
voteSchema.index({ pollId: 1, voterId: 1 }, { unique: true });
voteSchema.index({ pollId: 1, voterIP: 1 });

// Method to check if vote is valid
voteSchema.methods.isValid = function() {
  return this.optionIndex >= 0 && this.voterId && this.voterIP;
};

module.exports = mongoose.model('Vote', voteSchema);
