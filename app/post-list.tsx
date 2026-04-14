import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// 게시글 데이터 타입
type PostType = {
  id: string;
  title: string;
  content: string;
  timeAgo: string;
  isNew: boolean;
};

// 화면이 새로고침 되어도 유지될 초기 더미 데이터
const initialPosts: PostType[] = [
  { id: '1', title: '신메뉴 출시', content: '안녕하세요, 매니저 김입니다. 이번...', timeAgo: '방금', isNew: true },
  { id: '2', title: '레시피', content: '레시피 모음집입니다. 외부 유출은...', timeAgo: '2026-03-04', isNew: false },
];

export default function PostListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // 어떤 게시판인지 정보 가져오기 (기본값: 메뉴 안내)
  const boardTitle = typeof params.boardTitle === 'string' ? params.boardTitle : '메뉴 안내';
  const boardCategory = typeof params.category === 'string' ? params.category : '공지';

  const [posts, setPosts] = useState<PostType[]>(initialPosts);

  // 💡 핵심 마법! 작성 화면에서 '등록하기'를 눌러서 전달된 데이터가 있으면 리스트에 추가함
  useEffect(() => {
    if (params.newPostContent && params.timestamp) {
      const contentStr = params.newPostContent as string;
      
      const newPost: PostType = {
        id: params.timestamp as string,
        // 제목 칸이 없으므로 본문 내용 앞부분을 제목으로 사용
        title: contentStr.length > 10 ? contentStr.substring(0, 10) + '...' : contentStr,
        content: contentStr,
        timeAgo: '방금',
        isNew: true,
      };

      // 리스트 맨 위에 새 글 추가 (중복 추가 방지 로직 포함)
      setPosts((prevPosts) => {
        const isDuplicate = prevPosts.some(p => p.id === newPost.id);
        if (isDuplicate) return prevPosts;
        return [newPost, ...prevPosts];
      });
    }
  }, [params.newPostContent, params.timestamp]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>
          <View style={styles.headerTitleGroup}>
            <View style={[styles.badge, { backgroundColor: boardCategory === '공지' ? '#F0F4FF' : '#F5F5F5' }]}>
              <Text style={[styles.badgeText, { color: boardCategory === '공지' ? '#2140DC' : '#333' }]}>
                {boardCategory}
              </Text>
            </View>
            <Text style={styles.headerTitle}>{boardTitle}</Text>
          </View>
          <View style={{ width: 26 }} />
        </View>

        {/* 게시글 목록 */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.postTitle}>{post.title}</Text>
                {post.isNew && <Text style={styles.newTag}>new</Text>}
              </View>
              <View style={styles.cardFooterRow}>
                <Text style={styles.postSnippet} numberOfLines={1}>{post.content}</Text>
                <Text style={styles.postTime}>{post.timeAgo}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 하단 게시글 작성 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.writeButton} 
          activeOpacity={0.8}
          // 💡 버튼 누르면 작성 화면으로 이동
          onPress={() => {
            router.push({
              pathname: '/post-write',
              params: { boardTitle: boardTitle, category: boardCategory }
            });
          }}
        >
          <Text style={styles.writeButtonText}>게시글 작성</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// 스타일
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20 },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  scrollContent: { paddingBottom: 100, paddingHorizontal: 20, paddingTop: 10 },
  postCard: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#FFF' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  postTitle: { fontSize: 16, fontWeight: '700', color: '#111', flex: 1 },
  newTag: { color: '#FF3B30', fontSize: 13, fontWeight: 'bold', marginLeft: 10 },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postSnippet: { fontSize: 13, color: '#A0A0A0', flex: 1, marginRight: 15 },
  postTime: { fontSize: 12, color: '#C0C0C0' },
  bottomButtonContainer: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, backgroundColor: '#FFF' },
  writeButton: { backgroundColor: '#2140DC', height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  writeButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});