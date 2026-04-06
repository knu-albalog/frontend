import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationScreen() {
  const router = useRouter();

  // 임시 알림 데이터
  const notifications = [
    { id: '1', title: '새로운 대타 요청이 있습니다.', time: '10분 전', isRead: false },
    { id: '2', title: '점주님이 이번 주 스케줄을 확정했습니다.', time: '1시간 전', isRead: false },
    { id: '3', title: '공지사항이 등록되었습니다.', time: '어제', isRead: true },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 헤더 영역 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <View style={{ width: 24 }} /> {/* 중앙 정렬용 빈 공간 */}
      </View>
      
      {/* 알림 리스트 영역 */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={[styles.notificationItem, item.isRead && styles.readItem]}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={20} color={item.isRead ? "#A0A0A0" : "#2F4AFF"} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, item.isRead && styles.readText]}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
        )}
      />
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
  listContainer: { padding: 20 },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  readItem: { opacity: 0.6 }, // 읽은 알림은 약간 흐리게
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  title: { fontSize: 15, color: '#333', marginBottom: 4 },
  readText: { color: '#888' },
  time: { fontSize: 12, color: '#999' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginLeft: 10,
  }
});