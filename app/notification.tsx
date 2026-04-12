import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type NotificationItem = {
  id: string;
  title: string;
  time: string;
  isRead: boolean;
};

export default function NotificationScreen() {
  const router = useRouter();

  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: '새로운 대타 요청이 있습니다.',
      time: '10분 전',
      isRead: false,
    },
    {
      id: '2',
      title: '점주님이 이번 주 스케줄을 확정했습니다.',
      time: '1시간 전',
      isRead: false,
    },
    {
      id: '3',
      title: '공지사항이 등록되었습니다.',
      time: '어제',
      isRead: true,
    },
  ];

  const renderItem: ListRenderItem<NotificationItem> = ({ item }) => {
    return (
      <View style={[styles.notificationItem, item.isRead ? styles.readItem : null]}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={item.isRead ? '#A0A0A0' : '#2F4AFF'}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, item.isRead ? styles.readText : null]}>
            {item.title}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>알림</Text>

        <View style={styles.headerRightSpace} />
      </View>

      {/* 알림 리스트 */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },

  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },

  headerRightSpace: {
    width: 24,
    height: 24,
  },

  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },

  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  readItem: {
    opacity: 0.6,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    color: '#333333',
    marginBottom: 4,
    lineHeight: 21,
  },

  readText: {
    color: '#888888',
  },

  time: {
    fontSize: 12,
    color: '#999999',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginLeft: 10,
  },
});