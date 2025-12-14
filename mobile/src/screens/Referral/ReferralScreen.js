import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import QRCode from 'react-native-qrcode-svg';

const ReferralScreen = () => {
  const referralCode = 'ABC12345';
  const referralLink = `https://giftcardexchange.com/register?ref=${referralCode}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join GiftCard Exchange using my referral code: ${referralCode}\n${referralLink}`,
        title: 'GiftCard Exchange Referral',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const handleCopyCode = () => {
    Alert.alert('Copied', 'Referral code copied to clipboard!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Referral Program</Text>
        <Text style={styles.subtitle}>Earn 5-12% commission</Text>
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <View style={styles.codeDisplay}>
          <Text style={styles.code}>{referralCode}</Text>
        </View>

        <View style={styles.qrContainer}>
          <QRCode value={referralLink} size={150} />
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Icon name="share-2" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>Share Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
          <Icon name="copy" size={20} color="#3b82f6" />
          <Text style={styles.copyButtonText}>Copy Code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Total Referrals</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>10</Text>
          <Text style={styles.statLabel}>Active Referrals</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>$245.50</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
      </View>

      <View style={styles.tierContainer}>
        <Text style={styles.tierTitle}>Tier Benefits</Text>
        <View style={styles.tierItem}>
          <Text style={styles.tierName}>Bronze</Text>
          <Text style={styles.tierRange}>0-10 referrals</Text>
          <Text style={styles.tierRate}>5%</Text>
        </View>
        <View style={[styles.tierItem, styles.activeTier]}>
          <Text style={styles.tierName}>Silver (Current)</Text>
          <Text style={styles.tierRange}>11-50 referrals</Text>
          <Text style={styles.tierRate}>7%</Text>
        </View>
        <View style={styles.tierItem}>
          <Text style={styles.tierName}>Gold</Text>
          <Text style={styles.tierRange}>51-100 referrals</Text>
          <Text style={styles.tierRate}>10%</Text>
        </View>
        <View style={styles.tierItem}>
          <Text style={styles.tierName}>Platinum</Text>
          <Text style={styles.tierRange}>100+ referrals</Text>
          <Text style={styles.tierRate}>12%</Text>
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#dbeafe',
  },
  codeCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  codeDisplay: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  code: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    letterSpacing: 2,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  copyButton: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  tierContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  tierItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeTier: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  tierName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  tierRange: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  tierRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
});

export default ReferralScreen;
