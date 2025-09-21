# Poll System - MERN Stack Application

A modern, real-time poll system built with MongoDB, Express.js, React, and Node.js. Create polls, vote on them, and view real-time results with a beautiful, responsive UI.

## Features

- 🗳️ **Create Polls**: Easy-to-use poll creation with multiple options
- 📊 **Real-time Results**: Live vote updates using Socket.io
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 📱 **Mobile Friendly**: Works perfectly on all devices
- 🔒 **Vote Tracking**: Prevents duplicate votes (configurable)
- 📈 **Analytics**: Detailed poll statistics and results
- 🏷️ **Categories & Tags**: Organize polls by category and tags
- ⏰ **Expiration**: Set poll expiration dates
- 📤 **Export**: Export poll results to CSV
- 🔗 **Sharing**: Easy poll sharing with copy-to-clipboard

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd poll-system-mern
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/poll-system
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in your `.env` file.

## Running the Application

### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the backend**
   ```bash
   npm run server
   ```

## API Endpoints

### Polls
- `GET /api/polls` - Get all polls
- `GET /api/polls/:id` - Get poll by ID
- `GET /api/polls/:id/results` - Get poll results
- `POST /api/polls` - Create new poll
- `PUT /api/polls/:id` - Update poll
- `DELETE /api/polls/:id` - Delete poll

### Votes
- `POST /api/votes` - Submit vote
- `GET /api/votes/poll/:pollId` - Get votes for poll
- `GET /api/votes/check/:pollId/:voterId` - Check if user voted
- `GET /api/votes/stats/:pollId` - Get voting statistics

## Project Structure

```
poll-system-mern/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── server.js       # Main server file
│   └── config.env      # Environment variables
├── frontend/
│   ├── public/         # Static files
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── utils/      # Utility functions
│   │   ├── App.js      # Main App component
│   │   └── index.js    # Entry point
│   ├── package.json
│   └── tailwind.config.js
├── package.json        # Root package.json
└── README.md
```

## Usage

1. **Create a Poll**
   - Click "Create New Poll" on the homepage
   - Fill in the poll question, options, and settings
   - Choose category and add tags (optional)
   - Set expiration date (optional)
   - Click "Create Poll"

2. **Vote on Polls**
   - Browse polls on the homepage
   - Click on a poll to view details
   - Select your preferred option
   - Submit your vote

3. **View Results**
   - Click "Results" on any poll
   - See real-time vote counts and percentages
   - Export results to CSV
   - Share poll links

## Features in Detail

### Real-time Updates
- Uses Socket.io for live vote updates
- Results update automatically when new votes are cast
- No need to refresh the page

### Vote Management
- Prevents duplicate votes by default
- Option to allow multiple votes per user
- Tracks voter IP and user agent for analytics

### Poll Categories
- General, Politics, Sports, Entertainment, Technology, Other
- Easy filtering and organization

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interface

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Acknowledgments

- Built with modern web technologies
- Inspired by popular polling platforms
- Uses best practices for security and performance
