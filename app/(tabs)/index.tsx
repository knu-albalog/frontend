import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiRequest } from '../../utils/api';

import WORKY_LOGO from '../../assets/images/worky_logo.png';

type UserData = {
  name: string;
  role: string;
  workplaceName: string;
  time: string;
};

type Notice = {
  id: number;
  title: string;
  isNew: boolean;
};

export default function HomeScreen() {
  const router = useRouter();

  const [userData, setUserData] = useState<UserData>({
    name: '사용자',
    role: '파트타이머',
    workplaceName: '사업장 정보 없음',
    time: '오늘 근무 확인 필요',
  });

  const [avatarColor, setAvatarColor] = useState('#2F4AFF');
  const [noticeList, setNoticeList] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: 1, name: '게시판', icon: 'create-outline', path: '/board' },
    { id: 2, name: '투두리스트', icon: 'checkbox-outline', path: '/todolist' },
    { id: 3, name: '대타신청', icon: 'link-outline', path: '/substitute' },
    { id: 4, name: '스케줄표', icon: 'calendar-outline', path: '/schedule' },
  ];

  const getRoleText = (role: any) => {
    if (
      role === 1 ||
      role === true ||
      role === '1' ||
      role === 'OWNER' ||
      role === 'owner' ||
      role === 'ADMIN' ||
      role === 'admin' ||
      role === 'BOSS' ||
      role === 'boss' ||
      role === '사장님'
    ) {
      return '사장님';
    }
    return '파트타이머';
  };

  const loadAvatarColor = async () => {
    try {
      const savedColor = await AsyncStorage.getItem('avatarColor');

      if (savedColor !== null) {
        setAvatarColor(savedColor);
      }
    } catch (e) {
      console.log('색상 불러오기 실제 오류:', e);
    }
  };

  const loadHomeData = async () => {
    setLoading(true);

    try {
      const profileResult = await apiRequest('/user/profile');

      setUserData((prev) => ({
        ...prev,
        name: profileResult?.name ?? profileResult?.nickname ?? '사용자',
        role: getRoleText(
          profileResult?.role ??
            profileResult?.userRole ??
            profileResult?.authority ??
            profileResult?.isAdmin ??
            profileResult?.admin
        ),
      }));
    } catch (error: any) {
      console.log('프로필 조회 실패:', error.message);
    }

    try {
      const workplaceResult = await apiRequest('/workplace/info');

      setUserData((prev) => ({
        ...prev,
        workplaceName:
          workplaceResult?.name ??
          workplaceResult?.workplaceName ??
          '사업장 정보 없음',
      }));
    } catch (error: any) {
      console.log('사업장 정보 조회 실패:', error.message);
    }

    try {
      const boardsResult = await apiRequest('/boards/my');

      const boardsArray = Array.isArray(boardsResult)
        ? boardsResult
        : boardsResult?.boards ?? boardsResult?.content ?? [];

      if (boardsArray.length === 0) {
        setNoticeList([]);
        return;
      }

      const firstBoardId = boardsArray[0].id ?? boardsArray[0].boardId;

      if (!firstBoardId) {
        setNoticeList([]);
        return;
      }

      const postsResult = await apiRequest(`/boards/${firstBoardId}/posts`);

      const postsArray = Array.isArray(postsResult)
        ? postsResult
        : postsResult?.posts ?? postsResult?.content ?? [];

      setNoticeList(
        postsArray.slice(0, 4).map((post: any, index: number) => ({
          id: post.id ?? post.postId ?? index,
          title: post.title ?? '제목 없음',
          isNew: index === 0,
        }))
      );
    } catch (error: any) {
      console.log('게시판 또는 게시글 조회 실패:', error.message);
      setNoticeList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvatarColor();
    loadHomeData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAvatarColor();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F4AFF" />
          <Text style={styles.loadingText}>메인 화면을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.greetingTitle}>Hi </Text>
            <Text style={styles.userNameText}>{userData.name}</Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/notification')}>
            <Ionicons name="notifications-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatarGroup}>
            <View style={[styles.avatarIcon, { backgroundColor: avatarColor }]}>
              <Ionicons
                name={userData.role === '사장님' ? 'briefcase-outline' : 'happy-outline'}
                size={28}
                color="#FFFFFF"
              />
            </View>

            <View>
              <Text style={styles.cardName}>{userData.name}</Text>
              <Text style={styles.cardRole}>{userData.role}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.profileCardBottom}>
            <View style={styles.cardInfoItem}>
              <Ionicons name="business-outline" size={16} color="#fff" />
              <Text style={styles.cardInfoText}>{userData.workplaceName}</Text>
            </View>

            <View style={styles.cardInfoItem}>
              <Ionicons name="time-outline" size={16} color="#fff" />
              <Text style={styles.cardInfoText}>{userData.time}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.path as any)}
            >
              <View style={styles.menuIconCircle}>
                <Ionicons name={item.icon as any} size={28} color="#2F4AFF" />
              </View>
              <Text style={styles.menuName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noticeSection}>
          <Text style={styles.noticeTitle}>공지사항</Text>

          <View style={styles.noticeCard}>
            {noticeList.length > 0 ? (
              noticeList.map((notice) => (
                <Text key={notice.id} style={styles.noticeItemTitle}>
                  {notice.title}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyNoticeText}>등록된 공지사항이 없습니다.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/chatbot')}
      >
        <Image source={WORKY_LOGO} style={styles.workyIcon} />
        <Text style={styles.floatingText}>워키</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 120 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#888' },

  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerTextGroup: { flexDirection: 'row', alignItems: 'baseline' },
  greetingTitle: { fontSize: 26 },
  userNameText: { fontSize: 26, fontWeight: 'bold' },

  profileCard: { backgroundColor: '#2F4AFF', padding: 20, borderRadius: 20 },
  profileAvatarGroup: { flexDirection: 'row', alignItems: 'center' },

  avatarIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardRole: { color: '#ccc' },

  cardDivider: { height: 1, backgroundColor: '#fff', marginVertical: 10 },

  profileCardBottom: { flexDirection: 'row', flexWrap: 'wrap' },
  cardInfoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  cardInfoText: { color: '#fff', marginLeft: 5 },

  menuContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  menuItem: { alignItems: 'center', width: '22%' },
  menuIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuName: { marginTop: 5, fontSize: 12, color: '#999' },

  noticeSection: { marginTop: 30 },
  noticeTitle: { fontSize: 18, fontWeight: 'bold' },
  noticeCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    minHeight: 160,
  },
  noticeItemTitle: { fontSize: 14, color: '#333', marginBottom: 10 },
  emptyNoticeText: { color: '#999' },

  floatingButton: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    backgroundColor: '#2F4AFF',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  workyIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  backgroundColor: 'transparent',

  },

  floatingText: { color: '#fff', fontSize: 10, marginTop: 2 },
});