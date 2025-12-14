# 🚀 Digital Asset Exchange Platform

A **production-ready, full-featured digital asset exchange platform** that transforms gift cards into cryptocurrency with an innovative marketplace, referral system, and blockchain integration.

## 🎯 Vision

Move beyond simple "gift card for Bitcoin" swaps. We're building a **complete ecosystem** that captures market share through:

- **P2P Marketplace**: Users buy/sell gift cards directly with each other
- **Instant Wallet Creation**: Frictionless onboarding with auto-generated wallets
- **AI-Powered Pricing**: Dynamic fair market value calculation
- **Blockchain Transparency**: On-chain verification for all transactions
- **Viral Growth**: Referral system with rewards and incentives
- **Social Impact**: Donation features with transparent tracking

## 📋 Project Structure

```
gift-card-exchange/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── cardController.js        # Gift card operations
│   │   ├── cryptoController.js      # Crypto conversion
│   │   ├── referralController.js    # Referral system
│   │   ├── marketplaceController.js # P2P marketplace
│   │   └── donationController.js    # Donation tracking
│   ├── models/
│   │   ├── User.js                  # User schema with wallet
│   │   ├── Card.js                  # Gift card schema
│   │   ├── Transaction.js           # Transaction history
│   │   ├── Referral.js              # Referral tracking
│   │   ├── Listing.js               # Marketplace listings
│   │   └── Donation.js              # Donation records
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cardRoutes.js
│   │   ├── cryptoRoutes.js
│   │   ├── referralRoutes.js
│   │   ├── marketplaceRoutes.js
│   │   └── donationRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT, validation, error handling
│   ├── utils/
│   │   ├── walletProvider.js        # Instant wallet creation
│   │   ├── aiPricing.js             # Dynamic pricing engine
│   │   └── blockchainVerifier.js    # On-chain verification
│   ├── server.js                    # Express app setup
│   ├── .env.example                 # Environment variables
│   └── package.json
├── frontend/                        # React web application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Cards/
│   │   │   ├── Crypto/
│   │   │   ├── Marketplace/
│   │   │   ├── Referral/
│   │   │   ├── Donations/
│   │   │   └── Layout/
│   │   ├── context/                 # Global state management
│   │   ├── pages/
│   │   ├── styles/
│   │   └── App.js
│   └── package.json
├── mobile/                          # React Native mobile app
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🔑 Key Features

### 1. **Authentication & User Management**
- JWT-based authentication
- Email verification
- Two-factor authentication (2FA)
- KYC (Know Your Customer) verification
- Account security with login attempt tracking
- Password reset functionality

### 2. **Gift Card Management**
- Upload and store gift cards securely
- Card verification (manual, API, blockchain)
- Conversion history tracking
- Dispute resolution system
- Card expiration monitoring
- Remaining value calculation

### 3. **Crypto Conversion**
- Real-time exchange rates (CoinGecko API)
- Support for Bitcoin, Ethereum, Solana
- Dynamic fee calculation
- Transaction history
- Conversion estimation
- Blockchain transaction tracking

### 4. **Instant Wallet Creation**
- Auto-generate Solana wallets
- Auto-generate Ethereum wallets
- Secure private key storage
- Wallet validation
- Multi-chain support

### 5. **AI-Powered Pricing Engine**
- Brand reputation multipliers
- Expiration proximity discounts
- Card age bonuses
- Seller reputation scoring
- Market supply/demand analysis
- Seasonality factors
- Confidence scoring

### 6. **Blockchain Verification**
- Solana transaction verification
- Ethereum transaction verification
- Wallet address validation
- Transaction proof generation
- On-chain transparency
- Confirmation tracking

### 7. **P2P Marketplace** (Coming Soon)
- Create and manage listings
- Escrow-based transactions
- Buyer/seller ratings
- Dispute resolution
- Transaction history

### 8. **Referral System** (Coming Soon)
- Unique referral codes
- Commission tracking
- Reward distribution
- Referral dashboard
- Performance analytics

### 9. **Donation System** (Coming Soon)
- Crypto donations
- Impact tracking
- Transparent blockchain records
- Donation history
- Tax documentation

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Blockchain**: 
  - Solana Web3.js
  - Ethers.js
- **APIs**: 
  - CoinGecko (exchange rates)
  - Solana RPC
  - Ethereum RPC
- **Security**: 
  - bcryptjs (password hashing)
  - helmet (security headers)
  - CORS

### Frontend (Coming Soon)
- **Framework**: React 18+
- **State Management**: Context API
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router

### Mobile (Coming Soon)
- **Framework**: React Native
- **State Management**: Context API
- **Navigation**: React Navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Solana RPC endpoint
- Ethereum RPC endpoint
- CoinGecko API key (free)

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/gift-card-exchange.git
cd gift-card-exchange/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the server**
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

#### Gift Cards
- `POST /api/cards` - Upload gift card
- `GET /api/cards` - Get user's cards
- `GET /api/cards/:id` - Get single card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `POST /api/cards/:id/verify` - Verify card
- `POST /api/cards/:id/dispute` - Report dispute
- `GET /api/cards/:id/history` - Get conversion history

#### Crypto
- `GET /api/crypto/rates` - Get exchange rates
- `POST /api/crypto/convert` - Convert to crypto
- `GET /api/crypto/balance` - Get crypto balance
- `GET /api/crypto/history` - Get conversion history
- `POST /api/crypto/estimate` - Estimate conversion
- `GET /api/crypto/transaction/:id` - Get transaction status

## 📊 Database Schema

### User Model
```javascript
{
  userId: String (UUID),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  wallet: {
    solanaAddress: String,
    ethereumAddress: String,
    walletCreatedAt: Date
  },
  isEmailVerified: Boolean,
  kycStatus: String (pending|verified|rejected),
  twoFactorEnabled: Boolean,
  referralCode: String (unique),
  referredBy: ObjectId,
  balance: {
    usd: Number,
    crypto: Number
  },
  reputation: {
    rating: Number (1-5),
    reviewCount: Number,
    positiveReviews: Number
  },
  preferences: {
    emailNotifications: Boolean,
    pushNotifications: Boolean,
    theme: String (light|dark),
    currency: String
  },
  status: String (active|suspended|deleted),
  createdAt: Date,
  updatedAt: Date
}
```

### Card Model
```javascript
{
  cardId: String (UUID),
  owner: ObjectId (User),
  brand: String (Amazon|Apple|etc),
  denomination: Number,
  currency: String,
  cardCode: String (encrypted),
  cardCodeHash: String (indexed),
  status: String (active|used|expired|cancelled|disputed),
  isVerified: Boolean,
  expirationDate: Date,
  isListed: Boolean,
  listingId: ObjectId,
  conversionHistory: [{
    timestamp: Date,
    fromCurrency: String,
    toCurrency: String,
    fromAmount: Number,
    toAmount: Number,
    exchangeRate: Number,
    fee: Number,
    transactionId: String
  }],
  blockchainVerification: {
    isVerifiedOnChain: Boolean,
    blockchainNetwork: String,
    transactionHash: String,
    verificationTimestamp: Date
  },
  dispute: {
    isDisputed: Boolean,
    reason: String,
    reportedAt: Date,
    status: String (open|investigating|resolved|rejected)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  transactionId: String (UUID),
  type: String (card_upload|card_conversion|crypto_transfer|etc),
  status: String (pending|completed|failed|cancelled|disputed),
  initiator: ObjectId (User),
  recipient: ObjectId (User),
  amount: Number,
  currency: String,
  fee: Number,
  netAmount: Number,
  conversion: {
    fromCurrency: String,
    toCurrency: String,
    fromAmount: Number,
    toAmount: Number,
    exchangeRate: Number
  },
  card: ObjectId,
  blockchain: {
    network: String (solana|ethereum|polygon),
    transactionHash: String,
    blockNumber: Number,
    gasUsed: Number,
    confirmations: Number,
    isConfirmed: Boolean
  },
  dispute: {
    isDisputed: Boolean,
    reason: String,
    status: String
  },
  initiatedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs with configurable rounds
- **JWT Tokens**: Secure token-based authentication
- **Account Locking**: Automatic lock after failed login attempts
- **Email Verification**: Required before certain operations
- **KYC Verification**: Identity verification for compliance
- **Two-Factor Authentication**: Optional 2FA support
- **Private Key Encryption**: Secure wallet key storage
- **CORS Protection**: Cross-origin request validation
- **Helmet Security Headers**: HTTP security headers
- **Rate Limiting**: Request rate limiting middleware
- **Input Validation**: Joi schema validation

## 💰 Monetization Model

### Platform Fees
- **Conversion Fee**: 2.5% on crypto conversions
- **Marketplace Fee**: 2.5% on P2P transactions
- **Premium Features**: Advanced analytics, priority support

### Referral Commission
- **Referrer Bonus**: 5% commission on referred user transactions
- **New User Bonus**: $10 credit for signing up with referral code

### Revenue Streams
1. Transaction fees
2. Referral commissions
3. Premium subscriptions
4. Donation platform fees
5. API access for partners

## 📈 Growth Strategy

### Phase 1: MVP (Weeks 1-4)
- Core authentication
- Gift card upload & conversion
- Basic crypto integration
- Simple UI

### Phase 2: Enhancement (Weeks 5-8)
- Marketplace launch
- Referral system
- Instant wallet creation
- Advanced pricing

### Phase 3: Scale (Weeks 9-12)
- Mobile app launch
- Donation system
- Advanced analytics
- Marketing campaigns

### Phase 4: Expansion (Months 4+)
- Additional cryptocurrencies
- More gift card brands
- International expansion
- Enterprise features

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💼 Author

**Binx Piierre**
- GitHub: [@binxpiierre](https://github.com/binxpiierre)
- Email: binx@example.com

## 🙏 Acknowledgments

- CoinGecko for exchange rate data
- Solana Foundation for blockchain infrastructure
- Ethereum community for smart contract standards
- MongoDB for database solutions

## 📞 Support

For support, email support@giftcardexchange.com or open an issue on GitHub.

---

**Built with ❤️ by Binx Piierre**

*Transform gift cards into crypto. Build wealth. Change lives.*
