import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WalkieScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>워키 (AI 챗봇)</Text>
        <View style={{ width: 24 }} /> {/* 헤더 타이틀 중앙 정렬을 위한 빈 공간 */}
      </View>
      
      <View style={styles.container}>
        <Text style={styles.subtitle}>안녕하세요! 무엇을 도와드릴까요?</Text>
        <Text style={styles.infoText}>여기에 AI 채팅 UI가 들어갈 예정입니다.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#2F4AFF' },
  infoText: { fontSize: 16, color: '#555' }
});