const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createPoll,
  getAllPolls,
  getPollById,
  getPollResults,
  updatePoll,
  deletePoll
} = require('../controllers/pollController');

// Validation middleware
const pollValidation = [
  body('question')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Question must be between 5 and 500 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('options')
    .isArray({ min: 2, max: 10 })
    .withMessage('Must have between 2 and 10 options'),
  body('options.*')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each option must be between 1 and 200 characters'),
  body('creator')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Creator name is required and must not exceed 100 characters'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date'),
  body('category')
    .optional()
    .isIn(['general', 'politics', 'sports', 'entertainment', 'technology', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 tags allowed'),
  body('tags.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

// Routes
router.post('/', pollValidation, createPoll);
router.get('/', getAllPolls);
router.get('/:id', getPollById);
router.get('/:id/results', getPollResults);
router.put('/:id', updatePoll);
router.delete('/:id', deletePoll);

module.exports = router;
