# 🚀 Quick Start Guide

Get the Digital Asset Exchange Platform running in 5 minutes!

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB ([Local](https://docs.mongodb.com/manual/installation/) or [Atlas](https://www.mongodb.com/cloud/atlas))
- Git

## Step 1: Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/gift-card-exchange.git
cd gift-card-exchange

# Navigate to backend
cd backend

# Install dependencies
npm install
```

## Step 2: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Minimum required variables:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gift-card-exchange
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

## Step 3: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║   🚀 Digital Asset Exchange Platform - Backend Server      ║
║   ✅ Server running on port 5000                            ║
║   📍 Environment: development                               ║
║   🔗 API URL: http://localhost:5000                         ║
╚════════════════════════════════════════════════════════════╝
```

## Step 4: Test the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "passwordConfirm": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

Save the returned `token` for authenticated requests.

### Get Current User
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Exchange Rates
```bash
curl http://localhost:5000/api/crypto/rates
```

### Upload a Gift Card
```bash
curl -X POST http://localhost:5000/api/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "brand": "Amazon",
    "denomination": 100,
    "currency": "USD",
    "cardCode": "XXXX-XXXX-XXXX-XXXX",
    "expirationDate": "2025-12-31",
    "source": "purchased"
  }'
```

### Estimate Crypto Conversion
```bash
curl -X POST http://localhost:5000/api/crypto/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "usdAmount": 100,
    "cryptoType": "bitcoin"
  }'
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |
| POST | `/api/auth/logout` | Logout |

### Gift Card Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cards` | Upload gift card |
| GET | `/api/cards` | Get user's cards |
| GET | `/api/cards/:id` | Get single card |
| PUT | `/api/cards/:id` | Update card |
| DELETE | `/api/cards/:id` | Delete card |
| POST | `/api/cards/:id/verify` | Verify card |
| POST | `/api/cards/:id/dispute` | Report dispute |
| GET | `/api/cards/:id/history` | Get conversion history |

### Crypto Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crypto/rates` | Get exchange rates |
| POST | `/api/crypto/convert` | Convert to crypto |
| GET | `/api/crypto/balance` | Get crypto balance |
| GET | `/api/crypto/history` | Get conversion history |
| POST | `/api/crypto/estimate` | Estimate conversion |
| GET | `/api/crypto/transaction/:id` | Get transaction status |

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running or update `MONGODB_URI` in `.env`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change `PORT` in `.env` or kill the process using port 5000

### JWT Secret Not Set
```
Error: JWT_SECRET is not defined
```
**Solution**: Add `JWT_SECRET` to your `.env` file

### CoinGecko API Error
```
Error: Unable to fetch exchange rates
```
**Solution**: Check internet connection or verify `COINGECKO_API_URL` in `.env`

## 📦 Project Structure

```
backend/
├── config/          # Database configuration
├── controllers/     # Business logic
├── models/          # Database schemas
├── routes/          # API endpoints
├── middleware/      # Authentication, validation
├── utils/           # Helper functions
├── server.js        # Express app
├── .env.example     # Environment template
└── package.json     # Dependencies
```

## 🎯 Next Steps

1. **Frontend Setup**: Create React app in `frontend/` directory
2. **Mobile App**: Set up React Native in `mobile/` directory
3. **Database**: Create indexes for better performance
4. **Testing**: Add unit and integration tests
5. **Deployment**: Deploy to production (Heroku, AWS, etc.)

## 📖 Learn More

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Authentication](https://jwt.io/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Ethers.js](https://docs.ethers.org/)

## 💡 Tips

- Use Postman or Insomnia for API testing
- Check logs in console for debugging
- Use MongoDB Compass for database visualization
- Enable 2FA for production accounts
- Keep your JWT_SECRET secure!

## 🆘 Need Help?

- Check the [README.md](./README.md) for detailed documentation
- Review error messages in the console
- Check `.env.example` for required variables
- Open an issue on GitHub

---

**Happy coding! 🚀**
