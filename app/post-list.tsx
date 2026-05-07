import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiRequest } from '../utils/api';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

type PostType = {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
};

export default function PostListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const boardId = typeof params.boardId === 'string' ? params.boardId : '';
  const boardTitle = typeof params.boardTitle === 'string' ? params.boardTitle : '게시판';
  const boardCategory = typeof params.category === 'string' ? params.category : '공지';

  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      const result = await apiRequest(`/boards/${boardId}/posts`);
      const mapped: PostType[] = result.map((item: any) => ({
        id: String(item.postId),
        title: item.title,
        authorName: item.authorName,
        createdAt: item.createdAt?.slice(0, 10) ?? '',
      }));
      setPosts(mapped);
    } catch (error: any) {
      Alert.alert('오류', '게시글 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
  useCallback(() => {
    fetchPosts();
  }, [boardId])
);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#2140DC" style={{ marginTop: 40 }} />
          ) : posts.length === 0 ? (
            <Text style={styles.emptyText}>게시글이 없습니다.</Text>
          ) : (
            posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: '/comment',
                    params: {
                      boardId: boardId,
                      postId: post.id,       // ← postId 추가
                      boardTitle: boardTitle,
                    },
                  });
                }}
              >
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                </View>
                <View style={styles.cardFooterRow}>
                  <Text style={styles.postSnippet}>{post.authorName}</Text>
                  <Text style={styles.postTime}>{post.createdAt}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.writeButton} 
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname: '/post-write',
              params: { boardId: boardId, boardTitle: boardTitle, category: boardCategory }
            });
          }}
        >
          <Text style={styles.writeButtonText}>게시글 작성</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20 },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  scrollContent: { paddingBottom: 100, paddingHorizontal: 20, paddingTop: 10 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#BDBDBD', fontSize: 14 },
  postCard: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#FFF' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  postTitle: { fontSize: 16, fontWeight: '700', color: '#111', flex: 1 },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postSnippet: { fontSize: 13, color: '#A0A0A0', flex: 1, marginRight: 15 },
  postTime: { fontSize: 12, color: '#C0C0C0' },
  bottomButtonContainer: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, backgroundColor: '#FFF' },
  writeButton: { backgroundColor: '#2140DC', height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  writeButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});