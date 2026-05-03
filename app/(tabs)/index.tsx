import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiRequest } from '../../utils/api';

type UserData = {
  name: string;
  role: string;
  date: string;
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
    date: '오늘 근무 없음',
    time: '-',
  });

  const [noticeList, setNoticeList] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: 1, name: '게시판', icon: 'create-outline', path: '/board' },
    { id: 2, name: '투두리스트', icon: 'checkbox-outline', path: '/todolist' },
    { id: 3, name: '대타신청', icon: 'link-outline', path: '/substitute' },
    { id: 4, name: '스케줄표', icon: 'calendar-outline', path: '/schedule' },
  ];

  const getRoleText = (role: any) => {
    if (role === 1 || role === 'OWNER' || role === 'owner') {
      return '사장님';
    }
    return '파트타이머';
  };

  const loadHomeData = async () => {
    setLoading(true);

    try {
      // 사용자 프로필 조회
      const profileResult = await apiRequest('/user/profile');

      // 사업장 정보 조회
      const workplaceResult = await apiRequest('/workplace/info');

      // 내 사업장 게시판 전체 조회
      const boardsResult = await apiRequest('/boards/my');

      let postsResult: any[] = [];

      if (Array.isArray(boardsResult) && boardsResult.length > 0) {
        const firstBoardId =
          boardsResult[0].id ?? boardsResult[0].boardId;

        if (firstBoardId) {
          postsResult = await apiRequest(`/boards/${firstBoardId}/posts`);
        }
      }

      setUserData({
        name: profileResult?.name ?? '사용자',
        role: getRoleText(profileResult?.role),
        date: workplaceResult?.name ?? '사업장 정보 없음',
        time: '오늘 근무 확인 필요',
      });

      const postsArray = Array.isArray(postsResult)
        ? postsResult
        : postsResult?.content ?? postsResult?.posts ?? [];

      setNoticeList(
        postsArray.slice(0, 4).map((post: any, index: number) => ({
          id: post.id ?? post.postId ?? index,
          title: post.title ?? '제목 없음',
          isNew: index === 0,
        }))
      );
    } catch (error: any) {
      console.log('메인 화면 데이터 조회 실패:', error.message);
      Alert.alert('오류', '메인 화면 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
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
          <View style={styles.profileCardTop}>
            <View style={styles.profileAvatarGroup}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200',
                }}
                style={styles.avatar}
              />

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
                name="business-outline"
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
          <View style={styles.noticeHeader}>
            <Text style={styles.noticeTitle}>공지사항</Text>
          </View>

          <View style={styles.noticeCard}>
            {noticeList.length > 0 ? (
              noticeList.map((notice, index) => (
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
                  {notice.isNew && <Text style={styles.newTag}>new</Text>}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyNoticeText}>
                등록된 공지사항이 없습니다.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
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

  profileCardBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
    marginBottom: 4,
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
  emptyNoticeText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 70,
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