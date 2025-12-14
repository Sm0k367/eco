const axios = require('axios');

/**
 * Blockchain Verifier
 * Handles on-chain verification and transparency for transactions
 * Supports Solana and Ethereum networks
 */

class BlockchainVerifier {
  /**
   * Verify a transaction on Solana blockchain
   * @param {string} transactionHash - Solana transaction signature
   * @returns {Promise<Object>} Transaction verification result
   */
  static async verifySolanaTransaction(transactionHash) {
    try {
      const response = await axios.post(process.env.SOLANA_RPC_URL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [transactionHash, 'json'],
      });

      if (response.data.error) {
        return {
          success: false,
          verified: false,
          error: response.data.error.message,
        };
      }

      const transaction = response.data.result;

      return {
        success: true,
        verified: transaction.meta.err === null,
        transactionHash,
        network: 'solana',
        blockTime: transaction.blockTime,
        slot: transaction.slot,
        fee: transaction.meta.fee,
        status: transaction.meta.err === null ? 'confirmed' : 'failed',
        confirmations: await this.getSolanaConfirmations(transaction.slot),
      };
    } catch (error) {
      console.error('Solana verification error:', error);
      return {
        success: false,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Get confirmation count for a Solana transaction
   * @param {number} slot - Solana slot number
   * @returns {Promise<number>} Number of confirmations
   */
  static async getSolanaConfirmations(slot) {
    try {
      const response = await axios.post(process.env.SOLANA_RPC_URL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getSlot',
        params: [],
      });

      const currentSlot = response.data.result;
      return Math.max(0, currentSlot - slot);
    } catch (error) {
      console.error('Error getting Solana confirmations:', error);
      return 0;
    }
  }

  /**
   * Verify a transaction on Ethereum blockchain
   * @param {string} transactionHash - Ethereum transaction hash
   * @returns {Promise<Object>} Transaction verification result
   */
  static async verifyEthereumTransaction(transactionHash) {
    try {
      const response = await axios.post(process.env.ETHEREUM_RPC_URL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionReceipt',
        params: [transactionHash],
      });

      if (response.data.error) {
        return {
          success: false,
          verified: false,
          error: response.data.error.message,
        };
      }

      const receipt = response.data.result;

      if (!receipt) {
        return {
          success: true,
          verified: false,
          transactionHash,
          network: 'ethereum',
          status: 'pending',
          message: 'Transaction not yet mined',
        };
      }

      return {
        success: true,
        verified: receipt.status === '0x1',
        transactionHash,
        network: 'ethereum',
        blockNumber: parseInt(receipt.blockNumber, 16),
        gasUsed: parseInt(receipt.gasUsed, 16),
        status: receipt.status === '0x1' ? 'confirmed' : 'failed',
        confirmations: await this.getEthereumConfirmations(receipt.blockNumber),
      };
    } catch (error) {
      console.error('Ethereum verification error:', error);
      return {
        success: false,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Get confirmation count for an Ethereum transaction
   * @param {string} blockNumber - Block number (hex)
   * @returns {Promise<number>} Number of confirmations
   */
  static async getEthereumConfirmations(blockNumber) {
    try {
      const response = await axios.post(process.env.ETHEREUM_RPC_URL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: [],
      });

      const currentBlock = parseInt(response.data.result, 16);
      const txBlock = parseInt(blockNumber, 16);
      return Math.max(0, currentBlock - txBlock);
    } catch (error) {
      console.error('Error getting Ethereum confirmations:', error);
      return 0;
    }
  }

  /**
   * Verify a wallet address on blockchain
   * @param {string} address - Wallet address
   * @param {string} network - Network type ('solana' or 'ethereum')
   * @returns {Promise<Object>} Wallet verification result
   */
  static async verifyWalletAddress(address, network) {
    try {
      if (network === 'solana') {
        return await this.verifySolanaWallet(address);
      } else if (network === 'ethereum') {
        return await this.verifyEthereumWallet(address);
      }

      return {
        success: false,
        verified: false,
        error: 'Unsupported network',
      };
    } catch (error) {
      console.error('Wallet verification error:', error);
      return {
        success: false,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify a Solana wallet address
   * @param {string} address - Solana address
   * @returns {Promise<Object>} Wallet verification result
   */
  static async verifySolanaWallet(address) {
    try {
      const response = await axios.post(process.env.SOLANA_RPC_URL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [address],
      });

      if (response.data.error) {
        return {
          success: false,
          verified: false,
          error: response.data.error.message,
        };
      }

      const accountInfo = response.data.result;

      return {
        success: true,
        verified: accountInfo !== null,
        address,
        network: 'solana',
        exists: accountInfo !== null,
        balance: accountInfo ? accountInfo.value.lamports : 0,
        owner: accountInfo ? accountInfo.value.owner : null,
      };
    } catch (error) {
      console.error('Solana wallet verification error:', error);
      return {
        success: false,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify an Ethereum wallet address
   * @param {string} address - Ethereum address
   * @returns {Promise<Object>} Wallet verification result
   */
  static async verifyEthereumWallet(address) {
    try {
      const response = await axios.post(process.env.ETHEREUM_RPC_URL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      if (response.data.error) {
        return {
          success: false,
          verified: false,
          error: response.data.error.message,
        };
      }

      const balance = parseInt(response.data.result, 16);

      return {
        success: true,
        verified: true,
        address,
        network: 'ethereum',
        exists: true,
        balance,
        balanceInEth: balance / 1e18,
      };
    } catch (error) {
      console.error('Ethereum wallet verification error:', error);
      return {
        success: false,
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a transaction proof for on-chain verification
   * @param {Object} transaction - Transaction object
   * @returns {Object} Transaction proof
   */
  static createTransactionProof(transaction) {
    return {
      transactionId: transaction._id,
      transactionHash: transaction.blockchain.transactionHash,
      network: transaction.blockchain.network,
      initiator: transaction.initiator,
      recipient: transaction.recipient,
      amount: transaction.amount,
      currency: transaction.currency,
      timestamp: transaction.createdAt,
      status: transaction.status,
      verified: transaction.blockchain.isConfirmed,
      confirmations: transaction.blockchain.confirmations,
      proofGeneratedAt: new Date(),
    };
  }

  /**
   * Verify transaction integrity
   * @param {Object} transaction - Transaction object
   * @param {Object} proof - Transaction proof
   * @returns {boolean} True if transaction matches proof
   */
  static verifyTransactionIntegrity(transaction, proof) {
    return (
      transaction._id.toString() === proof.transactionId.toString() &&
      transaction.blockchain.transactionHash === proof.transactionHash &&
      transaction.blockchain.network === proof.network &&
      transaction.amount === proof.amount &&
      transaction.currency === proof.currency
    );
  }

  /**
   * Get transaction history from blockchain
   * @param {string} address - Wallet address
   * @param {string} network - Network type
   * @returns {Promise<Array>} Array of transactions
   */
  static async getTransactionHistory(address, network) {
    try {
      if (network === 'solana') {
        return await this.getSolanaTransactionHistory(address);
      } else if (network === 'ethereum') {
        return await this.getEthereumTransactionHistory(address);
      }

      return [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Get Solana transaction history
   * @param {string} address - Solana address
   * @returns {Promise<Array>} Array of transactions
   */
  static async getSolanaTransactionHistory(address) {
    try {
      const response = await axios.post(process.env.SOLANA_RPC_URL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [address, { limit: 10 }],
      });

      if (response.data.error) {
        return [];
      }

      return response.data.result.map((tx) => ({
        signature: tx.signature,
        slot: tx.slot,
        blockTime: tx.blockTime,
        err: tx.err,
        memo: tx.memo,
      }));
    } catch (error) {
      console.error('Error fetching Solana transaction history:', error);
      return [];
    }
  }

  /**
   * Get Ethereum transaction history (requires external API like Etherscan)
   * @param {string} address - Ethereum address
   * @returns {Promise<Array>} Array of transactions
   */
  static async getEthereumTransactionHistory(address) {
    // This would require an external API like Etherscan
    // For now, return empty array
    console.log('Ethereum transaction history requires external API integration');
    return [];
  }

  /**
   * Monitor transaction status
   * @param {string} transactionHash - Transaction hash
   * @param {string} network - Network type
   * @param {number} maxAttempts - Maximum verification attempts
   * @returns {Promise<Object>} Final transaction status
   */
  static async monitorTransactionStatus(transactionHash, network, maxAttempts = 30) {
    let attempts = 0;
    const pollInterval = 2000; // 2 seconds

    while (attempts < maxAttempts) {
      const verification =
        network === 'solana'
          ? await this.verifySolanaTransaction(transactionHash)
          : await this.verifyEthereumTransaction(transactionHash);

      if (verification.verified || (verification.status && verification.status !== 'pending')) {
        return verification;
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    return {
      success: false,
      verified: false,
      error: 'Transaction verification timeout',
    };
  }
}

module.exports = BlockchainVerifier;
