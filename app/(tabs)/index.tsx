import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { getHotels, Hotel } from '../../src/services/hotelService';
import { getTours, Tour } from '../../src/services/tourService';
import { getCurrentUser } from '../../src/services/authService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const BANNER_WIDTH = width - 32;

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [toursWithHotels, setToursWithHotels] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const bannerScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-scroll banner every 4 seconds
  useEffect(() => {
    if (tours.length > 0) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % Math.min(tours.length, 5);
          bannerScrollRef.current?.scrollTo({
            x: nextIndex * (BANNER_WIDTH + 16),
            animated: true,
          });
          return nextIndex;
        });
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [tours]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [userData, toursData] = await Promise.all([
        getCurrentUser(),
        getTours({ limit: 20, sortBy: 'createdAt:desc' }),
      ]);
      
      setUser(userData);
      setTours(toursData.results);
      
      // Filter tours that have hotels
      const toursWithHotelsData = toursData.results.filter(tour => 
        Array.isArray(tour.hotels) && tour.hotels.length > 0
      );
      setToursWithHotels(toursWithHotelsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderTourWithHotelCard = (tour: Tour) => {
    const hotelsArray = Array.isArray(tour.hotels) && tour.hotels.length > 0 
      ? tour.hotels 
      : [];
    const firstHotel = hotelsArray[0];
    const isHotelObject = typeof firstHotel === 'object' && firstHotel !== null;
    
    return (
      <TouchableOpacity
        key={tour.id}
        style={styles.tourHotelCard}
        onPress={() => router.push({ 
          pathname: '/tour-hotel-booking' as any, 
          params: { tourId: tour.id } 
        })}
        activeOpacity={0.9}
      >
        <Image
          source={{ 
            uri: tour.images?.[0] || 'https://via.placeholder.com/400x250?text=Tour' 
          }}
          style={styles.tourHotelImage}
          resizeMode="cover"
        />
        <View style={styles.tourHotelBadge}>
          <Text style={styles.tourHotelBadgeText}>
            🏨 {hotelsArray.length} khách sạn
          </Text>
        </View>
        <View style={styles.tourHotelInfo}>
          <Text style={styles.tourHotelName} numberOfLines={2}>
            {tour.name}
          </Text>
          <Text style={styles.tourHotelDestination} numberOfLines={1}>
            📍 {tour.destination} • {tour.duration}
          </Text>
          {isHotelObject && (firstHotel as any).name && (
            <Text style={styles.tourHotelIncluded} numberOfLines={1}>
              🏨 {(firstHotel as any).name}
              {hotelsArray.length > 1 && ` +${hotelsArray.length - 1} khách sạn`}
            </Text>
          )}
          <View style={styles.tourHotelFooter}>
            <View>
              <Text style={styles.tourHotelPriceLabel}>Giá tour từ</Text>
              <Text style={styles.tourHotelPrice}>
                {tour.pricePerPerson.toLocaleString('vi-VN')}₫
              </Text>
            </View>
            <TouchableOpacity style={styles.tourHotelButton}>
              <Text style={styles.tourHotelButtonText}>Chọn tour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHotelCard = (hotel: Hotel) => (
    <TouchableOpacity
      key={hotel.id}
      style={styles.hotelCard}
      onPress={() => router.push({ pathname: '/hotel-detail' as any, params: { id: hotel.id } })}
      activeOpacity={0.9}
    >
      <Image
        source={{ 
          uri: hotel.images?.[0] || 'https://via.placeholder.com/400x250?text=Hotel' 
        }}
        style={styles.hotelImage}
        resizeMode="cover"
      />
      <View style={styles.hotelInfo}>
        <View style={styles.hotelHeader}>
          <Text style={styles.hotelName} numberOfLines={1}>
            {hotel.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.hotelLocation} numberOfLines={1}>
          📍 {hotel.city}
        </Text>
        <Text style={styles.hotelDescription} numberOfLines={2}>
          {hotel.description || 'Khách sạn cao cấp với đầy đủ tiện nghi'}
        </Text>
        <View style={styles.hotelFooter}>
          <View>
            <Text style={styles.priceLabel}>Giá mỗi đêm</Text>
            <Text style={styles.priceText}>
              {hotel.pricePerNight.toLocaleString('vi-VN')}₫
            </Text>
          </View>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Đặt ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTourCard = (tour: Tour) => {
    const hasHotels = Array.isArray(tour.hotels) && tour.hotels.length > 0;
    
    const handlePress = () => {
      if (hasHotels) {
        // If tour has hotels, go to hotel selection
        router.push({ 
          pathname: '/tour-hotel-booking' as any, 
          params: { tourId: tour.id } 
        });
      } else {
        // Otherwise, go directly to tour detail
        router.push({ 
          pathname: '/tour-detail' as any, 
          params: { id: tour.id } 
        });
      }
    };

    return (
    <TouchableOpacity
      key={tour.id}
      style={styles.tourCard}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image
        source={{ 
          uri: tour.images?.[0] || 'https://via.placeholder.com/300x200?text=Tour' 
        }}
        style={styles.tourImage}
        resizeMode="cover"
      />
      <View style={styles.tourBadge}>
        <Text style={styles.tourBadgeText}>{tour.duration}</Text>
      </View>
      {hasHotels && (
        <></>
      )}
      <View style={styles.tourInfo}>
        <Text style={styles.tourName} numberOfLines={2}>
          {tour.name}
        </Text>
        <Text style={styles.tourDestination} numberOfLines={1}>
          🗺️ {tour.destination}
        </Text>
        <View style={styles.tourFooter}>
          <View>
            <Text style={styles.tourPriceLabel}>Từ</Text>
            <Text style={styles.tourPrice}>
              {tour.pricePerPerson.toLocaleString('vi-VN')}₫
            </Text>
          </View>
          <View style={styles.tourServicesContainer}>
            <Text style={styles.tourServices} numberOfLines={1}>
              ✓ {tour.includedServices?.length || 0} dịch vụ
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName}>{user?.name || 'Khách'} 👋</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khách sạn, tour du lịch..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner Slideshow */}
        <View style={styles.bannerSection}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            contentContainerStyle={styles.bannerScroll}
          >
            {tours.slice(0, 5).map((tour, index) => {
              const hasHotels = Array.isArray(tour.hotels) && tour.hotels.length > 0;
              
              return (
                <TouchableOpacity
                  key={tour.id}
                  style={styles.bannerCard}
                  onPress={() => {
                    if (hasHotels) {
                      // Tour has hotels - go to tour-hotel-booking to see details & select hotel
                      router.push({ 
                        pathname: '/tour-hotel-booking' as any, 
                        params: { tourId: tour.id } 
                      });
                    } else {
                      // No hotels - go directly to tour detail
                      router.push({ 
                        pathname: '/tour-detail' as any, 
                        params: { id: tour.id } 
                      });
                    }
                  }}
                  activeOpacity={0.95}
                >
                  <Image
                    source={{ uri: tour.images?.[0] || 'https://via.placeholder.com/400x200?text=Tour' }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                  <View style={styles.bannerOverlay}>
                    <View style={styles.bannerContent}>
                      <Text style={styles.bannerTitle} numberOfLines={2}>
                        {tour.name}
                      </Text>
                      <Text style={styles.bannerDestination}>
                        📍 {tour.destination} • {tour.duration}
                      </Text>
                      {hasHotels && (
                        <View style={styles.bannerHotelBadge}>
                          <Text style={styles.bannerHotelBadgeText}>
                            🏨 {Array.isArray(tour.hotels) ? tour.hotels.length : 0} khách sạn
                          </Text>
                        </View>
                      )}
                      <View style={styles.bannerPriceContainer}>
                        <Text style={styles.bannerPriceLabel}>Chỉ từ</Text>
                        <Text style={styles.bannerPrice}>
                          {tour.pricePerPerson.toLocaleString('vi-VN')}₫
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Pagination Dots */}
          {tours.length > 0 && (
            <View style={styles.paginationContainer}>
              {tours.slice(0, 5).map((_, index) => {
                const inputRange = [
                  (index - 1) * (BANNER_WIDTH + 16),
                  index * (BANNER_WIDTH + 16),
                  (index + 1) * (BANNER_WIDTH + 16),
                ];

                const dotWidth = scrollX.interpolate({
                  inputRange,
                  outputRange: [8, 20, 8],
                  extrapolate: 'clamp',
                });

                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.paginationDot,
                      { width: dotWidth, opacity },
                    ]}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <TouchableOpacity style={[styles.categoryCard, styles.categoryActive]}>
              <Text style={styles.categoryIcon}>🏨</Text>
              <Text style={[styles.categoryText, styles.categoryTextActive]}>
                Khách sạn
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>✈️</Text>
              <Text style={styles.categoryText}>Tour</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🎫</Text>
              <Text style={styles.categoryText}>Vé tham quan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🍽️</Text>
              <Text style={styles.categoryText}>Ẩm thực</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Tours with Hotels */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏨 Tour có khách sạn</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {toursWithHotels.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hotelsScroll}
            >
              {toursWithHotels.map(renderTourWithHotelCard)}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có tour nào có khách sạn</Text>
            </View>
          )}
        </View>

        {/* Popular Tours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✈️ Tour du lịch phổ biến</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {tours.length > 0 ? (
            <View style={styles.toursGrid}>
              {tours.map(renderTourCard)}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có tour nào</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerTop}>
            <View style={styles.footerBrand}>
              <Text style={styles.footerLogo}>✈️ TravelApp</Text>
              <Text style={styles.footerTagline}>
                Khám phá thế giới cùng chúng tôi
              </Text>
              <Text style={styles.footerDescription}>
                Nền tảng đặt tour và khách sạn trực tuyến hàng đầu Việt Nam với hàng nghìn điểm đến hấp dẫn.
              </Text>
            </View>
          </View>

          <View style={styles.footerDivider} />

          <View style={styles.footerLinks}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerColumnTitle}>Về chúng tôi</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.footerLink}>Giới thiệu</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.footerLink}>Điều khoản sử dụng</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.footerLink}>Chính sách bảo mật</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerColumn}>
              <Text style={styles.footerColumnTitle}>Hỗ trợ</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.footerLink}>Trung tâm trợ giúp</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.footerLink}>Liên hệ</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.footerLink}>Câu hỏi thường gặp</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerDivider} />

          <View style={styles.footerContact}>
            <Text style={styles.footerContactTitle}>Liên hệ với chúng tôi</Text>
            <View style={styles.footerContactRow}>
              <Text style={styles.footerContactIcon}>📞</Text>
              <TouchableOpacity onPress={() => Linking.openURL('tel:1900xxxx')}>
                <Text style={styles.footerContactText}>Hotline: 1900 xxxx</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerContactRow}>
              <Text style={styles.footerContactIcon}>📧</Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:support@travelapp.com')}>
                <Text style={styles.footerContactText}>Email: support@travelapp.com</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerContactRow}>
              <Text style={styles.footerContactIcon}>📍</Text>
              <Text style={styles.footerContactText}>
                Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
              </Text>
            </View>
          </View>

          <View style={styles.footerDivider} />

          <View style={styles.footerSocial}>
            <Text style={styles.footerSocialTitle}>Kết nối với chúng tôi</Text>
            <View style={styles.footerSocialIcons}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://facebook.com')}
              >
                <Text style={styles.socialIcon}>📘</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://instagram.com')}
              >
                <Text style={styles.socialIcon}>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://youtube.com')}
              >
                <Text style={styles.socialIcon}>📹</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://twitter.com')}
              >
                <Text style={styles.socialIcon}>🐦</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerBottom}>
            <Text style={styles.footerCopyright}>
              © 2025 TravelApp. All rights reserved.
            </Text>
            <Text style={styles.footerMadeWith}>
              Made with ❤️ in Vietnam
            </Text>
          </View>
        </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#E3F2FD',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
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
  },
  categoriesContainer: {
    marginTop: 20,
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryActive: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  categoryTextActive: {
    color: '#fff',
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  hotelsScroll: {
    paddingHorizontal: 24,
    gap: 16,
  },
  hotelCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  hotelImage: {
    width: '100%',
    height: 200,
  },
  hotelInfo: {
    padding: 16,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  hotelLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  hotelDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 16,
  },
  hotelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  toursGrid: {
    paddingHorizontal: 24,
    gap: 16,
  },
  tourCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tourImage: {
    width: '100%',
    height: 180,
  },
  tourBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tourBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tourInfo: {
    padding: 16,
  },
  tourName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  tourDestination: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tourPriceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  tourPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  tourServicesContainer: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tourServices: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  tourHotelsBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tourHotelsBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  // Banner Slideshow Styles
  bannerSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  bannerScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 0,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
    borderRadius: 12,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bannerDestination: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 12,
  },
  bannerHotelBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerHotelBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  bannerPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  bannerPriceLabel: {
    fontSize: 13,
    color: '#B0BEC5',
  },
  bannerPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD54F',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  // Footer Styles
  footer: {
    backgroundColor: '#1a1a2e',
    marginTop: 40,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  footerTop: {
    marginBottom: 24,
  },
  footerBrand: {
    alignItems: 'flex-start',
  },
  footerLogo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  footerTagline: {
    fontSize: 16,
    color: '#B0BEC5',
    marginBottom: 12,
  },
  footerDescription: {
    fontSize: 14,
    color: '#90A4AE',
    lineHeight: 22,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#37474F',
    marginVertical: 24,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  footerColumn: {
    flex: 1,
  },
  footerColumnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 14,
    color: '#B0BEC5',
    marginBottom: 12,
    lineHeight: 20,
  },
  footerContact: {
    marginBottom: 8,
  },
  footerContactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  footerContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerContactIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  footerContactText: {
    fontSize: 14,
    color: '#B0BEC5',
    flex: 1,
  },
  footerSocial: {
    alignItems: 'center',
    marginBottom: 8,
  },
  footerSocialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  footerSocialIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#263238',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 24,
  },
  footerBottom: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#37474F',
  },
  footerCopyright: {
    fontSize: 13,
    color: '#78909C',
    marginBottom: 8,
  },
  footerMadeWith: {
    fontSize: 12,
    color: '#90A4AE',
  },
  // Tour with Hotel Styles
  tourHotelCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  tourHotelImage: {
    width: '100%',
    height: 200,
  },
  tourHotelBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tourHotelBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tourHotelInfo: {
    padding: 16,
  },
  tourHotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  tourHotelDestination: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tourHotelIncluded: {
    fontSize: 13,
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  tourHotelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tourHotelPriceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  tourHotelPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  tourHotelButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tourHotelButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
