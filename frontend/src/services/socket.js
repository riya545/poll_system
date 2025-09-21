import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected = false;
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinPoll(pollId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-poll', pollId);
    }
  }

  leavePoll(pollId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-poll', pollId);
    }
  }

  onVoteUpdate(callback) {
    if (this.socket) {
      this.socket.on('vote-update', callback);
    }
  }

  offVoteUpdate(callback) {
    if (this.socket) {
      this.socket.off('vote-update', callback);
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
