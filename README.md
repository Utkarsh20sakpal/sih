# IoT Multi-Stage Waste Segregator

A production-ready, responsive MERN stack web application for smart waste management using IoT technology. This system provides separate dashboards for Users, Supervisors, and Collectors with comprehensive waste segregation tracking, real-time monitoring, and route optimization.

## 🌟 Features

### User Panel
- **Registration & Authentication**: Email/password and Google OAuth login
- **Dashboard**: Monthly waste segregation accuracy, points tracking, and statistics
- **History**: Complete waste segregation records with filtering
- **Leaderboard**: Ranked by waste amount and segregation efficiency
- **Feedback System**: Submit feedback and track responses

### Supervisor Panel
- **Monitoring Dashboard**: Real-time bin status and collector performance
- **Collector Management**: Assign bins, send instructions, issue memos
- **Bin Management**: Monitor fill levels, status updates, maintenance
- **Feedback Management**: Respond to user feedback and support tickets
- **Analytics**: Collection reports and performance metrics

### Collector Panel
- **Collection Dashboard**: Assigned bins and fill levels
- **Interactive Maps**: Route optimization with color-coded bins
- **Collection Management**: Mark bins as collected, track progress
- **History**: Collection records and performance tracking

### Global Features
- **Responsive Design**: Bootstrap-based UI with smooth transitions
- **Real-time Updates**: Live data from IoT sensors (simulated)
- **Customer Care**: Comprehensive FAQ and support system
- **Security**: JWT authentication, role-based access control
- **Scalable Architecture**: Modular design for easy updates

## 🚀 Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Passport.js** for Google OAuth
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Bootstrap 5** for responsive UI
- **Axios** for API communication
- **React Toastify** for notifications
- **Context API** for state management

### IoT Integration
- **Simulated Sensor Data**: Realistic dummy data for testing
- **Real IoT Code**: Commented integration code for actual hardware
- **RESTful APIs**: For IoT device communication
- **Data Processing**: Sensor data validation and storage

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **Git** (for cloning the repository)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd iot-waste-segregator
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
npm run install-server

# Install client dependencies
npm run install-client
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/iot-waste-segregator

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (varies by system)
# On Windows:
net start MongoDB

# On macOS (with Homebrew):
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod
```

### 5. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

## 🚀 Running the Application

### Development Mode

```bash
# Run both server and client concurrently
npm run dev

# Or run them separately:

# Terminal 1 - Server
npm run server

# Terminal 2 - Client
npm run client
```

### Production Mode

```bash
# Build the client
npm run build

# Start the server
npm start
```

## 📱 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **FAQ API**: http://localhost:5000/api/faq

## 🔐 Default User Accounts

The application creates default users for testing:

### User Account
- **Email**: user@example.com
- **Password**: password123
- **Role**: User

### Supervisor Account
- **Email**: supervisor@example.com
- **Password**: password123
- **Role**: Supervisor

### Collector Account
- **Email**: collector@example.com
- **Password**: password123
- **Role**: Collector

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### User Endpoints
- `GET /api/user/dashboard` - User dashboard data
- `GET /api/user/history` - Waste history
- `GET /api/user/leaderboard` - Leaderboard
- `POST /api/user/feedback` - Submit feedback
- `POST /api/user/segregate` - Simulate waste segregation

### Supervisor Endpoints
- `GET /api/supervisor/dashboard` - Supervisor dashboard
- `GET /api/supervisor/collectors` - Get all collectors
- `PUT /api/supervisor/assign-bins` - Assign bins to collectors
- `POST /api/supervisor/send-instruction` - Send instructions
- `GET /api/supervisor/bins` - Get bin status
- `GET /api/supervisor/feedback` - Get all feedback

### Collector Endpoints
- `GET /api/collector/dashboard` - Collector dashboard
- `GET /api/collector/bins` - Get assigned bins
- `POST /api/collector/optimize-route` - Optimize collection route
- `POST /api/collector/collect-bin` - Mark bin as collected
- `GET /api/collector/history` - Collection history

### IoT Simulation
- `POST /api/iot/simulate` - Simulate IoT sensor data

## 🏗️ Project Structure

```
iot-waste-segregator/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── common/     # Common components
│   │   │   └── layout/     # Layout components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Authentication pages
│   │   │   ├── user/       # User panel pages
│   │   │   ├── supervisor/ # Supervisor panel pages
│   │   │   └── collector/  # Collector panel pages
│   │   └── App.js
│   └── package.json
├── server/                 # Express backend
│   ├── config/            # Configuration files
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## 🔧 IoT Integration

### Real IoT Integration Code

The application includes commented code for real IoT integration:

```javascript
// Real IoT integration would include:
// - Ultrasonic sensors for fill level detection
// - Weight sensors for load measurement
// - Temperature/humidity sensors
// - GPS module for location tracking
// - WiFi/LoRa module for data transmission
// - Battery level monitoring
// - Device health status
// - RFID tag reading
// - Camera-based waste type detection
```

### Simulated Data

For development and testing, the application uses realistic dummy data that simulates:
- Sensor readings from waste bins
- Fill level calculations
- Waste type detection accuracy
- GPS coordinates
- Device status updates

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes
- **Smooth Animations**: CSS transitions and hover effects
- **Loading States**: Spinners and progress indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback
- **Interactive Maps**: For collector route planning
- **Data Visualization**: Charts and progress bars

## 🧪 Testing

### Manual Testing

1. **User Registration/Login**: Test all authentication flows
2. **Dashboard Functionality**: Verify data display and interactions
3. **Waste Segregation**: Test the simulation feature
4. **Role-based Access**: Ensure proper permissions
5. **Responsive Design**: Test on different screen sizes

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","userType":"user"}'
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/iot-waste-segregator
JWT_SECRET=your-production-jwt-secret
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
CLIENT_URL=https://your-domain.com
```

### Deployment Steps

1. **Build the client**:
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to your preferred platform**:
   - Heroku
   - AWS
   - DigitalOcean
   - Vercel (for frontend)
   - Railway

3. **Configure environment variables** on your hosting platform

4. **Set up MongoDB Atlas** for production database

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Proper cross-origin resource sharing
- **Helmet**: Security headers
- **Role-based Access**: Granular permission system

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Large dataset handling
- **Lazy Loading**: Component-based code splitting
- **Caching**: Efficient data caching strategies
- **Compression**: Gzip compression for responses

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use**:
   - Change PORT in `.env` file
   - Kill existing processes using the port

3. **Google OAuth Not Working**:
   - Verify client ID and secret
   - Check redirect URI configuration
   - Ensure Google+ API is enabled

4. **Build Errors**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=*
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Bootstrap** for the responsive UI framework
- **React** for the frontend library
- **Express.js** for the backend framework
- **MongoDB** for the database
- **Passport.js** for authentication
- **IoT Community** for inspiration and best practices

## 📞 Support

For support and questions:

- **Email**: support@wastesegregator.com
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue in the repository

## 🔮 Future Enhancements

- **Real-time Notifications**: WebSocket integration
- **Mobile App**: React Native application
- **Advanced Analytics**: Machine learning insights
- **Blockchain Integration**: Transparent waste tracking
- **AI-powered Optimization**: Smart route planning
- **Multi-language Support**: Internationalization
- **Voice Commands**: Hands-free operation
- **AR/VR Integration**: Immersive management interface

---

**Made with ❤️ for a cleaner planet** 🌍

This IoT waste segregator system represents a step forward in smart waste management, combining cutting-edge technology with environmental responsibility to create a more sustainable future.
