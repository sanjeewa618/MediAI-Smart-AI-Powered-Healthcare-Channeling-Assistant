import React, { useState, useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';

const RealTimeClock = () => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const slTime = new Date(utc + (5.5 * 3600000));
      
      const dateStr = slTime.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      const timeStr = slTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      
      setTimeStr(`${dateStr} • ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000); // Live tick every second
    return () => clearInterval(interval);
  }, []);

  return (
    <View 
      pointerEvents="none" 
      style={{
        position: 'absolute',
        top: Platform.OS === 'ios' ? 45 : 30,
        right: 15,
        backgroundColor: 'rgba(15, 23, 42, 0.7)', // Sleek dark glassmorphism
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        zIndex: 999999,
        elevation: 10,
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700', fontFamily: 'System' }}>
        🇱🇰 {timeStr}
      </Text>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
          <RealTimeClock />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
