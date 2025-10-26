import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ServicesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const services = [
    {
      id: '1',
      icon: '🏨',
      title: 'Đặt khách sạn',
      description: 'Tìm và đặt phòng khách sạn ưu đãi',
      color: '#FF6B6B',
    },
    {
      id: '2',
      icon: '✈️',
      title: 'Vé máy bay',
      description: 'Đặt vé máy bay giá tốt',
      color: '#4ECDC4',
    },
    {
      id: '3',
      icon: '🚗',
      title: 'Thuê xe',
      description: 'Thuê xe du lịch tiện lợi',
      color: '#45B7D1',
    },
    {
      id: '4',
      icon: '🎫',
      title: 'Vé tham quan',
      description: 'Mua vé các điểm tham quan',
      color: '#96CEB4',
    },
    {
      id: '5',
      icon: '🍽️',
      title: 'Ẩm thực',
      description: 'Khám phá nhà hàng địa phương',
      color: '#FFEAA7',
    },
    {
      id: '6',
      icon: '🎿',
      title: 'Hoạt động',
      description: 'Trải nghiệm các hoạt động thú vị',
      color: '#DFE6E9',
    },
    {
      id: '7',
      icon: '📸',
      title: 'Tour ảnh',
      description: 'Dịch vụ chụp ảnh du lịch',
      color: '#A29BFE',
    },
    {
      id: '8',
      icon: '🎒',
      title: 'Hướng dẫn viên',
      description: 'Thuê hướng dẫn viên địa phương',
      color: '#FD79A8',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dịch vụ</Text>
        <Text style={styles.headerSubtitle}>
          Khám phá các dịch vụ du lịch đa dạng
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm dịch vụ..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Services Grid */}
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, { borderLeftColor: service.color }]}
              activeOpacity={0.7}
            >
              <View style={styles.serviceIconContainer}>
                <Text style={styles.serviceIcon}>{service.icon}</Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>
                  {service.description}
                </Text>
              </View>
              <Text style={styles.serviceArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  servicesGrid: {
    paddingHorizontal: 24,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#666',
  },
  serviceArrow: {
    fontSize: 28,
    color: '#ddd',
  },
});
