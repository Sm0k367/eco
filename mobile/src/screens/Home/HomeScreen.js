import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';

const API_URL = 'http://localhost:5000/api';

const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userData = JSON.parse(await AsyncStorage.getItem('user'));
        setUser(userData);

        // Fetch stats
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats({
          balance: response.data.user.balance?.usd || 0,
          cryptoBalance: response.data.user.balance?.crypto || 0,
          totalTransactions: response.data.user.totalTransactions || 0,
          reputation: response.data.user.reputation?.rating || 5,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, {user?.firstName}!</Text>
        <Text style={styles.subGreeting}>Here's your financial overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Icon name="dollar-sign" size={24} color="#3b82f6" />
          <Text style={styles.statLabel}>USD Balance</Text>
          <Text style={styles.statValue}>${stats?.balance?.toFixed(2)}</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="trending-up" size={24} color="#10b981" />
          <Text style={styles.statLabel}>Crypto Balance</Text>
          <Text style={styles.statValue}>{stats?.cryptoBalance?.toFixed(4)} BTC</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="activity" size={24} color="#f59e0b" />
          <Text style={styles.statLabel}>Transactions</Text>
          <Text style={styles.statValue}>{stats?.totalTransactions}</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="star" size={24} color="#ef4444" />
          <Text style={styles.statLabel}>Reputation</Text>
          <Text style={styles.statValue}>{stats?.reputation?.toFixed(1)}★</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="upload" size={20} color="#3b82f6" />
          <Text style={styles.actionText}>Upload Card</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="shopping-cart" size={20} color="#3b82f6" />
          <Text style={styles.actionText}>Browse Marketplace</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="share-2" size={20} color="#3b82f6" />
          <Text style={styles.actionText}>Share Referral Code</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    paddingTop: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#dbeafe',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default HomeScreen;
