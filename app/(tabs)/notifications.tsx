import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function NotificationsScreen() {
  const [notifications] = useState([
    {
      id: '1',
      type: 'booking',
      icon: '✅',
      title: 'Đặt tour thành công',
      message: 'Tour "Hà Nội - Hạ Long 3N2Đ" của bạn đã được xác nhận',
      time: '2 giờ trước',
      read: false,
    },
    {
      id: '2',
      type: 'promotion',
      icon: '🎉',
      title: 'Ưu đãi đặc biệt',
      message: 'Giảm 20% cho tour Đà Nẵng - Hội An. Chỉ còn 3 ngày!',
      time: '5 giờ trước',
      read: false,
    },
    {
      id: '3',
      type: 'reminder',
      icon: '⏰',
      title: 'Nhắc nhở',
      message: 'Tour của bạn sẽ bắt đầu vào 15/11/2025. Hãy chuẩn bị hành lý!',
      time: '1 ngày trước',
      read: true,
    },
    {
      id: '4',
      type: 'payment',
      icon: '💳',
      title: 'Thanh toán thành công',
      message: 'Bạn đã thanh toán 5,000,000₫ cho tour Hà Nội - Hạ Long',
      time: '2 ngày trước',
      read: true,
    },
    {
      id: '5',
      type: 'system',
      icon: 'ℹ️',
      title: 'Cập nhật hệ thống',
      message: 'Ứng dụng đã được cập nhật phiên bản mới với nhiều tính năng',
      time: '3 ngày trước',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return '#4CAF50';
      case 'promotion': return '#FF9800';
      case 'reminder': return '#2196F3';
      case 'payment': return '#9C27B0';
      case 'system': return '#607D8B';
      default: return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSubtitle}>
          Cập nhật thông tin mới nhất về tour của bạn
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Đánh dấu đã đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.unreadCard,
            ]}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getNotificationColor(notification.type) + '20' },
              ]}
            >
              <Text style={styles.notificationIcon}>{notification.icon}</Text>
            </View>
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle} numberOfLines={1}>
                  {notification.title}
                </Text>
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 12,
  },
  badge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  actionButton: {
    alignSelf: 'flex-end',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
  },
});
