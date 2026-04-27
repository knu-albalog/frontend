import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/role-select');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.logoText}>Work Mate</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#2140DC', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logo: { 
    width: 120, 
    height: 120, 
    marginBottom: 16 
  },
  logoText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
});

