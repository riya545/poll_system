import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BarChart3, Clock, Users, Share2, Copy, CheckCircle, ArrowLeft, Download } from 'lucide-react';
import { pollAPI, voteAPI } from '../services/api';
import { formatDate, formatTimeRemaining, getCategoryColor, generateVoterId, isPollExpired, getPollShareUrl, copyToClipboard, formatNumber } from '../utils/helpers';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const PollResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voterId] = useState(() => generateVoterId());
  const [copied, setCopied] = useState(false);
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    fetchPollResults();
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
  }, [id, fetchPollResults, checkUserVote, handleVoteUpdate]);

  const fetchPollResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await pollAPI.getPollResults(id);
      setPoll(response.data.poll);
      setResults(response.data.results);
    } catch (error) {
      console.error('Error fetching poll results:', error);
      toast.error('Failed to load poll results');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const checkUserVote = useCallback(async () => {
    try {
      const response = await voteAPI.checkUserVote(id, voterId);
      setUserVote(response.data.vote);
    } catch (error) {
      console.error('Error checking user vote:', error);
    }
  }, [id, voterId]);

  const handleVoteUpdate = useCallback((data) => {
    if (data.pollId === id) {
      setResults(data.results);
      setPoll(prev => ({
        ...prev,
        totalVotes: data.totalVotes
      }));
    }
  }, [id]);

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

  const exportResults = () => {
    if (!poll || !results) return;
    
    const csvContent = [
      ['Option', 'Votes', 'Percentage'],
      ...results.map(result => [
        result.text,
        result.votes,
        `${result.percentage}%`
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poll-results-${poll.question.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Results exported successfully!');
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading poll results..." />;
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
  const totalVotes = results.reduce((sum, result) => sum + result.votes, 0);
  const maxVotes = Math.max(...results.map(result => result.votes));

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
                <span>{formatNumber(totalVotes)} votes</span>
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

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2" />
              Poll Results
            </h2>
            
            <button
              onClick={exportResults}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => {
              const isUserVote = userVote && userVote.optionIndex === index;
              const isWinning = result.votes === maxVotes && maxVotes > 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        isUserVote ? 'text-primary-600' : 'text-gray-700'
                      }`}>
                        {result.text}
                      </span>
                      {isUserVote && (
                        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                          Your vote
                        </span>
                      )}
                      {isWinning && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Leading
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">
                        {formatNumber(result.votes)} votes
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.percentage}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${
                        isUserVote 
                          ? 'bg-primary-600' 
                          : isWinning 
                            ? 'bg-green-500' 
                            : 'bg-gray-400'
                      }`}
                      style={{ width: `${result.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{formatNumber(totalVotes)}</div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{results.length}</div>
              <div className="text-sm text-gray-600">Options</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) : 0}%
              </div>
              <div className="text-sm text-gray-600">Avg. Participation</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Link to="/" className="btn-secondary flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Polls</span>
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
              to={`/poll/${id}`}
              className="btn-primary"
            >
              View Poll
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollResults;
