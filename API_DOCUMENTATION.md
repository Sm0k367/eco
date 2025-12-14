# 🚀 Digital Asset Exchange Platform - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📋 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "passwordConfirm": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "referralCode": "ABC12345" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "referralCode": "XYZ98765"
  }
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Get Current User
**GET** `/auth/me` (Protected)

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

### Update Profile
**PUT** `/auth/profile` (Protected)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Crypto enthusiast",
  "preferences": {
    "emailNotifications": true,
    "theme": "dark"
  }
}
```

### Change Password
**PUT** `/auth/change-password` (Protected)

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

---

## 🎁 Gift Card Endpoints

### Upload Gift Card
**POST** `/cards` (Protected)

**Request Body:**
```json
{
  "brand": "Amazon",
  "denomination": 100,
  "currency": "USD",
  "cardCode": "XXXX-XXXX-XXXX-XXXX",
  "expirationDate": "2025-12-31",
  "source": "purchased",
  "notes": "Birthday gift"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Gift card uploaded successfully",
  "card": {
    "_id": "507f1f77bcf86cd799439011",
    "cardId": "abc-123-def",
    "brand": "Amazon",
    "denomination": 100,
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get All Cards
**GET** `/cards` (Protected)

**Query Parameters:**
- `status`: active, used, expired, cancelled
- `brand`: Amazon, Apple, etc.
- `sort`: -createdAt (default)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "stats": {
    "total": 5,
    "active": 3,
    "used": 1,
    "expired": 1,
    "totalValue": 500,
    "totalRemaining": 350
  },
  "cards": [ ... ]
}
```

### Get Single Card
**GET** `/cards/:id` (Protected)

### Update Card
**PUT** `/cards/:id` (Protected)

**Request Body:**
```json
{
  "notes": "Updated notes",
  "status": "active"
}
```

### Delete Card
**DELETE** `/cards/:id` (Protected)

### Verify Card
**POST** `/cards/:id/verify` (Protected)

**Request Body:**
```json
{
  "verificationMethod": "manual"
}
```

### Report Dispute
**POST** `/cards/:id/dispute` (Protected)

**Request Body:**
```json
{
  "reason": "Card code doesn't work"
}
```

### Get Conversion History
**GET** `/cards/:id/history` (Protected)

---

## 💰 Crypto Endpoints

### Get Exchange Rates
**GET** `/crypto/rates` (Public)

**Response:**
```json
{
  "success": true,
  "rates": {
    "bitcoin": 42500.50,
    "ethereum": 2250.75,
    "solana": 98.25,
    "timestamp": 1705315800000
  }
}
```

### Convert to Crypto
**POST** `/crypto/convert` (Protected)

**Request Body:**
```json
{
  "cardId": "507f1f77bcf86cd799439011",
  "cryptoType": "bitcoin",
  "walletAddress": "1A1z7agoat2LWQLZLQ34Jig2EB8ZGDG2Lg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversion initiated successfully",
  "transaction": {
    "transactionId": "txn-123-456",
    "status": "pending",
    "usdAmount": 100,
    "fee": 2.50,
    "netAmount": 97.50,
    "cryptoAmount": 0.00229,
    "cryptoType": "bitcoin",
    "exchangeRate": 42500.50
  }
}
```

### Get Crypto Balance
**GET** `/crypto/balance` (Protected)

### Get Conversion History
**GET** `/crypto/history` (Protected)

### Estimate Conversion
**POST** `/crypto/estimate` (Public)

**Request Body:**
```json
{
  "usdAmount": 100,
  "cryptoType": "bitcoin"
}
```

### Get Transaction Status
**GET** `/crypto/transaction/:transactionId` (Protected)

---

## 🏪 Marketplace Endpoints

### Create Listing
**POST** `/marketplace/listings` (Protected)

**Request Body:**
```json
{
  "cardId": "507f1f77bcf86cd799439011",
  "title": "Amazon $100 Gift Card",
  "description": "Brand new, never used",
  "askingPrice": 95,
  "discount": 5
}
```

### Get All Listings
**GET** `/marketplace/listings` (Public)

**Query Parameters:**
- `brand`: Amazon, Apple, etc.
- `minPrice`: 50
- `maxPrice`: 200
- `sort`: -createdAt
- `page`: 1
- `limit`: 20

### Get Single Listing
**GET** `/marketplace/listings/:id` (Public)

### Update Listing
**PUT** `/marketplace/listings/:id` (Protected)

### Delete Listing
**DELETE** `/marketplace/listings/:id` (Protected)

### Purchase Listing
**POST** `/marketplace/listings/:id/purchase` (Protected)

### Confirm Receipt
**POST** `/marketplace/listings/:id/confirm` (Protected)

### Rate Listing
**POST** `/marketplace/listings/:id/rate` (Protected)

**Request Body:**
```json
{
  "rating": 5,
  "review": "Great seller, fast transaction!"
}
```

### Get My Listings
**GET** `/marketplace/my-listings` (Protected)

### Get My Purchases
**GET** `/marketplace/my-purchases` (Protected)

### Search Listings
**GET** `/marketplace/search` (Public)

**Query Parameters:**
- `q`: search term
- `brand`: Amazon
- `minPrice`: 50
- `maxPrice`: 200

### Add to Favorites
**POST** `/marketplace/listings/:id/favorite` (Protected)

### Remove from Favorites
**DELETE** `/marketplace/listings/:id/favorite` (Protected)

---

## 👥 Referral Endpoints

### Get Referral Code
**GET** `/referral/code` (Protected)

**Response:**
```json
{
  "success": true,
  "referralCode": "ABC12345",
  "referralLink": "https://giftcardexchange.com/register?ref=ABC12345"
}
```

### Regenerate Referral Code
**POST** `/referral/code/regenerate` (Protected)

### Get Referral Stats
**GET** `/referral/stats` (Protected)

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalReferrals": 12,
    "activeReferrals": 10,
    "totalEarned": 245.50,
    "totalWithdrawn": 100,
    "pendingAmount": 145.50,
    "totalVolume": 5000
  },
  "tier": "silver"
}
```

### Get Referral Earnings
**GET** `/referral/earnings` (Protected)

### Get Referred Users
**GET** `/referral/referrals` (Protected)

### Claim Signup Bonus
**POST** `/referral/claim-bonus` (Protected)

### Withdraw Earnings
**POST** `/referral/withdraw` (Protected)

**Request Body:**
```json
{
  "amount": 100,
  "method": "bank_transfer"
}
```

### Get Leaderboard
**GET** `/referral/leaderboard` (Public)

**Query Parameters:**
- `limit`: 20
- `period`: all, month, week

---

## 💝 Donation Endpoints

### Create Donation
**POST** `/donations` (Protected)

**Request Body:**
```json
{
  "amount": 100,
  "cryptoType": "bitcoin",
  "recipientName": "Red Cross",
  "recipientAddress": "1A1z7agoat2LWQLZLQ34Jig2EB8ZGDG2Lg",
  "impactCategory": "healthcare",
  "isPublic": true,
  "displayName": "Anonymous",
  "message": "Supporting healthcare initiatives"
}
```

### Get All Donations
**GET** `/donations` (Public)

**Query Parameters:**
- `category`: education, healthcare, environment, etc.
- `page`: 1
- `limit`: 20

### Get My Donations
**GET** `/donations/my-donations` (Protected)

### Get Single Donation
**GET** `/donations/:id` (Public)

### Get Impact Metrics
**GET** `/donations/impact/metrics` (Public)

**Response:**
```json
{
  "success": true,
  "metrics": {
    "totalDonations": 150,
    "totalAmount": 15000,
    "totalCrypto": 0.35,
    "averageDonation": 100,
    "byCategory": {
      "healthcare": { "count": 50, "amount": 5000 },
      "education": { "count": 100, "amount": 10000 }
    },
    "topRecipients": [ ... ]
  }
}
```

### Verify Donation
**POST** `/donations/:id/verify` (Protected)

**Request Body:**
```json
{
  "transactionHash": "0x...",
  "network": "ethereum"
}
```

### Generate Tax Receipt
**GET** `/donations/:id/tax-receipt` (Protected)

### Get Leaderboard
**GET** `/donations/leaderboard` (Public)

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Server Error

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **Marketplace**: 50 requests per 15 minutes per user

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "pages": 8,
  "currentPage": 1,
  "data": [ ... ]
}
```

---

## Sorting

Use the `sort` parameter to sort results:

- `-createdAt`: Newest first (default)
- `createdAt`: Oldest first
- `-price`: Highest price first
- `price`: Lowest price first

---

## Filtering

Most list endpoints support filtering:

```
GET /api/marketplace/listings?brand=Amazon&minPrice=50&maxPrice=200&status=active
```

---

## Webhooks (Coming Soon)

Subscribe to events:
- `transaction.completed`
- `listing.sold`
- `referral.earned`
- `donation.verified`

---

## Rate Limits & Quotas

- **Free Tier**: 1,000 requests/month
- **Pro Tier**: 100,000 requests/month
- **Enterprise**: Unlimited

---

## Support

For API support, contact: api-support@giftcardexchange.com

---

**Last Updated**: January 2024
**API Version**: 1.0.0
