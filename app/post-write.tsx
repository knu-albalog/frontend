import React, { useState } from 'react';
import { 
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PostWriteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const boardTitle = typeof params.boardTitle === 'string' ? params.boardTitle : '메뉴 안내';
  const boardCategory = typeof params.category === 'string' ? params.category : '공지';

  const [content, setContent] = useState('');

  // 💡 등록 버튼 누르면 실행되는 함수
  const handleRegister = () => {
    if (content.trim() === '') return;
    
    // 리스트 화면으로 강제로 이동하면서, 내가 쓴 내용을 '수하물(params)'로 같이 보냄!
    router.push({
      pathname: '/post-list',
      params: { 
        boardTitle: boardTitle, 
        category: boardCategory,
        newPostContent: content, // 내가 방금 친 글씨
        timestamp: Date.now().toString() // 고유 ID용 시간
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 상단 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-back" size={26} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>게시글 작성</Text>
            <View style={{ width: 26 }} />
          </View>

          {/* 카테고리 고정 박스 */}
          <View style={styles.boardSelectBox}>
            <View style={[styles.badge, { backgroundColor: boardCategory === '공지' ? '#F0F4FF' : '#F5F5F5' }]}>
              <Text style={[styles.badgeText, { color: boardCategory === '공지' ? '#2140DC' : '#333' }]}>
                {boardCategory}
              </Text>
            </View>
            <Text style={styles.selectedBoardName}>{boardTitle}</Text>
            <Ionicons name="chevron-down" size={18} color="#BDBDBD" />
          </View>

          {/* 본문 입력 영역 */}
          <View style={styles.inputWrapper}>
            <View style={styles.charCountContainer}>
              <Text style={styles.charCountText}>
                {content.length.toLocaleString()}/1,000
              </Text>
            </View>

            <TextInput
              style={styles.contentInput}
              placeholder="내용을 입력해주세요"
              placeholderTextColor="#BDBDBD"
              multiline={true}
              maxLength={1000}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
              autoCorrect={false}
            />
          </View>
        </ScrollView>

        {/* 하단 등록 버튼 */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.submitButton, content.trim() === '' && { backgroundColor: '#E0E0E0' }]} 
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={content.trim() === ''}
          >
            <Text style={styles.submitButtonText}>등록하기</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 스타일
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  boardSelectBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 14, marginBottom: 16, marginTop: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 10 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  selectedBoardName: { flex: 1, fontSize: 15, color: '#111', fontWeight: '600' },
  inputWrapper: { flex: 1, minHeight: 350, borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 8, marginBottom: 20, position: 'relative' },
  charCountContainer: { position: 'absolute', top: 14, right: 14, zIndex: 1 },
  charCountText: { fontSize: 12, color: '#BDBDBD' },
  contentInput: { flex: 1, fontSize: 15, color: '#111', paddingTop: 14, paddingHorizontal: 14, paddingRight: 60, minHeight: 350 },
  bottomButtonContainer: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10 },
  submitButton: { backgroundColor: '#2140DC', height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});