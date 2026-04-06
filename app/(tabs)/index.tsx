import React from 'react';
import { Image, StyleSheet, Platform, View, ScrollView, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const userData = {
    name: '워클리',
    role: '파트타이머',
    date: '4월 12일 목요일',
    time: '11:00 - 12:00',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* --- 상단 헤더 --- */}
        <View style={styles.header}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.greetingTitle}>Hi </Text>
            <Text style={styles.userNameText}>{userData.name}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>

        {/* --- 중앙 프로필 카드 --- */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardTop}>
            <View style={styles.profileAvatarGroup}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200' }} 
                style={styles.avatar}
              />
              <View style={styles.nameRoleGroup}>
                <Text style={styles.cardName}>{userData.name}</Text>
                <Text style={styles.cardRole}>{userData.role}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.profileCardBottom}>
            <View style={styles.cardInfoItem}>
              <Ionicons name="calendar-clear-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.cardInfoText}>{userData.date}</Text>
            </View>
            <View style={styles.cardInfoItem}>
              <Ionicons name="time-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.cardInfoText}>{userData.time}</Text>
            </View>
          </View>
        </View>

        {/* --- 중앙 아이콘 메뉴 --- */}
        <View style={styles.menuContainer}>
          {[
            { id: 1, name: '게시판', icon: 'create-outline' },
            { id: 2, name: '투두리스트', icon: 'person-outline' },
            { id: 3, name: '대타신청', icon: 'link-outline' },
            { id: 4, name: '스케줄표', icon: 'calendar-outline' },
          ].map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.menuIconCircle}>
                <Ionicons name={item.icon as any} size={28} color="#2F4AFF" />
              </View>
              <Text style={styles.menuName}>{item.name}</Text>
            </View>
          ))}
        </View>

        {/* --- 공지사항 섹션 (새로 추가됨) --- */}
        <View style={styles.noticeSection}>
          <View style={styles.noticeHeader}>
            <Text style={styles.noticeTitle}>공지사항 +</Text>
          </View>
          
          <View style={styles.noticeCard}>
            <View style={styles.noticeCardHeader}>
              <Text style={styles.noticeContentTitle}>공지사항에는 '게시글'이 최신 순서로 오게 함</Text>
              <Text style={styles.newTag}>new</Text>
            </View>
            
            {/* 시안의 회색 바 형태 재현 */}
            <View style={styles.noticeBar} />
            <View style={styles.noticeBar} />
            <View style={styles.noticeBar} />
          </View>
        </View>
      </ScrollView>

      {/* --- 우측 하단 워키 버튼 (Floating Action Button) --- */}
      <TouchableOpacity style={styles.floatingButton}>
        <Ionicons name="calendar" size={24} color="#fff" />
        <Text style={styles.floatingText}>워키</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingTop: 20, paddingBottom: 100 }, // 버튼 가리지 않게 하단 여백 추가
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTextGroup: { flexDirection: 'row', alignItems: 'baseline' },
  greetingTitle: { fontSize: 26, color: '#000' },
  userNameText: { fontSize: 26, fontWeight: 'bold', color: '#000' },
  
  profileCard: { backgroundColor: '#2F4AFF', borderRadius: 20, padding: 20, marginBottom: 35 },
  profileCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileAvatarGroup: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: '#eee' },
  cardName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  cardRole: { fontSize: 14, color: '#BDC7FF' },
  cardDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginVertical: 18 },
  profileCardBottom: { flexDirection: 'row' },
  cardInfoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  cardInfoText: { fontSize: 14, color: '#fff' },
  
  menuContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  menuItem: { alignItems: 'center', width: '22%' },
  menuIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F0F2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  menuName: { fontSize: 12, color: '#999', fontWeight: '500' },

  // 공지사항 스타일
  noticeSection: { marginTop: 10 },
  noticeHeader: { marginBottom: 15 },
  noticeTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  noticeCard: { 
    borderWidth: 1, 
    borderColor: '#333', 
    borderRadius: 2, // 시안처럼 약간 각진 느낌
    padding: 20,
    minHeight: 250,
  },
  noticeCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  noticeContentTitle: { fontSize: 15, fontWeight: 'bold', marginRight: 8 },
  newTag: { color: 'red', fontWeight: 'bold', fontSize: 12 },
  noticeBar: { 
    height: 18, 
    backgroundColor: '#E0E0E0', 
    marginBottom: 12, 
    width: '85%' 
  },

  // 플로팅 버튼 스타일
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    backgroundColor: '#2F4AFF',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  floatingText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginTop: 2 }
});