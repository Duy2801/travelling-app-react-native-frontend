import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { getMyBookings, Booking, cancelBooking } from '../../src/services/bookingService';

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  // Reload bookings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [])
  );

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const response = await getMyBookings({ sortBy: 'createdAt:desc' });
      console.log('📦 Bookings response:', JSON.stringify(response, null, 2));
      console.log('📦 First booking tourId type:', typeof response.results[0]?.tourId);
      console.log('📦 First booking tourId:', response.results[0]?.tourId);
      setBookings(response.results);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    setCancelBookingId(bookingId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelBookingId) return;
    
    try {
      setIsCancelling(true);
      await cancelBooking(cancelBookingId);
      await loadBookings();
      setShowCancelModal(false);
      setCancelBookingId(null);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể hủy booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#FF3B30';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đặt tour của tôi</Text>
        <Text style={styles.headerSubtitle}>
          Quản lý các tour và dịch vụ đã đặt
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Chờ xác nhận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'confirmed' && styles.activeTab]}
          onPress={() => setActiveTab('confirmed')}
        >
          <Text style={[styles.tabText, activeTab === 'confirmed' && styles.activeTabText]}>
            Đã xác nhận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Hoàn thành
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cancelled' && styles.activeTab]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.activeTabText]}>
            Đã hủy
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => {
              // Check if tourId is populated as an object
              const tour = (typeof booking.tourId === 'object' && booking.tourId !== null) 
                ? booking.tourId 
                : null;
              
              console.log('🎫 Booking:', booking.id, 'Tour type:', typeof booking.tourId, 'Tour:', tour);
              
              return (
              <View key={booking.id || booking._id} style={styles.bookingCard}>
                <View style={styles.bookingThumbnail}>
                  {tour?.images?.[0] ? (
                    <Image 
                      source={{ uri: tour.images[0] }} 
                      style={styles.thumbnailImage}
                    />
                  ) : (
                    <Text style={styles.thumbnailIcon}>🎫</Text>
                  )}
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingName} numberOfLines={2}>
                    {tour?.name || `Tour #${typeof booking.tourId === 'string' ? booking.tourId : 'N/A'}`}
                  </Text>
                  {tour?.destination && (
                    <Text style={styles.bookingDestination}>
                      📍 {tour.destination}
                    </Text>
                  )}
                  <Text style={styles.bookingDate}>
                    📅 {new Date(booking.startDate).toLocaleDateString('vi-VN')} - {new Date(booking.endDate).toLocaleDateString('vi-VN')}
                  </Text>
                  <Text style={styles.bookingPeople}>
                    👥 {booking.numberOfPeople} người
                  </Text>
                  <View style={styles.bookingFooter}>
                    <Text style={styles.bookingPrice}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalPrice)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                        {getStatusText(booking.status)}
                      </Text>
                    </View>
                  </View>
                  {booking.status === 'pending' && (booking.id || booking._id) && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelBooking(booking.id || booking._id || '')}
                    >
                      <Text style={styles.cancelButtonText}>Hủy booking</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Chưa có booking nào</Text>
              <Text style={styles.emptyText}>
                Khám phá và đặt tour du lịch ngay
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.exploreButtonText}>Khám phá tour</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* Cancel Booking Modal */}
      <Modal
        visible={showCancelModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => !isCancelling && setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIconCircle}>
                <Text style={styles.modalIcon}>⚠️</Text>
              </View>
            </View>
            <Text style={styles.modalTitle}>Hủy Booking</Text>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn hủy booking này?{'\n'}
              Hành động này không thể hoàn tác.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                <Text style={styles.cancelModalButtonText}>Không</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmCancelButton]}
                onPress={confirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmCancelButtonText}>Hủy booking</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailIcon: {
    fontSize: 40,
  },
  bookingInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookingName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  bookingDestination: {
    fontSize: 13,
    color: '#2196F3',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  bookingPeople: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // Cancel Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelModalButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelModalButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  confirmCancelButton: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmCancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
