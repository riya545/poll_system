const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const { validationResult } = require('express-validator');

// Create a new poll
const createPoll = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { question, description, options, creator, expiresAt, allowMultipleVotes, category, tags } = req.body;

    // Validate options
    if (!options || options.length < 2) {
      return res.status(400).json({ message: 'At least 2 options are required' });
    }

    const poll = new Poll({
      question,
      description,
      options: options.map(option => ({ text: option, votes: 0 })),
      creator,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      allowMultipleVotes: allowMultipleVotes || false,
      category: category || 'general',
      tags: tags || []
    });

    await poll.save();

    res.status(201).json({
      message: 'Poll created successfully',
      poll: {
        id: poll._id,
        question: poll.question,
        description: poll.description,
        options: poll.options,
        creator: poll.creator,
        isActive: poll.isActive,
        expiresAt: poll.expiresAt,
        allowMultipleVotes: poll.allowMultipleVotes,
        category: poll.category,
        tags: poll.tags,
        createdAt: poll.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ message: 'Server error while creating poll' });
  }
};

// Get all polls
const getAllPolls = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isActive = true } = req.query;
    const query = { isActive };

    if (category && category !== 'all') {
      query.category = category;
    }

    const polls = await Poll.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Poll.countDocuments(query);

    res.json({
      polls,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ message: 'Server error while fetching polls' });
  }
};

// Get a single poll by ID
const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.isExpired()) {
      poll.isActive = false;
      await poll.save();
    }

    res.json(poll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ message: 'Server error while fetching poll' });
  }
};

// Get poll results
const getPollResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const results = poll.getResults();
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

    res.json({
      poll: {
        id: poll._id,
        question: poll.question,
        description: poll.description,
        isActive: poll.isActive,
        expiresAt: poll.expiresAt,
        totalVotes
      },
      results
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({ message: 'Server error while fetching poll results' });
  }
};

// Update poll
const updatePoll = async (req, res) => {
  try {
    const { question, description, isActive, expiresAt } = req.body;
    
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (question) poll.question = question;
    if (description !== undefined) poll.description = description;
    if (isActive !== undefined) poll.isActive = isActive;
    if (expiresAt) poll.expiresAt = new Date(expiresAt);

    await poll.save();

    res.json({
      message: 'Poll updated successfully',
      poll
    });
  } catch (error) {
    console.error('Error updating poll:', error);
    res.status(500).json({ message: 'Server error while updating poll' });
  }
};

// Delete poll
const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Also delete all votes for this poll
    await Vote.deleteMany({ pollId: poll._id });
    await Poll.findByIdAndDelete(req.params.id);

    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ message: 'Server error while deleting poll' });
  }
};

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  getPollResults,
  updatePoll,
  deletePoll
};
