# 🚀 InvestLearn Backend API

Backend API untuk InvestLearn - Micro-Investment Learning Platform.

## 🛠️ Tech Stack

- **Node.js** dengan Express.js
- **MongoDB** dengan Mongoose ODM
- **JWT** untuk authentication
- **Socket.io** untuk real-time communication
- **Bcrypt** untuk password hashing
- **Joi** untuk data validation
- **Stripe** untuk payment processing

## 📋 Prerequisites

- Node.js (v18+)
- MongoDB (v6+)
- npm atau yarn

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/investlearn-backend.git
cd investlearn-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create `.env` file in root directory:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/investlearn

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
JWT_EXPIRE=30d

# Redis (optional for caching)
REDIS_URL=redis://localhost:6379

# External APIs
ALPHA_VANTAGE_API_KEY=demo
FINNHUB_API_KEY=your_finnhub_key
NEWS_API_KEY=your_news_api_key

# Email Service (optional)
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@investlearn.com

# Payment (development keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4. Start Development Server
```bash
npm run dev
```

Server akan berjalan di: `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Portfolio Endpoints
- `GET /api/portfolios` - Get user portfolios
- `POST /api/portfolios` - Create new portfolio
- `GET /api/portfolios/:id` - Get portfolio details
- `PUT /api/portfolios/:id` - Update portfolio
- `DELETE /api/portfolios/:id` - Delete portfolio

### Stock Endpoints
- `GET /api/stocks/search` - Search stocks
- `GET /api/stocks/:symbol` - Get stock details
- `GET /api/stocks/:symbol/history` - Get stock price history

### Health Check
- `GET /health` - API health status

## 🗂️ Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
├── config/         # Configuration files
├── seeds/          # Database seeders
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run seed` - Seed database with sample data

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - API request rate limiting
- **Input Validation** - Comprehensive input validation
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Password Hashing** - Bcrypt password hashing

## 🚀 Deployment

### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway deploy
```

### Environment Variables for Production
Set these in your hosting platform:
- `NODE_ENV=production`
- `MONGODB_URI=your_production_mongodb_uri`
- `JWT_SECRET=your_production_jwt_secret`
- All other required environment variables

## 📈 Development Status

- ✅ Project setup and configuration
- ✅ Basic Express server with middleware
- ✅ Database configuration
- 🔄 Authentication system (in progress)
- ⏳ User management
- ⏳ Portfolio management
- ⏳ Stock data integration
- ⏳ Real-time features
- ⏳ Payment integration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@investlearn.com or join our Slack channel.

---

**Happy Coding! 🚀**

*Built with ❤️ for financial education*
