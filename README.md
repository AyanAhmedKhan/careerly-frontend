# Careerly Frontend

Frontend application for Careerly - An AI-powered professional networking platform built with React, featuring real-time messaging, AI-driven career insights, and modern UI/UX with animations.

## 🚀 Features

- **Modern Authentication**: Secure login/signup with JWT tokens
- **Dynamic Feed**: View, create, and interact with professional posts
- **Emoji Reactions**: React to posts with multiple emoji options (👍 ❤️ 💡 👏 🎉 🤔)
- **Real-time Messaging**: Instant chat with Socket.io integration
- **AI-Powered Features**:
  - Resume analyzer with scoring
  - Career chatbot for personalized advice
  - AI content recommendations
  - Trending topics summary
- **Profile Management**: Complete profile with skills, experience, and education
- **Smart Search**: Search posts and users with live results
- **Notifications**: Real-time notification system
- **Smooth Animations**: Framer Motion powered transitions and effects
- **Responsive Design**: Mobile-first, fully responsive UI

## 🛠️ Tech Stack

- **Framework**: React 18
- **Routing**: React Router DOM v6
- **Styling**: Custom CSS with modern animations
- **State Management**: React Context API + Hooks
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Animations**: Framer Motion, GSAP
- **Icons**: React Icons
- **Notifications**: React Hot Toast
- **Build Tool**: Create React App (react-scripts)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Backend API running (see [careerly-backend](https://github.com/AyanAhmedKhan/careerly-backend))

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AyanAhmedKhan/careerly-frontend.git
   cd careerly-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Backend API URL
   REACT_APP_API_URL=http://localhost:5000/api

   # Socket.io URL (backend URL without /api)
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

   For production (Vercel):
   ```env
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://your-backend.onrender.com
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm start
```
Application will open at `http://localhost:3000`

### Production Build
```bash
npm run build
```
Creates optimized production build in `build/` directory

### Run Tests
```bash
npm test
```

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/
│   │   ├── CareerChatbot.js     # AI career advisor chat
│   │   ├── CreatePost.js        # Post creation component
│   │   ├── Navbar.js            # Navigation bar
│   │   ├── Notifications.js     # Notifications dropdown
│   │   ├── PostCard.js          # Individual post display
│   │   ├── ProfileScore.js      # Profile completion score
│   │   ├── ProfileSections.js   # Profile edit sections
│   │   ├── ReactionButton.js    # Emoji reaction system
│   │   ├── Recommendations.js   # AI recommendations
│   │   └── ResumeAnalyzer.js    # Resume upload & analysis
│   ├── context/
│   │   └── AuthContext.js       # Authentication context
│   ├── pages/
│   │   ├── Feed.js              # Main feed page
│   │   ├── Login.js             # Login page
│   │   ├── Signup.js            # Registration page
│   │   ├── Profile.js           # User profile page
│   │   ├── Messages.js          # Chat/messaging page
│   │   └── Settings.js          # User settings page
│   ├── App.js                   # Main app component
│   ├── App.css                  # Global styles
│   ├── index.js                 # React entry point
│   └── index.css                # Base CSS
├── build/                       # Production build output
├── .env                         # Environment variables (not in repo)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore file
├── vercel.json                  # Vercel deployment config
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🎨 Key Features Breakdown

### Authentication
- JWT token-based authentication
- Persistent login with localStorage
- Protected routes
- Auto-redirect for unauthenticated users

### Feed & Posts
- Create text posts with optional images
- Edit and delete own posts
- Emoji reactions (6 types)
- Comment system
- Trending posts sidebar
- AI-generated feed summary
- Real-time search

### Messaging
- Real-time chat with Socket.io
- Conversation list
- Typing indicators
- Read receipts
- Message timestamps

### AI Integration
- **Resume Analyzer**: Upload resume, get AI analysis & score
- **Career Chatbot**: Ask career questions, get personalized advice
- **Content Suggestions**: AI-powered post ideas
- **Smart Recommendations**: Job and connection suggestions

### Animations
- Page transitions with Framer Motion
- Smooth scroll animations with GSAP
- Split text effects
- Hover and tap interactions
- Loading states with spinners

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import your `careerly-frontend` repository

3. **Configure Build Settings**
   - Framework Preset: **Create React App**
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Add Environment Variables**
   In Vercel Project Settings → Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://your-backend.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will auto-deploy on every push to main

### Manual Deployment

```bash
npm run build
# Deploy the build/ folder to your hosting service
```

## 🔌 API Integration

The frontend connects to the backend API for:

- **Authentication**: Login, signup, token refresh
- **Posts**: CRUD operations, reactions, comments
- **Users**: Profile data, search, suggestions
- **Messages**: Conversations, real-time chat
- **AI**: Resume analysis, career advice, recommendations
- **Notifications**: Real-time updates

Base URL is configured via `REACT_APP_API_URL` environment variable.

## 🎯 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `https://api.careerly.com/api` |
| `REACT_APP_SOCKET_URL` | Socket.io server URL | `https://api.careerly.com` |

## 📝 Available Scripts

- `npm start` - Run development server
- `npm run build` - Create production build
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (one-way operation)

## 🔐 Security Best Practices

- Environment variables for sensitive data
- JWT tokens stored securely in localStorage
- Protected routes with auth middleware
- Input validation on forms
- XSS prevention with React's built-in escaping
- CORS configured on backend
- HTTPS in production

## 🎨 Design Philosophy

- **Clean & Professional**: LinkedIn-inspired UI with modern touches
- **Smooth Animations**: Enhances UX without overwhelming
- **Mobile-First**: Responsive design for all screen sizes
- **Accessibility**: Semantic HTML and ARIA labels
- **Performance**: Code splitting, lazy loading, optimized builds

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in backend `.env`
- Check backend CORS configuration includes your frontend URL

### Socket.io Connection Issues
- Verify `REACT_APP_SOCKET_URL` matches your backend URL
- Check backend Socket.io configuration
- Ensure WebSocket connections aren't blocked by firewall

### Build Failures
- Clear node_modules and package-lock.json, reinstall
- Check for ESLint warnings treated as errors in CI
- Verify all environment variables are set

### API Connection Errors
- Ensure backend is running
- Verify `REACT_APP_API_URL` is correct
- Check browser console for detailed error messages

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Ayan Ahmed Khan**
- GitHub: [@AyanAhmedKhan](https://github.com/AyanAhmedKhan)

## 🙏 Acknowledgments

- React team for the amazing framework
- Vercel for seamless deployment
- Framer Motion for smooth animations
- Socket.io for real-time capabilities

## 🔗 Related Projects

- [Backend Repository](https://github.com/AyanAhmedKhan/careerly-backend)

---

**Live Demo**: [Careerly on Vercel](https://careerly-frontend.vercel.app/feed)

**API Docs**: See [Backend README](https://github.com/AyanAhmedKhan/careerly-backend#readme)
