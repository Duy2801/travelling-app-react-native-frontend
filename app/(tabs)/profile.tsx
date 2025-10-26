import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, logout } from '../../src/services/authService';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔄 Starting logout...');
      setIsLoggingOut(true);
      
      // Logout và xóa tokens
      await logout();
      console.log('✅ Logout successful');
      
      // Clear user state
      setUser(null);
      
      // Chuyển về trang login
      console.log('➡️ Redirecting to login...');
      router.replace('/login');
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Nếu chưa đăng nhập, hiển thị màn hình yêu cầu đăng nhập
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loginPromptContainer}>
          <View style={styles.loginPromptIcon}>
            <Text style={styles.loginPromptIconText}>👤</Text>
          </View>
          <Text style={styles.loginPromptTitle}>Chưa đăng nhập</Text>
          <Text style={styles.loginPromptText}>
            Vui lòng đăng nhập để sử dụng đầy đủ tính năng
          </Text>
          <TouchableOpacity
            style={styles.loginPromptButton}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.loginPromptButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
        {user?.isEmailVerified ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Email đã xác thực</Text>
          </View>
        ) : (
          <View style={styles.unverifiedBadge}>
            <Text style={styles.unverifiedText}>⚠️ Chưa xác thực email</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>Thông tin cá nhân</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={styles.menuText}>Đơn đặt tour</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>❤️</Text>
            <Text style={styles.menuText}>Yêu thích</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>Thông báo</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🌍</Text>
            <Text style={styles.menuText}>Ngôn ngữ</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>Trợ giúp</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📞</Text>
            <Text style={styles.menuText}>Liên hệ</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>ℹ️</Text>
            <Text style={styles.menuText}>Về chúng tôi</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]} 
          onPress={() => {
            console.log('=== LOGOUT BUTTON CLICKED ===');
            handleLogout();
          }}
          disabled={isLoggingOut}
          activeOpacity={0.7}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#FF3B30" />
          ) : (
            <Text style={styles.logoutText}>🚪 Đăng xuất</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#E3F2FD',
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  unverifiedBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  unverifiedText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  menuSection: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  logoutButton: {
    marginHorizontal: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginPromptIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginPromptIconText: {
    fontSize: 60,
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  loginPromptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginPromptButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginPromptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
