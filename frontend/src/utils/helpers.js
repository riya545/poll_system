// Utility functions for the poll system

// Format date to readable string
export const formatDate = (date) => {
  if (!date) return 'No date';
  
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return d.toLocaleDateString();
  }
};

// Format time remaining
export const formatTimeRemaining = (expiresAt) => {
  if (!expiresAt) return null;
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffInSeconds = Math.floor((expiry - now) / 1000);
  
  if (diffInSeconds <= 0) return 'Expired';
  
  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor((diffInSeconds % 86400) / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// Generate unique voter ID
export const generateVoterId = () => {
  return 'voter_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Get category color class
export const getCategoryColor = (category) => {
  const colors = {
    general: 'category-general',
    politics: 'category-politics',
    sports: 'category-sports',
    entertainment: 'category-entertainment',
    technology: 'category-technology',
    other: 'category-other',
  };
  return colors[category] || colors.general;
};

// Validate poll data
export const validatePollData = (pollData) => {
  const errors = [];
  
  if (!pollData.question || pollData.question.trim().length < 5) {
    errors.push('Question must be at least 5 characters long');
  }
  
  if (!pollData.options || pollData.options.length < 2) {
    errors.push('At least 2 options are required');
  }
  
  if (pollData.options) {
    pollData.options.forEach((option, index) => {
      if (!option || option.trim().length === 0) {
        errors.push(`Option ${index + 1} cannot be empty`);
      }
    });
  }
  
  if (!pollData.creator || pollData.creator.trim().length === 0) {
    errors.push('Creator name is required');
  }
  
  return errors;
};

// Calculate poll statistics
export const calculatePollStats = (poll) => {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  
  return {
    totalVotes,
    options: poll.options.map(option => ({
      ...option,
      percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
    }))
  };
};

// Check if poll is expired
export const isPollExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Get poll share URL
export const getPollShareUrl = (pollId) => {
  return `${window.location.origin}/poll/${pollId}`;
};

// Format number with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
