import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Poll API functions
export const pollAPI = {
  // Get all polls
  getAllPolls: (params = {}) => {
    return api.get('/polls', { params });
  },

  // Get poll by ID
  getPollById: (id) => {
    return api.get(`/polls/${id}`);
  },

  // Get poll results
  getPollResults: (id) => {
    return api.get(`/polls/${id}/results`);
  },

  // Create new poll
  createPoll: (pollData) => {
    return api.post('/polls', pollData);
  },

  // Update poll
  updatePoll: (id, pollData) => {
    return api.put(`/polls/${id}`, pollData);
  },

  // Delete poll
  deletePoll: (id) => {
    return api.delete(`/polls/${id}`);
  },
};

// Vote API functions
export const voteAPI = {
  // Submit vote
  submitVote: (voteData) => {
    return api.post('/votes', voteData);
  },

  // Get votes for a poll
  getPollVotes: (pollId, params = {}) => {
    return api.get(`/votes/poll/${pollId}`, { params });
  },

  // Check if user has voted
  checkUserVote: (pollId, voterId) => {
    return api.get(`/votes/check/${pollId}/${voterId}`);
  },

  // Get voting statistics
  getVotingStats: (pollId) => {
    return api.get(`/votes/stats/${pollId}`);
  },
};

export default api;
