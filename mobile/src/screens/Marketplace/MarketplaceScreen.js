import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const MarketplaceScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const listings = [
    {
      id: 1,
      brand: 'Amazon',
      denomination: 100,
      price: 95,
      seller: 'John D.',
      rating: 4.8,
    },
    {
      id: 2,
      brand: 'Apple',
      denomination: 50,
      price: 48,
      seller: 'Jane S.',
      rating: 4.9,
    },
    {
      id: 3,
      brand: 'Walmart',
      denomination: 75,
      price: 72,
      seller: 'Mike T.',
      rating: 4.7,
    },
  ];

  const renderListing = ({ item }) => (
    <TouchableOpacity style={styles.listingCard}>
      <View style={styles.listingHeader}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.rating}>★ {item.rating}</Text>
      </View>
      <Text style={styles.denomination}>Denomination: ${item.denomination}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={styles.discount}>
          {Math.round((item.price / item.denomination) * 100)}%
        </Text>
      </View>
      <Text style={styles.seller}>Seller: {item.seller}</Text>
      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search listings..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <FlatList
        data={listings}
        renderItem={renderListing}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  listContent: {
    paddingBottom: 20,
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  rating: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  denomination: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  discount: {
    fontSize: 14,
    color: '#6b7280',
  },
  seller: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  buyButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MarketplaceScreen;
