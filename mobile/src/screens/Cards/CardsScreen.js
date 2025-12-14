import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const CardsScreen = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    brand: 'Amazon',
    denomination: '',
    cardCode: '',
    expirationDate: '',
  });

  const handleAddCard = () => {
    if (!formData.denomination || !formData.cardCode || !formData.expirationDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    Alert.alert('Success', 'Gift card added successfully!');
    setShowModal(false);
    setFormData({ brand: 'Amazon', denomination: '', cardCode: '', expirationDate: '' });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.emptyState}>
          <Icon name="credit-card" size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No gift cards yet</Text>
          <Text style={styles.emptyText}>Upload your first gift card to get started</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Gift Card</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="x" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Brand"
              value={formData.brand}
              onChangeText={(text) => setFormData({ ...formData, brand: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Denomination"
              value={formData.denomination}
              onChangeText={(text) => setFormData({ ...formData, denomination: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Card Code"
              value={formData.cardCode}
              onChangeText={(text) => setFormData({ ...formData, cardCode: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Expiration Date (YYYY-MM-DD)"
              value={formData.expirationDate}
              onChangeText={(text) => setFormData({ ...formData, expirationDate: text })}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddCard}
            >
              <Text style={styles.submitButtonText}>Upload Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CardsScreen;
