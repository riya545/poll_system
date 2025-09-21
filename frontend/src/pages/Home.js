import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, TrendingUp, Users, BarChart3 } from 'lucide-react';
import PollCard from '../components/PollCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { pollAPI } from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPolls, setTotalPolls] = useState(0);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'politics', label: 'Politics' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'technology', label: 'Technology' },
    { value: 'other', label: 'Other' },
  ];

  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        isActive: true,
      };

      const response = await pollAPI.getAllPolls(params);
      setPolls(response.data.polls);
      setTotalPages(response.data.totalPages);
      setTotalPolls(response.data.total);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Implement search functionality here
  };

  const filteredPolls = polls.filter(poll =>
    poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    poll.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Create & Vote on Polls
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Engage with your community by creating interactive polls and getting real-time results
        </p>
        <Link
          to="/create"
          className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-3"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Poll</span>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-800">{totalPolls}</h3>
          <p className="text-gray-600">Total Polls</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-800">
            {polls.reduce((sum, poll) => sum + poll.options.reduce((s, opt) => s + opt.votes, 0), 0)}
          </h3>
          <p className="text-gray-600">Total Votes</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-800">
            {polls.filter(poll => poll.isActive).length}
          </h3>
          <p className="text-gray-600">Active Polls</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search polls..."
                value={searchTerm}
                onChange={handleSearch}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input-field pl-10 appearance-none"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Polls Grid */}
      {loading ? (
        <LoadingSpinner size="large" text="Loading polls..." />
      ) : filteredPolls.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPolls.map(poll => (
              <PollCard key={poll._id} poll={poll} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    page === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No polls found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a poll!'}
          </p>
          <Link to="/create" className="btn-primary">
            Create Your First Poll
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
