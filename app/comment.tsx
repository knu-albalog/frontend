import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

type CommentType = {
  id: number;
  name: string;
  text: string;
  time: string;
  color: string;
  isMine: boolean;
};

export default function NoticeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const boardTitle = String(params.boardTitle ?? '메뉴 안내 게시판');
  const title = String(params.title ?? '신메뉴 출시');
  const author = String(params.author ?? '알밤사장');
  const date = String(params.date ?? '방금');
  const content = String(params.content ?? '');
  const isNew = String(params.isNew ?? 'false') === 'true';

  const [comments, setComments] = useState<CommentType[]>([
    { id: 1, name: '알밤사원', text: '네 확인했습니다!', time: '5분 전', color: '#F5A623', isMine: false },
    { id: 2, name: '알밤생B', text: '감사합니다', time: '3분 전', color: '#F78FB3', isMine: false },
  ]);

  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // 등록 / 수정
  const handleSubmit = () => {
    if (inputText.trim() === '') return;

    if (editingId !== null) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === editingId ? { ...c, text: inputText } : c
        )
      );
      setEditingId(null);
    } else {
      const newComment: CommentType = {
        id: Date.now(),
        name: '나',
        text: inputText,
        time: '방금',
        color: '#2140DC',
        isMine: true,
      };
      setComments((prev) => [...prev, newComment]);
    }

    setInputText('');
  };

  // 삭제
  const handleDelete = (id: number) => {
    Alert.alert('삭제', '댓글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setComments((prev) => prev.filter((c) => c.id !== id));
        },
      },
    ]);
  };

  // 수정
  const handleEdit = (comment: CommentType) => {
    setInputText(comment.text);
    setEditingId(comment.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 100 : 0}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#2140DC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{boardTitle}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* 제목 */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {isNew && <Text style={styles.newTag}>new</Text>}
          </View>

          {/* 작성자 + 시간 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{author}</Text>
            <Text style={styles.infoText}>{date}</Text>
          </View>

          {/* 본문 */}
          <View style={styles.postBox}>
            <Text style={styles.content}>{content}</Text>
          </View>

          {/* 댓글 */}
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={[styles.avatarCircle, { backgroundColor: comment.color }]}>
                <Text style={styles.avatarText}>
                  {comment.name.charAt(0)}
                </Text>
              </View>

              <View style={styles.commentContent}>
                <View style={styles.commentTopRow}>
                  <Text style={styles.commentName}>{comment.name}</Text>
                  <Text style={styles.commentTime}>{comment.time}</Text>
                </View>

                <Text style={styles.commentText}>{comment.text}</Text>

                {/* 내가 쓴 댓글만 */}
                {comment.isMine && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => handleEdit(comment)}>
                      <Text style={styles.actionText}>수정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(comment.id)}>
                      <Text style={[styles.actionText, { color: '#FF3B30' }]}>
                        삭제
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 입력창 */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="댓글을 작성해주세요"
            placeholderTextColor="#B5B5B5"
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {editingId !== null ? '수정' : '등록'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  titleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
  },

  newTag: {
    color: '#FF3B30',
    fontSize: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  infoText: {
    fontSize: 12,
    color: '#999',
  },

  postBox: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },

  content: {
    fontSize: 14,
    lineHeight: 22,
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
    color: '#fff',
    fontWeight: '700',
  },

  commentContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    paddingBottom: 10,
  },

  commentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  commentName: {
    fontWeight: '700',
    fontSize: 13,
  },

  commentTime: {
    fontSize: 11,
    color: '#999',
  },

  commentText: {
    fontSize: 13,
    marginTop: 4,
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },

  actionText: {
    fontSize: 12,
    color: '#2140DC',
  },

  inputContainer: {
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