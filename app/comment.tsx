import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView, StyleSheet, Text, TouchableOpacity, View,
  ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiRequest } from '../utils/api';

type CommentType = {
  id: number;
  name: string;
  text: string;
  time: string;
  color: string;
  isMine: boolean;
  authorId: number;
};

type PostDetailType = {
  postId: number;
  title: string;
  content: string;
  authorName: string;
  authorId: number;
  createdAt: string;
};

export default function CommentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);

  const boardId = String(params.boardId ?? '');
  const postId = String(params.postId ?? '');
  const boardTitle = String(params.boardTitle ?? '게시판');

  const [post, setPost] = useState<PostDetailType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');

  // 내 프로필 불러오기
  const fetchMyProfile = async () => {
    try {
      const result = await apiRequest('/user/profile');
      setMyUserId(result.id);
    } catch {}
  };

  // 게시글 상세 불러오기
  const fetchPost = async () => {
    setLoading(true);
    try {
      const result = await apiRequest(`/boards/${boardId}/posts/${postId}`);
      setPost(result);
      setEditPostTitle(result.title);
      setEditPostContent(result.content);
    } catch {
      Alert.alert('오류', '게시글을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 댓글 목록 불러오기
  const fetchComments = async () => {
    try {
      const result = await apiRequest(`/posts/${postId}/comments`);
      const mapped: CommentType[] = result.map((item: any, index: number) => ({
        id: item.commentId,
        name: item.authorName,
        text: item.content,
        time: item.createdAt?.slice(0, 10) ?? '',
        color: getAvatarColor(index),
        isMine: item.authorId === myUserId,
        authorId: item.authorId,
      }));
      setComments(mapped);
    } catch {}
  };

  useEffect(() => {
    fetchMyProfile();
    fetchPost();
  }, []);

  useEffect(() => {
    if (myUserId !== null) fetchComments();
  }, [myUserId]);

  // 게시글 수정
  const handleEditPost = async () => {
    if (editPostTitle.trim() === '' || editPostContent.trim() === '') return;
    try {
      await apiRequest(`/boards/${boardId}/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editPostTitle.trim(),
          content: editPostContent.trim(),
        }),
      });
      setIsEditingPost(false);
      await fetchPost();
    } catch {
      Alert.alert('오류', '게시글 수정에 실패했습니다.');
    }
  };

  // 게시글 삭제
  const handleDeletePost = () => {
    Alert.alert('게시글 삭제', '게시글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/boards/${boardId}/posts/${postId}`, { method: 'DELETE' });
            router.back();
          } catch {
            Alert.alert('오류', '게시글 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  // 댓글 등록
  const handleSubmit = async () => {
    if (inputText.trim() === '') return;
    setSubmitLoading(true);
    try {
      await apiRequest(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: inputText.trim() }),
      });
      setInputText('');
      await fetchComments();
      // 댓글 등록 후 스크롤 아래로
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch {
      Alert.alert('오류', '댓글 등록에 실패했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = (commentId: number) => {
    Alert.alert('댓글 삭제', '댓글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiRequest(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
            await fetchComments();
          } catch {
            Alert.alert('오류', '댓글 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const getAvatarColor = (index: number) => {
    const colors = ['#F5A623', '#F78FB3', '#2140DC', '#4CAF50', '#9C27B0'];
    return colors[index % colors.length];
  };

  const isMyPost = post && myUserId !== null && post.authorId === myUserId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#2140DC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{boardTitle}</Text>
          {isMyPost && !isEditingPost ? (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setIsEditingPost(true)} style={styles.headerBtn}>
                <Ionicons name="pencil-outline" size={18} color="#2140DC" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeletePost} style={styles.headerBtn}>
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2140DC" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {post && (
              <>
                {/* 게시글 수정 모드 */}
                {isEditingPost ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editTitleInput}
                      value={editPostTitle}
                      onChangeText={setEditPostTitle}
                      placeholder="제목"
                      placeholderTextColor="#BDBDBD"
                    />
                    <TextInput
                      style={styles.editContentInput}
                      value={editPostContent}
                      onChangeText={setEditPostContent}
                      placeholder="내용"
                      placeholderTextColor="#BDBDBD"
                      multiline
                      textAlignVertical="top"
                    />
                    <View style={styles.editBtnRow}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setIsEditingPost(false)}
                      >
                        <Text style={styles.cancelBtnText}>취소</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleEditPost}
                      >
                        <Text style={styles.saveBtnText}>저장</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>{post.title}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoText}>{post.authorName}</Text>
                      <Text style={styles.infoText}>{post.createdAt?.slice(0, 10)}</Text>
                    </View>
                    <View style={styles.postBox}>
                      <Text style={styles.content}>{post.content}</Text>
                    </View>
                  </>
                )}
              </>
            )}

            {/* 댓글 목록 */}
            {comments.map((comment, index) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={[styles.avatarCircle, { backgroundColor: getAvatarColor(index) }]}>
                  <Text style={styles.avatarText}>{comment.name.charAt(0)}</Text>
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentTopRow}>
                    <Text style={styles.commentName}>{comment.name}</Text>
                    <Text style={styles.commentTime}>{comment.time}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  {comment.isMine && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                        <Text style={[styles.actionText, { color: '#FF3B30' }]}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* 댓글 입력창 */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="댓글을 작성해주세요"
            placeholderTextColor="#B5B5B5"
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity
            style={[styles.submitButton, inputText.trim() === '' && { backgroundColor: '#BDBDBD' }]}
            onPress={handleSubmit}
            disabled={submitLoading || inputText.trim() === ''}
          >
            {submitLoading
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={styles.submitButtonText}>등록</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: { padding: 4 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  titleRow: { flexDirection: 'row', marginBottom: 8, marginTop: 12 },
  title: { flex: 1, fontSize: 22, fontWeight: '800' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoText: { fontSize: 12, color: '#999' },
  postBox: { borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 8, padding: 16, marginBottom: 20 },
  content: { fontSize: 14, lineHeight: 22 },
  editContainer: { marginVertical: 12 },
  editTitleInput: { fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingVertical: 8, marginBottom: 12, color: '#111' },
  editContentInput: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, minHeight: 150, fontSize: 14, color: '#111', marginBottom: 12 },
  editBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#BDBDBD' },
  cancelBtnText: { fontSize: 13, color: '#888' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2140DC' },
  saveBtnText: { fontSize: 13, color: '#FFF', fontWeight: 'bold' },
  commentItem: { flexDirection: 'row', marginBottom: 16 },
  avatarCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: '700' },
  commentContent: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#F1F1F1', paddingBottom: 10 },
  commentTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  commentName: { fontWeight: '700', fontSize: 13 },
  commentTime: { fontSize: 11, color: '#999' },
  commentText: { fontSize: 13, marginTop: 4 },
  actionRow: { flexDirection: 'row', marginTop: 6, gap: 12 },
  actionText: { fontSize: 12, color: '#2140DC' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEEEEE', backgroundColor: '#FFFFFF' },
  input: { flex: 1, height: 40, backgroundColor: '#F8F8F8', borderRadius: 20, paddingHorizontal: 14, fontSize: 13, marginRight: 8 },
  submitButton: { backgroundColor: '#2140DC', paddingHorizontal: 14, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  submitButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});