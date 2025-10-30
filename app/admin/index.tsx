import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { getCurrentUser, logout } from '../../src/services/authService';
import { getUsers } from '../../src/services/userService';
import { getTours } from '../../src/services/tourService';
import { getHotels } from '../../src/services/hotelService';
import { getServices } from '../../src/services/serviceService';
import { getAllBookings } from '../../src/services/bookingService';
import { getReviews } from '../../src/services/reviewService';

const { width } = Dimensions.get('window');

// Custom Toast Component
const Toast = ({ visible, message, type, onHide }: any) => {
  const translateY = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.delay(2500),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }
  }, [visible]);

  if (!visible) return null;

  const colors = type === 'success' 
    ? (['#4CAF50', '#45A049'] as const)
    : type === 'error'
    ? (['#FF3B30', '#E5342A'] as const)
    : (['#2196F3', '#1976D2'] as const);

  return (
    <Animated.View 
      style={[
        styles.toastContainer,
        { transform: [{ translateY }] }
      ]}
    >
      <LinearGradient colors={colors} style={styles.toastGradient}>
        <Text style={styles.toastIcon}>
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </Text>
        <Text style={styles.toastText}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Custom Confirmation Modal
const ConfirmModal = ({ visible, title, message, onConfirm, onCancel }: any) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalMessage}>{message}</Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={onCancel}>
              <Text style={styles.modalBtnCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnConfirm} onPress={onConfirm}>
              <Text style={styles.modalBtnConfirmText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTours: 0,
    totalBookings: 0,
    totalServices: 0,
    totalHotels: 0,
    totalReviews: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    averageRating: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const checkAdminAccess = async () => {
    try {
      setIsLoading(true);
      const userData = await getCurrentUser();
      
      if (!userData) {
        showToast('Vui lòng đăng nhập để tiếp tục', 'error');
        setTimeout(() => router.replace('/(tabs)/profile'), 2000);
        return;
      }

      if (userData.role !== 'admin') {
        showToast('Bạn không có quyền truy cập', 'error');
        setTimeout(() => router.replace('/(tabs)'), 2000);
        return;
      }

      setUser(userData);
      loadDashboardStats();
    } catch (error) {
      showToast('Không thể xác thực quyền truy cập', 'error');
      setTimeout(() => router.replace('/(tabs)'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const [usersData, toursData, hotelsData, servicesData, bookingsData, reviewsData] = 
        await Promise.all([
          getUsers({ limit: 1 }),
          getTours({ limit: 1 }),
          getHotels({ limit: 1 }),
          getServices({ limit: 1 }),
          getAllBookings({ limit: 1 }),
          getReviews({ limit: 100 }),
        ]);

      const allBookings = await getAllBookings({ limit: 1000 });
      const totalRevenue = allBookings.results.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      const pendingBookings = allBookings.results.filter(b => b.status === 'pending').length;

      const totalRating = reviewsData.results.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = reviewsData.results.length > 0 ? totalRating / reviewsData.results.length : 0;

      setStats({
        totalUsers: usersData.totalResults,
        totalTours: toursData.totalResults,
        totalBookings: bookingsData.totalResults,
        totalServices: servicesData.totalResults,
        totalHotels: hotelsData.totalResults,
        totalReviews: reviewsData.totalResults,
        totalRevenue,
        pendingBookings,
        averageRating,
      });
    } catch (error) {
      showToast('Không thể tải dữ liệu', 'error');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
    showToast('Đã cập nhật dữ liệu', 'success');
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      showToast('Đã đăng xuất thành công', 'success');
      setTimeout(() => router.replace('/login'), 1500);
    } catch (error) {
      showToast('Không thể đăng xuất', 'error');
    }
  };

  const menuItems = [
    { 
      id: 'users', 
      title: 'Người dùng', 
      subtitle: 'Quản lý tài khoản',
      icon: '👥', 
      route: '/admin/users', 
      color: '#2196F3',
      count: stats.totalUsers,
      iconBg: '#E3F2FD',
    },
    { 
      id: 'tours', 
      title: 'Tour du lịch', 
      subtitle: 'Quản lý tour',
      icon: '🗺️', 
      route: '/admin/tours', 
      color: '#FF9800',
      count: stats.totalTours,
      iconBg: '#FFF3E0',
    },
    { 
      id: 'hotels', 
      title: 'Khách sạn', 
      subtitle: 'Quản lý nơi ở',
      icon: '🏨', 
      route: '/admin/hotels', 
      color: '#00BCD4',
      count: stats.totalHotels,
      iconBg: '#E0F7FA',
    },
    { 
      id: 'services', 
      title: 'Dịch vụ', 
      subtitle: 'Dịch vụ bổ sung',
      icon: '🎫', 
      route: '/admin/services', 
      color: '#4CAF50',
      count: stats.totalServices,
      iconBg: '#E8F5E9',
    },
    { 
      id: 'reviews', 
      title: 'Đánh giá', 
      subtitle: 'Phản hồi khách',
      icon: '⭐', 
      route: '/admin/reviews', 
      color: '#FFC107',
      count: stats.totalReviews,
      iconBg: '#FFF8E1',
    },
    { 
      id: 'analytics', 
      title: 'Thống kê', 
      subtitle: 'Báo cáo & phân tích',
      icon: '📊', 
      route: '/admin/analytics', 
      color: '#9C27B0',
      iconBg: '#F3E5F5',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Toast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <ConfirmModal
        visible={showLogoutModal}
        title="Đăng xuất"
        message="Bạn có chắc muốn đăng xuất khỏi tài khoản admin?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>Xin chào 👋</Text>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>👑 Admin</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#E3F2FD' }]}>
                <Text style={styles.statIcon}>�</Text>
              </View>
              <Text style={styles.statLabel}>Người dùng</Text>
              <Text style={styles.statValue}>{formatNumber(stats.totalUsers)}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#FFF3E0' }]}>
                <Text style={styles.statIcon}>�️</Text>
              </View>
              <Text style={styles.statLabel}>Tours</Text>
              <Text style={styles.statValue}>{formatNumber(stats.totalTours)}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#E0F7FA' }]}>
                <Text style={styles.statIcon}>🏨</Text>
              </View>
              <Text style={styles.statLabel}>Khách sạn</Text>
              <Text style={styles.statValue}>{formatNumber(stats.totalHotels)}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#E8F5E9' }]}>
                <Text style={styles.statIcon}>🎫</Text>
              </View>
              <Text style={styles.statLabel}>Dịch vụ</Text>
              <Text style={styles.statValue}>{formatNumber(stats.totalServices)}</Text>
            </View>
          </View>

          <View style={styles.quickStatsRow}>
            <View style={styles.quickStat}>
              <View style={styles.quickStatLeft}>
                <Text style={styles.quickStatIcon}>�</Text>
                <View>
                  <Text style={styles.quickStatValue}>{formatNumber(stats.totalBookings)}</Text>
                  <Text style={styles.quickStatLabel}>Tổng đặt chỗ</Text>
                </View>
              </View>
            </View>
            
            {stats.pendingBookings > 0 && (
              <View style={[styles.quickStat, styles.quickStatPending]}>
                <View style={styles.quickStatLeft}>
                  <Text style={styles.quickStatIcon}>⏳</Text>
                  <View>
                    <Text style={[styles.quickStatValue, { color: '#FF9800' }]}>{formatNumber(stats.pendingBookings)}</Text>
                    <Text style={styles.quickStatLabel}>Chờ xử lý</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2196F3" />
        }
      >
        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quản lý hệ thống</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{menuItems.length} mục</Text>
            </View>
          </View>

          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { borderLeftColor: item.color }]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.8}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemTop}>
                    <View style={[styles.menuIconContainer, { backgroundColor: item.iconBg }]}>
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                    </View>
                    {item.count !== undefined && item.count > 0 && (
                      <View style={[styles.countBadge2, { backgroundColor: item.color }]}>
                        <Text style={styles.countBadgeText2}>{formatNumber(item.count)}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  <View style={[styles.menuArrow, { backgroundColor: item.color }]}>
                    <Text style={styles.menuArrowText}>→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#2196F3', fontWeight: '600' },
  toastContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 20, right: 20, zIndex: 9999 },
  toastGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  toastIcon: { fontSize: 24, marginRight: 12, color: '#fff' },
  toastText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, width: '100%', maxWidth: 360, overflow: 'hidden' },
  modalHeader: { padding: 24, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalIcon: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  modalBody: { padding: 24 },
  modalMessage: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 },
  modalFooter: { flexDirection: 'row', padding: 16, gap: 12 },
  modalBtnCancel: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#F5F5F5', alignItems: 'center' },
  modalBtnCancelText: { fontSize: 16, fontWeight: '700', color: '#666' },
  modalBtnConfirm: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: '#FF3B30' },
  modalBtnConfirmText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 24, paddingHorizontal: 20, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  userSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD', borderWidth: 3, borderColor: '#2196F3' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#2196F3' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#fff' },
  userInfo: { flex: 1 },
  greeting: { fontSize: 14, color: '#666', fontWeight: '500', marginBottom: 4 },
  userName: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
  adminBadge: { alignSelf: 'flex-start', backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#2196F3' },
  adminBadgeText: { fontSize: 12, color: '#2196F3', fontWeight: '700' },
  logoutBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  logoutIcon: { fontSize: 24 },
  statsContainer: { gap: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: (width - 56) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E0E0E0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statIcon: { fontSize: 24 },
  statLabel: { fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  quickStatsRow: { flexDirection: 'row', gap: 12 },
  quickStat: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E0E0E0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  quickStatPending: { borderColor: '#FF9800', borderWidth: 2 },
  quickStatLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quickStatIcon: { fontSize: 28 },
  quickStatValue: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
  quickStatLabel: { fontSize: 11, color: '#666', fontWeight: '600' },
  content: { flex: 1 },
  contentContainer: { paddingTop: 16, paddingBottom: 40 },
  menuSection: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  sectionBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  sectionBadgeText: { fontSize: 12, color: '#2196F3', fontWeight: '700' },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  menuItem: { width: (width - 56) / 2, borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  menuItemContent: { padding: 20, minHeight: 180 },
  menuItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  menuIconContainer: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  menuIcon: { fontSize: 28 },
  countBadge2: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, minWidth: 44, alignItems: 'center' },
  countBadgeText2: { fontSize: 14, fontWeight: '800', color: '#fff' },
  menuTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
  menuSubtitle: { fontSize: 13, color: '#666', fontWeight: '500', marginBottom: 16 },
  menuArrow: { alignSelf: 'flex-start', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  menuArrowText: { fontSize: 18, color: '#fff', fontWeight: '600' },
});
