import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function NoticeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const boardTitle = String(params.boardTitle ?? '메뉴 안내 게시판');
  const title = String(params.title ?? '신메뉴 출시');
  const author = String(params.author ?? '알밤사장');
  const date = String(params.date ?? '방금');
  const content = String(
    params.content ??
      '안녕하세요, 매니저 김입니다.\n\n이번 주부터 새로운 메뉴가 출시되어 안내드립니다.'
  );
  const isNew = String(params.isNew ?? 'false') === 'true';

  const comments = [
    { id: 1, name: '알밤사원', text: '네 확인했습니다!', time: '5분 전', color: '#F5A623' },
    { id: 2, name: '알밤생B', text: '감사합니다', time: '3분 전', color: '#F78FB3' },
    { id: 3, name: '알밤생C', text: '넵', time: '방금', color: '#6C8AE4' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#2140DC" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{boardTitle}</Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {isNew && <Text style={styles.newTag}>new</Text>}
        </View>

        <View style={styles.postBox}>
          <Text style={styles.content}>{content}</Text>
        </View>

        <View style={styles.commentSection}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={[styles.avatarCircle, { backgroundColor: comment.color }]}>
                <Text style={styles.avatarText}>{comment.name.charAt(comment.name.length - 1)}</Text>
              </View>

              <View style={styles.commentContent}>
                <View style={styles.commentTopRow}>
                  <Text style={styles.commentName}>{comment.name}</Text>
                  <Text style={styles.commentTime}>{comment.time}</Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="댓글을 작성해주세요"
          placeholderTextColor="#B5B5B5"
          style={styles.input}
        />
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>등록</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },

  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },

  headerRight: {
    width: 32,
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
  },

  newTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF3B30',
  },

  postBox: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },

  content: {
    fontSize: 15,
    lineHeight: 25,
    color: '#333333',
  },

  commentSection: {
    marginTop: 6,
  },

  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  commentContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    paddingBottom: 12,
  },

  commentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  commentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222222',
  },

  commentTime: {
    fontSize: 11,
    color: '#B0B0B0',
  },

  commentText: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 18,
  },

  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },

  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#222222',
    marginRight: 8,
  },

  submitButton: {
    backgroundColor: '#2140DC',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});