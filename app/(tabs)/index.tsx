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
import Svg, { Path, Ellipse } from 'react-native-svg';
import { useRouter } from 'expo-router';

function WorkiIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
      <Path
        d="M0 7.40964C0 4.51513 1.87272 2.16867 4.18275 2.16867H25.8174C28.1274 2.16867 30 4.51513 30 7.40964V24.759C30 27.6535 28.1274 30 25.8174 30H4.18275C1.87272 30 0 27.6535 0 24.759V7.40964Z"
        fill="#FFF8F8"
      />
      <Path
        d="M2.45198 8.43066H27.5481V22.827C27.5481 24.8921 26.2567 26.5663 24.6635 26.5663H5.3366C3.74347 26.5663 2.45198 24.8921 2.45198 22.827V8.43066Z"
        fill="#7688E2"
      />
      <Path
        d="M9.37506 0.903614C9.37506 0.404562 9.69793 0 10.0962 0H10.8174C11.2157 0 11.5385 0.404562 11.5385 0.903615V3.43374C11.5385 3.93279 11.2157 4.33735 10.8174 4.33735H10.0962C9.69793 4.33735 9.37506 3.93279 9.37506 3.43374V0.903614Z"
        fill="#D0E1F7"
      />
      <Path
        d="M18.4616 0.903614C18.4616 0.404562 18.7845 0 19.1828 0H19.9039C20.3022 0 20.6251 0.404562 20.6251 0.903615V3.43374C20.6251 3.93279 20.3022 4.33735 19.9039 4.33735H19.1828C18.7845 4.33735 18.4616 3.93279 18.4616 3.43374V0.903614Z"
        fill="#D0E1F7"
      />
      <Ellipse cx="21.6332" cy="14.1737" rx="2.67546" ry="3.15323" fill="#FFF8F8" />
      <Path
        d="M18.4866 22.646C22.2776 16.8915 25.6474 22.646 25.6474 22.646"
        stroke="#F5F5F5"
        strokeWidth="2"
      />
      <Ellipse cx="8.3513" cy="14.2692" rx="2.57991" ry="3.05767" fill="#FFF8F8" />
      <Path
        d="M4.28592 22.783C8.07691 17.0286 11.4467 22.783 11.4467 22.783"
        stroke="#F5F5F5"
        strokeWidth="2"
      />
      <Path
        d="M9.97601 17.3269L11.9575 22.1045L15.1804 19.7157L18.35 22.1045L20.869 17.3269"
        stroke="#2140DC"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Ellipse cx="15.1353" cy="19.7158" rx="0.764418" ry="0.859971" fill="#185EE2" />
    </Svg>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const userData = {
    name: '워클리',
    role: '파트타이머',
    workplace: '워크메이트 춘천점',
    date: '4월 12일 목요일',
    time: '11:00 - 12:00',
  };

  const menuItems = [
    { id: 1, name: '게시판', icon: 'reader-outline', path: '/notice' },
    { id: 2, name: '투두리스트', icon: 'list-outline', path: '/todolist' },
    { id: 3, name: '대타신청', icon: 'repeat-outline', path: '/substitute' },
    { id: 4, name: '스케줄표', icon: 'calendar-outline', path: '/schedule' },
  ];

  const latestNotice = {
    id: 1,
    boardTitle: '메뉴 안내 게시판',
    title: '신메뉴 출시',
    isNew: true,
    author: '알밤사장',
    date: '방금',
    content:
      `안녕하세요, 매니저 김민입니다.\n\n` +
      `이번 주부터 새로운 메뉴가 출시되어 안내드립니다.\n` +
      `신메뉴는 딸기 크림 라떼와 초코 바나나 스무디입니다.\n` +
      `출시 기념으로 1주일간 할인 이벤트도 진행됩니다.\n` +
      `제조 방법은 기존 메뉴와 다르니 메뉴북 꼭 확인해주세요.\n` +
      `재료 위치와 레시피는 매장 내 레시피북에 정리되어 있습니다.\n` +
      `주문이 많을 수 있으니 미리 숙지 부탁드립니다.\n` +
      `특히 크림 휘핑 양과 데코에 신경 써주세요.\n\n` +
      `문의사항은 언제든지 댓글로 남겨주세요.\n` +
      `많은 관심 부탁드립니다. 감사합니다. 🙏`,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Hi 워클리님</Text>
            <Text style={styles.headerSubtitle}>좋은 하루 보내세요</Text>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notification')}
          >
            <Ionicons name="notifications-outline" size={22} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* 메인 프로필 카드 */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.9}>
          <View style={styles.profileCardTop}>
            <View style={styles.profileLeft}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200',
                }}
                style={styles.avatar}
              />

              <View>
                <Text style={styles.cardName}>{userData.name}</Text>
                <Text style={styles.cardRole}>{userData.role}</Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </View>

          <View style={styles.profileMetaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="business-outline" size={13} color="#DCE5FF" />
              <Text style={styles.metaBadgeText}>{userData.workplace}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.profileCardBottom}>
            <View style={styles.cardInfoItem}>
              <Ionicons
                name="calendar-clear-outline"
                size={16}
                color="#FFFFFF"
                style={styles.infoIcon}
              />
              <Text style={styles.cardInfoText}>{userData.date}</Text>
            </View>

            <View style={styles.cardInfoItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color="#FFFFFF"
                style={styles.infoIcon}
              />
              <Text style={styles.cardInfoText}>{userData.time}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 메뉴 */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              activeOpacity={0.85}
              onPress={() => router.push(item.path as any)}
            >
              <View style={styles.menuIconCircle}>
                <Ionicons name={item.icon as any} size={22} color="#2140DC" />
              </View>
              <Text style={styles.menuName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 공지사항 */}
        <View style={styles.noticeSection}>
          <View style={styles.noticeHeader}>
            <Text style={styles.noticeTitle}>공지사항</Text>
            <TouchableOpacity onPress={() => router.push('/notice')}>
              <Text style={styles.noticeMore}>더보기</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.noticeCard}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: '/notice-detail',
                params: {
                  boardTitle: latestNotice.boardTitle,
                  title: latestNotice.title,
                  author: latestNotice.author,
                  date: latestNotice.date,
                  content: latestNotice.content,
                  isNew: latestNotice.isNew ? 'true' : 'false',
                },
              })
            }
          >
            <View style={styles.noticeTopRow}>
              <View style={styles.noticeBoardBadge}>
                <Text style={styles.noticeBoardBadgeText}>공지</Text>
              </View>
              <Text style={styles.noticeBoardText}>{latestNotice.boardTitle}</Text>
              {latestNotice.isNew && <Text style={styles.newTag}>new</Text>}
            </View>

            <Text style={styles.noticeContentTitle}>{latestNotice.title}</Text>

            <View style={styles.noticePreviewLines}>
              <View style={[styles.noticePreviewBar, { width: '92%' }]} />
              <View style={[styles.noticePreviewBar, { width: '85%' }]} />
              <View style={[styles.noticePreviewBar, { width: '78%' }]} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 우측 하단 워키 버튼 */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.9}
        onPress={() => router.push('/chatbot')}
      >
        <WorkiIcon />
        <Text style={styles.floatingText}>워키</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#8C8C8C',
  },

  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F8FC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileCard: {
    backgroundColor: '#2140DC',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 28,
    shadowColor: '#2140DC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },

  profileCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#EAEAEA',
  },

  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  cardRole: {
    marginTop: 3,
    fontSize: 13,
    color: '#D0E1F7',
  },

  profileMetaRow: {
    marginTop: 14,
  },

  metaBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  metaBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#DCE5FF',
  },

  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: 16,
  },

  profileCardBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
    marginBottom: 6,
  },

  infoIcon: {
    marginRight: 6,
  },

  cardInfoText: {
    fontSize: 13,
    color: '#FFFFFF',
  },

  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },

  menuItem: {
    alignItems: 'center',
    width: '23%',
  },

  menuIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#F5F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  menuName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6F7480',
    textAlign: 'center',
    lineHeight: 16,
  },

  noticeSection: {
    marginTop: 4,
  },

  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  noticeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202020',
  },

  noticeMore: {
    fontSize: 13,
    color: '#2140DC',
    fontWeight: '600',
  },

  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF1F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  noticeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  noticeBoardBadge: {
    backgroundColor: '#F1F3F9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },

  noticeBoardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5E6472',
  },

  noticeBoardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C2C2C',
    flex: 1,
  },

  noticeContentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 14,
  },

  newTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF4D4F',
  },

  noticePreviewLines: {
    marginTop: 2,
  },

  noticePreviewBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E7E7E7',
    marginBottom: 10,
  },

  floatingButton: {
    position: 'absolute',
    right: 24,
    bottom: 28,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#2140DC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2140DC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  floatingText: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});