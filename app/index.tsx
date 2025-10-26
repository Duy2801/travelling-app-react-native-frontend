import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { isAuthenticated } from '../src/services/authService';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await isAuthenticated();
      console.log('Index: isAuthenticated =', authenticated);
      
      if (authenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/login');
    } finally {
      setIsChecking(false);
    }
  };

  // Hiển thị loading screen
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
