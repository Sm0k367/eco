const { Keypair } = require('@solana/web3.js');
const { ethers } = require('ethers');

/**
 * Wallet Provider - Handles instant wallet creation for users
 * Supports Solana and Ethereum networks
 */

class WalletProvider {
  /**
   * Create a new Solana wallet
   * @returns {Object} Solana wallet with address and private key
   */
  static createSolanaWallet() {
    try {
      const keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toString();
      const secretKey = Buffer.from(keypair.secretKey).toString('hex');

      return {
        address: publicKey,
        privateKey: secretKey,
        network: 'solana',
        createdAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to create Solana wallet: ${error.message}`);
    }
  }

  /**
   * Create a new Ethereum wallet
   * @returns {Object} Ethereum wallet with address and private key
   */
  static createEthereumWallet() {
    try {
      const wallet = ethers.Wallet.createRandom();

      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        network: 'ethereum',
        createdAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to create Ethereum wallet: ${error.message}`);
    }
  }

  /**
   * Create both Solana and Ethereum wallets for a user
   * @returns {Object} Object containing both wallets
   */
  static createDualWallets() {
    try {
      const solanaWallet = this.createSolanaWallet();
      const ethereumWallet = this.createEthereumWallet();

      return {
        solana: solanaWallet,
        ethereum: ethereumWallet,
        createdAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to create dual wallets: ${error.message}`);
    }
  }

  /**
   * Validate a Solana address
   * @param {string} address - Solana address to validate
   * @returns {boolean} True if valid, false otherwise
   */
  static isValidSolanaAddress(address) {
    try {
      const decoded = Buffer.from(address, 'base58');
      return decoded.length === 32;
    } catch {
      return false;
    }
  }

  /**
   * Validate an Ethereum address
   * @param {string} address - Ethereum address to validate
   * @returns {boolean} True if valid, false otherwise
   */
  static isValidEthereumAddress(address) {
    return ethers.isAddress(address);
  }

  /**
   * Validate a wallet address based on network
   * @param {string} address - Address to validate
   * @param {string} network - Network type ('solana' or 'ethereum')
   * @returns {boolean} True if valid, false otherwise
   */
  static isValidAddress(address, network) {
    if (network === 'solana') {
      return this.isValidSolanaAddress(address);
    } else if (network === 'ethereum') {
      return this.isValidEthereumAddress(address);
    }
    return false;
  }

  /**
   * Get wallet info from private key (Solana)
   * @param {string} privateKey - Solana private key (hex format)
   * @returns {Object} Wallet info with address
   */
  static getSolanaWalletFromPrivateKey(privateKey) {
    try {
      const secretKey = Buffer.from(privateKey, 'hex');
      const keypair = Keypair.fromSecretKey(secretKey);
      return {
        address: keypair.publicKey.toString(),
        network: 'solana',
      };
    } catch (error) {
      throw new Error(`Failed to get Solana wallet from private key: ${error.message}`);
    }
  }

  /**
   * Get wallet info from private key (Ethereum)
   * @param {string} privateKey - Ethereum private key
   * @returns {Object} Wallet info with address
   */
  static getEthereumWalletFromPrivateKey(privateKey) {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return {
        address: wallet.address,
        network: 'ethereum',
      };
    } catch (error) {
      throw new Error(`Failed to get Ethereum wallet from private key: ${error.message}`);
    }
  }

  /**
   * Encrypt private key (basic implementation - use proper encryption in production)
   * @param {string} privateKey - Private key to encrypt
   * @param {string} password - Password for encryption
   * @returns {string} Encrypted private key
   */
  static encryptPrivateKey(privateKey, password) {
    // TODO: Implement proper encryption using crypto library
    // This is a placeholder - use bcrypt or similar in production
    return Buffer.from(privateKey).toString('base64');
  }

  /**
   * Decrypt private key (basic implementation - use proper decryption in production)
   * @param {string} encryptedKey - Encrypted private key
   * @param {string} password - Password for decryption
   * @returns {string} Decrypted private key
   */
  static decryptPrivateKey(encryptedKey, password) {
    // TODO: Implement proper decryption using crypto library
    // This is a placeholder - use bcrypt or similar in production
    return Buffer.from(encryptedKey, 'base64').toString();
  }
}

module.exports = WalletProvider;
