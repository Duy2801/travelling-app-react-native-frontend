import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  getUsers,
  updateUser,
  deleteUser,
  User,
  UpdateUserData,
} from '../../src/services/userService';
import { getCurrentUser } from '../../src/services/authService';

const ITEMS_PER_PAGE = 10;

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'user' | 'admin'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  
  // Form data - chỉ có role
  const [selectedUserRole, setSelectedUserRole] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    checkUserRole();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [currentPage, selectedRole]);

  const checkUserRole = async () => {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== 'admin') {
        Alert.alert('Lỗi', 'Bạn không có quyền truy cập trang này');
        router.back();
        return;
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xác thực người dùng');
      router.back();
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortBy: 'createdAt:desc',
      };

      if (searchQuery) {
        params.name = searchQuery;
      }

      if (selectedRole !== 'all') {
        params.role = selectedRole;
      }

      const response = await getUsers(params);
      setUsers(response.results);
      setFilteredUsers(response.results);
      setTotalPages(response.totalPages);
      setTotalResults(response.totalResults);
    } catch (error: any) {
      console.error('Error loading users:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadUsers();
    setRefreshing(false);
  }, [selectedRole, searchQuery]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers();
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Xóa người dùng',
      `Bạn có chắc chắn muốn xóa người dùng "${userName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId);
              Alert.alert('Thành công', 'Đã xóa người dùng');
              loadUsers();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa người dùng');
            }
          },
        },
      ]
    );
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setSelectedUserRole(user.role as 'user' | 'admin');
    setShowEditModal(true);
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUser) return;

    try {
      const updateData: UpdateUserData = {
        role: selectedUserRole,
      };

      await updateUser(selectedUser.id, updateData);
      Alert.alert('Thành công', 'Cập nhật vai trò thành công');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật vai trò');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>Quản lý</Text>
            <Text style={styles.headerTitle}>Người dùng</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{users.length}</Text>
          </View>
        </View>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setCurrentPage(1);
              loadUsers();
            }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, selectedRole === 'all' && styles.filterTabActive]}
            onPress={() => {
              setSelectedRole('all');
              setCurrentPage(1);
            }}
          >
            <Text style={[styles.filterText, selectedRole === 'all' && styles.filterTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, selectedRole === 'user' && styles.filterTabActive]}
            onPress={() => {
              setSelectedRole('user');
              setCurrentPage(1);
            }}
          >
            <Text style={[styles.filterText, selectedRole === 'user' && styles.filterTextActive]}>
              User
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, selectedRole === 'admin' && styles.filterTabActive]}
            onPress={() => {
              setSelectedRole('admin');
              setCurrentPage(1);
            }}
          >
            <Text style={[styles.filterText, selectedRole === 'admin' && styles.filterTextActive]}>
              Admin
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredUsers.length > 0 ? (
          <>
            {filteredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: user.role === 'admin' ? '#FF3B30' : '#007AFF' },
                        ]}
                      >
                        <Text style={styles.roleBadgeText}>
                          {user.role === 'admin' ? 'ADMIN' : 'USER'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.userMeta}>
                      <Text style={styles.userMetaText}>📅 {formatDate(user.createdAt)}</Text>
                      {user.isEmailVerified && (
                        <Text style={styles.verifiedBadge}>✓ Đã xác thực</Text>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditUser(user)}
                  >
                    <Text style={styles.actionButtonText}>✏️ Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteUser(user.id, user.name)}
                  >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                      🗑️ Xóa
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                  onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonTextDisabled]}>
                    ← Trước
                  </Text>
                </TouchableOpacity>

                <Text style={styles.pageInfo}>
                  Trang {currentPage}/{totalPages} ({totalResults} người dùng)
                </Text>

                <TouchableOpacity
                  style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                  onPress={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Text style={[styles.pageButtonText, currentPage === totalPages && styles.pageButtonTextDisabled]}>
                    Sau →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Edit Modal - Chỉ phân quyền */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Phân quyền người dùng</Text>
            {selectedUser && (
              <ScrollView>
                <Text style={styles.modalLabel}>Tên: {selectedUser.name}</Text>
                <Text style={styles.modalLabel}>Email: {selectedUser.email}</Text>
                
                <Text style={styles.modalSectionTitle}>Vai trò:</Text>
                <View style={styles.roleOptions}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      selectedUserRole === 'user' && styles.roleOptionActive,
                    ]}
                    onPress={() => setSelectedUserRole('user')}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        selectedUserRole === 'user' && styles.roleOptionTextActive,
                      ]}
                    >
                      User
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      selectedUserRole === 'admin' && styles.roleOptionActive,
                    ]}
                    onPress={() => setSelectedUserRole('admin')}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        selectedUserRole === 'admin' && styles.roleOptionTextActive,
                      ]}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                  >
                    <Text style={styles.modalCancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={handleUpdateUserRole}
                  >
                    <Text style={styles.modalCloseButtonText}>Cập nhật</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 44,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  searchContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  clearIcon: {
    fontSize: 16,
    color: '#999',
    padding: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userMetaText: {
    fontSize: 12,
    color: '#999',
  },
  verifiedBadge: {
    fontSize: 11,
    color: '#34C759',
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  pageButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  pageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pageButtonTextDisabled: {
    color: '#999',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 12,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  roleOptionActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  roleOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  roleOptionTextActive: {
    color: '#007AFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalCloseButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
