import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BarChart3, Calendar } from 'lucide-react';
import { formatDate, formatTimeRemaining, getCategoryColor, truncateText, isPollExpired } from '../utils/helpers';

const PollCard = ({ poll }) => {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const isExpired = isPollExpired(poll.expiresAt);
  const timeRemaining = formatTimeRemaining(poll.expiresAt);

  return (
    <div className="poll-card fade-in">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {poll.question}
          </h3>
          {poll.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {truncateText(poll.description, 120)}
            </p>
          )}
        </div>
        <div className={`category-badge ${getCategoryColor(poll.category)} ml-2`}>
          {poll.category}
        </div>
      </div>

      {/* Poll Options Preview */}
      <div className="mb-4">
        {poll.options.slice(0, 2).map((option, index) => (
          <div key={index} className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-600 truncate flex-1">
              {truncateText(option.text, 40)}
            </span>
            {totalVotes > 0 && (
              <span className="text-xs text-gray-500 ml-2">
                {option.votes} votes
              </span>
            )}
          </div>
        ))}
        {poll.options.length > 2 && (
          <div className="text-xs text-gray-500 mt-1">
            +{poll.options.length - 2} more options
          </div>
        )}
      </div>

      {/* Poll Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{totalVotes} votes</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(poll.createdAt)}</span>
          </div>
        </div>
        
        {poll.expiresAt && (
          <div className={`flex items-center space-x-1 ${
            isExpired ? 'text-red-500' : 'text-orange-500'
          }`}>
            <Clock className="h-4 w-4" />
            <span>{isExpired ? 'Expired' : timeRemaining}</span>
          </div>
        )}
      </div>

      {/* Poll Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            poll.isActive && !isExpired ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <span className="text-xs text-gray-500">
            {poll.isActive && !isExpired ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/poll/${poll._id}`}
            className="btn-secondary text-xs py-1 px-3"
          >
            Vote
          </Link>
          <Link
            to={`/poll/${poll._id}/results`}
            className="btn-primary text-xs py-1 px-3"
          >
            <BarChart3 className="h-3 w-3 inline mr-1" />
            Results
          </Link>
        </div>
      </div>

      {/* Creator Info */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Created by <span className="font-medium">{poll.creator}</span>
        </p>
      </div>
    </div>
  );
};

export default PollCard;
