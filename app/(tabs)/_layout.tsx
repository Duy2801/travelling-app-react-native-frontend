import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Trang chủ",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24 }}>🏠</Text>
          ),
        }} 
      />
      <Tabs.Screen 
        name="services" 
        options={{ 
          title: "Dịch vụ",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24 }}>🎯</Text>
          ),
        }} 
      />
      <Tabs.Screen 
        name="bookings" 
        options={{ 
          title: "Đặt tour",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24 }}>📋</Text>
          ),
        }} 
      />
      <Tabs.Screen 
        name="notifications" 
        options={{ 
          title: "Thông báo",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24 }}>🔔</Text>
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: "Tài khoản",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: focused ? 26 : 24 }}>👤</Text>
          ),
        }} 
      />
    </Tabs>
  );
}
