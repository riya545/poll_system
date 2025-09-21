const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const { validationResult } = require('express-validator');

// Submit a vote
const submitVote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pollId, optionIndex, voterId } = req.body;
    const voterIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Check if poll exists and is active
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.isActive || poll.isExpired()) {
      return res.status(400).json({ message: 'Poll is not active or has expired' });
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option selected' });
    }

    // Check if user has already voted (unless multiple votes are allowed)
    if (!poll.allowMultipleVotes) {
      const existingVote = await Vote.findOne({ pollId, voterId });
      if (existingVote) {
        return res.status(400).json({ message: 'You have already voted on this poll' });
      }
    }

    // Create vote record
    const vote = new Vote({
      pollId,
      optionIndex,
      voterId,
      voterIP,
      userAgent
    });

    await vote.save();

    // Update poll vote count
    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;
    await poll.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(pollId).emit('vote-update', {
        pollId,
        results: poll.getResults(),
        totalVotes: poll.totalVotes
      });
    }

    res.json({
      message: 'Vote submitted successfully',
      vote: {
        id: vote._id,
        pollId: vote.pollId,
        optionIndex: vote.optionIndex,
        timestamp: vote.timestamp
      }
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ message: 'Server error while submitting vote' });
  }
};

// Get votes for a poll
const getPollVotes = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const votes = await Vote.find({ pollId })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v -voterIP -userAgent');

    const total = await Vote.countDocuments({ pollId });

    res.json({
      votes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ message: 'Server error while fetching votes' });
  }
};

// Check if user has voted
const checkUserVote = async (req, res) => {
  try {
    const { pollId, voterId } = req.params;

    const vote = await Vote.findOne({ pollId, voterId });
    
    res.json({
      hasVoted: !!vote,
      vote: vote ? {
        optionIndex: vote.optionIndex,
        timestamp: vote.timestamp
      } : null
    });
  } catch (error) {
    console.error('Error checking user vote:', error);
    res.status(500).json({ message: 'Server error while checking vote' });
  }
};

// Get voting statistics
const getVotingStats = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const totalVotes = await Vote.countDocuments({ pollId });
    const uniqueVoters = await Vote.distinct('voterId', { pollId });
    const votesByOption = await Vote.aggregate([
      { $match: { pollId: poll._id } },
      { $group: { _id: '$optionIndex', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      pollId,
      totalVotes,
      uniqueVoters: uniqueVoters.length,
      votesByOption: votesByOption.map(vote => ({
        optionIndex: vote._id,
        votes: vote.count
      }))
    });
  } catch (error) {
    console.error('Error fetching voting stats:', error);
    res.status(500).json({ message: 'Server error while fetching voting statistics' });
  }
};

module.exports = {
  submitVote,
  getPollVotes,
  checkUserVote,
  getVotingStats
};
