import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  ScrollView,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  // 사용자 데이터
  const userData = {
    name: '워클리',
    role: '파트타이머',
    date: '4월 12일 목요일',
    time: '11:00 - 12:00',
  };

  // 중앙 메뉴 데이터 (🔥 게시판 → notice로 수정)
  const menuItems = [
    { id: 1, name: '게시판', icon: 'create-outline', path: '/board' },
    { id: 2, name: '투두리스트', icon: 'checkbox-outline', path: '/todolist' },
    { id: 3, name: '대타신청', icon: 'link-outline', path: '/substitute' },
    { id: 4, name: '스케줄표', icon: 'calendar-outline', path: '/schedule' },
  ];

  // 공지사항 데이터
  const noticeList = [
    { id: 1, title: "공지사항에는 '게시글'이 최신 순서로 오게 함", isNew: true },
    { id: 2, title: '4월 전체 알바생 회식 일정 안내', isNew: false },
    { id: 3, title: '포스기 마감 정산 방법 변경의 건', isNew: false },
    { id: 4, title: '여름 시즌 신메뉴 레시피 교육 자료', isNew: false },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.greetingTitle}>Hi </Text>
            <Text style={styles.userNameText}>{userData.name}</Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/notification')}>
            <Ionicons name="notifications-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileCardTop}>
            <View style={styles.profileAvatarGroup}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200',
                }}
                style={styles.avatar}
              />

              {/* 🔥 여기 오류였던 부분 */}
              <View style={styles.nameRoleGroup}>
                <Text style={styles.cardName}>{userData.name}</Text>
                <Text style={styles.cardRole}>{userData.role}</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.profileCardBottom}>
            <View style={styles.cardInfoItem}>
              <Ionicons
                name="calendar-clear-outline"
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.cardInfoText}>{userData.date}</Text>
            </View>

            <View style={styles.cardInfoItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.cardInfoText}>{userData.time}</Text>
            </View>
          </View>
        </View>

        {/* 중앙 메뉴 */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                if (item.path) {
                  router.push(item.path as any);
                }
              }}
            >
              <View style={styles.menuIconCircle}>
                <Ionicons
                  name={item.icon as any}
                  size={28}
                  color="#2F4AFF"
                />
              </View>
              <Text style={styles.menuName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 공지사항 */}
        <View style={styles.noticeSection}>
          <View style={styles.noticeHeader}>
            <Text style={styles.noticeTitle}>공지사항</Text>
          </View>

          <View style={styles.noticeCard}>
            {noticeList.map((notice, index) => (
              <TouchableOpacity
                key={notice.id}
                style={[
                  styles.noticeListItem,
                  index !== noticeList.length - 1 &&
                    styles.noticeListBorder,
                ]}
                onPress={() => router.push('/comment')}
              >
                <Text style={styles.noticeItemTitle} numberOfLines={1}>
                  {notice.title}
                </Text>
                {notice.isNew && (
                  <Text style={styles.newTag}>new</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 플로팅 버튼 */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.8}
        onPress={() => router.push('/chatbot')}
      >
        <Ionicons name="calendar" size={24} color="#fff" />
        <Text style={styles.floatingText}>워키</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  contentContainer: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTextGroup: { flexDirection: 'row', alignItems: 'baseline' },
  greetingTitle: { fontSize: 26, color: '#000' },
  userNameText: { fontSize: 26, fontWeight: 'bold', color: '#000' },

  profileCard: {
    backgroundColor: '#2F4AFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 35,
  },
  profileCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileAvatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#eee',
  },

  // 🔥 추가된 스타일
  nameRoleGroup: {
    justifyContent: 'center',
  },

  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  cardRole: { fontSize: 14, color: '#BDC7FF' },

  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 18,
  },

  profileCardBottom: { flexDirection: 'row' },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },
  cardInfoText: { fontSize: 14, color: '#fff' },

  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  menuItem: { alignItems: 'center', width: '22%' },
  menuIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuName: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },

  noticeSection: { marginTop: 10 },
  noticeHeader: { marginBottom: 15 },
  noticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  noticeCard: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 200,
  },

  noticeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  noticeListBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  noticeItemTitle: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  newTag: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 12,
  },

  floatingButton: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    backgroundColor: '#2F4AFF',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  floatingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
});