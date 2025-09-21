import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BarChart3, Clock, Users, Share2, Copy, CheckCircle } from 'lucide-react';
import { pollAPI, voteAPI } from '../services/api';
import { formatDate, formatTimeRemaining, getCategoryColor, generateVoterId, isPollExpired, getPollShareUrl, copyToClipboard } from '../utils/helpers';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const PollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [voterId] = useState(() => generateVoterId());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPoll();
    checkUserVote();
    
    // Connect to socket for real-time updates
    socketService.connect();
    socketService.joinPoll(id);
    
    // Listen for vote updates
    socketService.onVoteUpdate(handleVoteUpdate);

    return () => {
      socketService.offVoteUpdate(handleVoteUpdate);
      socketService.leavePoll(id);
    };
  }, [id, fetchPoll, checkUserVote, handleVoteUpdate]);

  const fetchPoll = useCallback(async () => {
    try {
      setLoading(true);
      const response = await pollAPI.getPollById(id);
      setPoll(response.data);
    } catch (error) {
      console.error('Error fetching poll:', error);
      toast.error('Failed to load poll');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const checkUserVote = useCallback(async () => {
    try {
      const response = await voteAPI.checkUserVote(id, voterId);
      setHasVoted(response.data.hasVoted);
      setUserVote(response.data.vote);
    } catch (error) {
      console.error('Error checking user vote:', error);
    }
  }, [id, voterId]);

  const handleVoteUpdate = useCallback((data) => {
    if (data.pollId === id) {
      setPoll(prev => ({
        ...prev,
        options: prev.options.map((option, index) => ({
          ...option,
          votes: data.results[index]?.votes || option.votes
        })),
        totalVotes: data.totalVotes
      }));
    }
  }, [id]);

  const handleVote = async () => {
    if (!selectedOption && selectedOption !== 0) {
      toast.error('Please select an option');
      return;
    }

    setVoting(true);
    try {
      await voteAPI.submitVote({
        pollId: id,
        optionIndex: selectedOption,
        voterId: voterId
      });

      setHasVoted(true);
      setUserVote({ optionIndex: selectedOption, timestamp: new Date() });
      toast.success('Vote submitted successfully!');
      
      // Update local poll data
      const updatedPoll = { ...poll };
      updatedPoll.options[selectedOption].votes += 1;
      updatedPoll.totalVotes += 1;
      setPoll(updatedPoll);
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error(error.response?.data?.message || 'Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = getPollShareUrl(id);
    const success = await copyToClipboard(shareUrl);
    
    if (success) {
      setCopied(true);
      toast.success('Poll link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading poll..." />;
  }

  if (!poll) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Poll not found</h2>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  const isExpired = isPollExpired(poll.expiresAt);
  const timeRemaining = formatTimeRemaining(poll.expiresAt);
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Poll Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`category-badge ${getCategoryColor(poll.category)}`}>
                  {poll.category}
                </span>
                <div className={`flex items-center space-x-1 ${
                  isExpired ? 'text-red-500' : poll.isActive ? 'text-green-500' : 'text-gray-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isExpired ? 'bg-red-500' : poll.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm">
                    {isExpired ? 'Expired' : poll.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {poll.question}
              </h1>
              
              {poll.description && (
                <p className="text-gray-600 text-lg mb-4">
                  {poll.description}
                </p>
              )}
            </div>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              {copied ? <CheckCircle className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
              <span className="text-sm">Share</span>
            </button>
          </div>

          {/* Poll Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{totalVotes} votes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Created {formatDate(poll.createdAt)}</span>
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
            
            <div className="text-sm text-gray-500">
              by <span className="font-medium">{poll.creator}</span>
            </div>
          </div>
        </div>

        {/* Voting Section */}
        {!hasVoted && poll.isActive && !isExpired ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cast Your Vote</h2>
            <div className="space-y-3">
              {poll.options.map((option, index) => (
                <div
                  key={index}
                  className={`poll-option ${
                    selectedOption === index ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedOption(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    {selectedOption === index && (
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleVote}
                disabled={voting || selectedOption === null}
                className="btn-primary flex items-center space-x-2"
              >
                {voting ? (
                  <>
                    <div className="spinner h-4 w-4"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Vote</span>
                )}
              </button>
            </div>
          </div>
        ) : hasVoted ? (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You have already voted!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              You voted for: <strong>{poll.options[userVote.optionIndex]?.text}</strong>
            </p>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600">
              {isExpired ? 'This poll has expired.' : 'This poll is not active.'}
            </p>
          </div>
        )}

        {/* Results Preview */}
        {totalVotes > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Current Results
            </h2>
            <div className="space-y-3">
              {poll.options.map((option, index) => {
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                const isUserVote = hasVoted && userVote && userVote.optionIndex === index;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isUserVote ? 'text-primary-600' : 'text-gray-700'}`}>
                        {option.text}
                        {isUserVote && <span className="ml-2 text-xs">(Your vote)</span>}
                      </span>
                      <span className="text-sm text-gray-600">
                        {option.votes} votes ({percentage}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${isUserVote ? 'bg-primary-600' : 'bg-gray-400'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Link to="/" className="btn-secondary">
            Back to Polls
          </Link>
          
          <div className="flex space-x-3">
            <button
              onClick={handleShare}
              className="btn-secondary flex items-center space-x-2"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
            
            <Link
              to={`/poll/${id}/results`}
              className="btn-primary flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>View Results</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollDetails;
