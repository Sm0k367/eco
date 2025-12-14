/**
 * AI Pricing Engine
 * Dynamically calculates fair market value for gift cards based on:
 * - Brand reputation and demand
 * - Card age and expiration proximity
 * - Market conditions and volatility
 * - User reputation and transaction history
 * - Supply and demand on marketplace
 */

class AIPricingEngine {
  /**
   * Brand value multipliers (based on market demand and liquidity)
   */
  static BRAND_MULTIPLIERS = {
    'Amazon': 0.98,
    'Apple': 0.97,
    'Google Play': 0.96,
    'Walmart': 0.95,
    'Target': 0.94,
    'Best Buy': 0.93,
    'Starbucks': 0.92,
    'Netflix': 0.91,
    'Spotify': 0.90,
    'Steam': 0.89,
    'PlayStation': 0.88,
    'Xbox': 0.87,
    'Nintendo': 0.86,
    'Uber': 0.85,
    'DoorDash': 0.84,
    'Other': 0.80,
  };

  /**
   * Calculate fair market value for a gift card
   * @param {Object} card - Card object with brand, denomination, expirationDate, etc.
   * @param {Object} user - User object with reputation, transaction history
   * @param {Object} marketData - Current market supply/demand data
   * @returns {Object} Pricing recommendation with base price, discount, and reasoning
   */
  static calculateFairValue(card, user, marketData = {}) {
    let basePrice = card.denomination;
    let adjustments = [];

    // 1. Brand Multiplier
    const brandMultiplier = this.BRAND_MULTIPLIERS[card.brand] || 0.80;
    basePrice *= brandMultiplier;
    adjustments.push({
      factor: 'Brand Demand',
      multiplier: brandMultiplier,
      impact: (1 - brandMultiplier) * 100,
    });

    // 2. Expiration Proximity Discount
    const expirationDiscount = this.calculateExpirationDiscount(card.expirationDate);
    basePrice *= (1 - expirationDiscount);
    adjustments.push({
      factor: 'Expiration Proximity',
      discount: expirationDiscount * 100,
      impact: -expirationDiscount * 100,
    });

    // 3. Card Age Bonus (newer cards are worth more)
    const ageBonus = this.calculateAgeBonus(card.createdAt);
    basePrice *= (1 + ageBonus);
    adjustments.push({
      factor: 'Card Age',
      bonus: ageBonus * 100,
      impact: ageBonus * 100,
    });

    // 4. Seller Reputation Multiplier
    const reputationMultiplier = this.calculateReputationMultiplier(user);
    basePrice *= reputationMultiplier;
    adjustments.push({
      factor: 'Seller Reputation',
      multiplier: reputationMultiplier,
      impact: (reputationMultiplier - 1) * 100,
    });

    // 5. Market Supply/Demand
    const marketMultiplier = this.calculateMarketMultiplier(card.brand, marketData);
    basePrice *= marketMultiplier;
    adjustments.push({
      factor: 'Market Conditions',
      multiplier: marketMultiplier,
      impact: (marketMultiplier - 1) * 100,
    });

    // 6. Verification Bonus
    const verificationBonus = card.isVerified ? 0.02 : 0;
    basePrice *= (1 + verificationBonus);
    if (verificationBonus > 0) {
      adjustments.push({
        factor: 'Verification Status',
        bonus: verificationBonus * 100,
        impact: verificationBonus * 100,
      });
    }

    // Calculate final metrics
    const discount = ((card.denomination - basePrice) / card.denomination) * 100;
    const confidence = this.calculateConfidenceScore(adjustments);

    return {
      basePrice: card.denomination,
      fairValue: Math.round(basePrice * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      adjustments,
      confidence: Math.round(confidence * 100) / 100,
      recommendation: this.getRecommendation(discount, confidence),
      timestamp: new Date(),
    };
  }

  /**
   * Calculate discount based on expiration date
   * @param {Date} expirationDate - Card expiration date
   * @returns {number} Discount percentage (0-0.5)
   */
  static calculateExpirationDiscount(expirationDate) {
    const now = new Date();
    const daysUntilExpiration = Math.floor((expirationDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) return 1.0; // Expired
    if (daysUntilExpiration < 30) return 0.15; // Expires soon
    if (daysUntilExpiration < 90) return 0.08; // Expires in 3 months
    if (daysUntilExpiration < 180) return 0.03; // Expires in 6 months
    return 0; // No discount for cards expiring in 6+ months
  }

  /**
   * Calculate bonus for newer cards
   * @param {Date} createdAt - Card creation date
   * @returns {number} Bonus percentage (0-0.05)
   */
  static calculateAgeBonus(createdAt) {
    const ageInDays = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));

    if (ageInDays < 7) return 0.05; // Brand new
    if (ageInDays < 30) return 0.03; // Less than a month
    if (ageInDays < 90) return 0.01; // Less than 3 months
    return 0; // No bonus for older cards
  }

