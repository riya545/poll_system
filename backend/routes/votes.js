const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  submitVote,
  getPollVotes,
  checkUserVote,
  getVotingStats
} = require('../controllers/voteController');

// Validation middleware
const voteValidation = [
  body('pollId')
    .isMongoId()
    .withMessage('Valid poll ID is required'),
  body('optionIndex')
    .isInt({ min: 0 })
    .withMessage('Valid option index is required'),
  body('voterId')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Voter ID is required and must not exceed 100 characters')
];

// Routes
router.post('/', voteValidation, submitVote);
router.get('/poll/:pollId', [
  param('pollId').isMongoId().withMessage('Valid poll ID is required')
], getPollVotes);
router.get('/check/:pollId/:voterId', [
  param('pollId').isMongoId().withMessage('Valid poll ID is required'),
  param('voterId').trim().isLength({ min: 1 }).withMessage('Valid voter ID is required')
], checkUserVote);
router.get('/stats/:pollId', [
  param('pollId').isMongoId().withMessage('Valid poll ID is required')
], getVotingStats);

module.exports = router;