  /**
   * Calculate reputation multiplier based on user history
   * @param {Object} user - User object with reputation data
   * @returns {number} Multiplier (0.95-1.05)
   */
  static calculateReputationMultiplier(user) {
    if (!user) return 1.0;

    const rating = user.reputation?.rating || 3;
    const reviewCount = user.reputation?.reviewCount || 0;
    const positiveReviews = user.reputation?.positiveReviews || 0;

    // Base multiplier from rating
    let multiplier = 0.95 + (rating / 5) * 0.1; // 0.95 to 1.05

    // Boost for high review count
    if (reviewCount > 50) {
      multiplier += 0.02;
    } else if (reviewCount > 20) {
      multiplier += 0.01;
    }

    // Penalty for low positive review ratio
    if (reviewCount > 0) {
      const positiveRatio = positiveReviews / reviewCount;
      if (positiveRatio < 0.8) {
        multiplier -= 0.05;
      }
    }

    return Math.max(0.90, Math.min(1.10, multiplier)); // Clamp between 0.90 and 1.10
  }

  /**
   * Calculate market multiplier based on supply/demand
   * @param {string} brand - Card brand
   * @param {Object} marketData - Market supply/demand data
   * @returns {number} Multiplier (0.95-1.05)
   */
  static calculateMarketMultiplier(brand, marketData = {}) {
    if (!marketData.supplyDemandRatio) return 1.0;

    const ratio = marketData.supplyDemandRatio[brand] || 1.0;

    // High demand (low supply) = higher price
    if (ratio < 0.5) return 1.05;
    if (ratio < 0.8) return 1.02;
    if (ratio > 2.0) return 0.95; // High supply = lower price
    if (ratio > 1.5) return 0.98;

    return 1.0;
  }

  /**
   * Calculate confidence score for the pricing recommendation
   * @param {Array} adjustments - Array of adjustment factors
   * @returns {number} Confidence score (0-1)
   */
  static calculateConfidenceScore(adjustments) {
    // Base confidence
    let confidence = 0.85;

    // Reduce confidence if too many adjustments
    if (adjustments.length > 5) {
      confidence -= 0.05;
    }

    // Reduce confidence if large adjustments
    const largeAdjustments = adjustments.filter((a) => Math.abs(a.impact || 0) > 10);
    if (largeAdjustments.length > 2) {
      confidence -= 0.1;
    }

    return Math.max(0.5, Math.min(1.0, confidence));
  }

  /**
   * Get recommendation based on discount and confidence
   * @param {number} discount - Discount percentage
   * @param {number} confidence - Confidence score
   * @returns {string} Recommendation text
   */
  static getRecommendation(discount, confidence) {
    if (confidence < 0.6) {
      return 'Low confidence - Consider manual review';
    }

    if (discount > 20) {
      return 'Significant discount - May indicate risk factors';
    }

    if (discount > 10) {
      return 'Moderate discount - Fair market value';
    }

    if (discount > 5) {
      return 'Slight discount - Good value';
    }

    return 'Premium pricing - High demand item';
  }

  /**
   * Predict demand for a card brand
   * @param {string} brand - Card brand
   * @param {Object} historicalData - Historical transaction data
   * @returns {Object} Demand prediction
   */
  static predictDemand(brand, historicalData = {}) {
    // Simplified demand prediction
    const baselineDemand = 100;
    const trend = historicalData.trend || 0; // -1 to 1
    const seasonality = this.getSeasonalityFactor(brand);

    const predictedDemand = baselineDemand * (1 + trend) * seasonality;

    return {
      brand,
      predictedDemand: Math.round(predictedDemand),
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      seasonality,
      confidence: 0.75,
    };
  }

  /**
   * Get seasonality factor for a brand
   * @param {string} brand - Card brand
   * @returns {number} Seasonality multiplier
   */
  static getSeasonalityFactor(brand) {
    const month = new Date().getMonth();

    // Holiday season boost (Nov-Dec)
    if (month >= 10) {
      if (['Amazon', 'Walmart', 'Target', 'Best Buy'].includes(brand)) {
        return 1.15;
      }
    }

    // Summer boost for entertainment
    if (month >= 5 && month <= 8) {
      if (['Netflix', 'Spotify', 'Steam', 'PlayStation', 'Xbox'].includes(brand)) {
        return 1.1;
      }
    }

    return 1.0;
  }

  /**
   * Bulk price calculation for multiple cards
   * @param {Array} cards - Array of card objects
   * @param {Object} user - User object
   * @param {Object} marketData - Market data
   * @returns {Array} Array of pricing recommendations
   */
  static bulkCalculateFairValue(cards, user, marketData = {}) {
    return cards.map((card) => ({
      cardId: card._id,
      ...this.calculateFairValue(card, user, marketData),
    }));
  }
}

module.exports = AIPricingEngine;
