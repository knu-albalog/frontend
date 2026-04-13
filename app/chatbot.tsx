import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ✅ 로고 이미지 로드 (경로를 본인의 프로젝트에 맞게 수정해주세요)
// image_8.png 파일을 assets/images 폴더에 넣었다고 가정합니다.
const WORKY_LOGO = require('../assets/images/worky_logo.png');

// 💬 메시지 타입 정의
type Message = {
  id: number;
  sender: 'user' | 'worky';
  text: string;
  type?: 'text' | 'numbered_list' | 'bullet_list';
  listItems?: string[]; // 리스트 형태의 답변을 위한 옵션
};

export default function ChatbotScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');

  // 📝 대화 데이터 상태 관리 (초기값은 시안 기반)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'worky',
      text: '안녕하세요! 워크메이트의 AI 조수, 워키입니다. 무엇이든 물어보세요!',
    },
    { id: 2, sender: 'user', text: '포스 마감 방법에 대해 알려줘' },
    {
      id: 3,
      sender: 'worky',
      text: '매뉴얼에 따르면 마감 절차는 다음과 같습니다.',
      type: 'numbered_list',
      listItems: [
        '포스에서 당일 매출 마감 처리',
        '현금 금액 확인',
        '카드 매출 내역 출력',
        '금고에 보관 후 관리자에게 보고',
      ],
    },
    { id: 4, sender: 'worky', text: '필요하면 단계별로 자세히 알려드릴게요.' },
  ]);

  // 🦾 백엔드 연동 전, 모크(Mock) 응답 로직
  const getSimulatedResponse = (userText: string): Message => {
    const time = new Date().getTime();
    
    // 1. 등록된 매뉴얼이 없는 경우 처리
    if (userText.includes('담배판매') || userText.includes('시비')) {
      return {
        id: time + 1,
        sender: 'worky',
        text: '현재 등록된 매뉴얼에서는 해당 내용을 찾을 수 없습니다. 관리자에게 직접 확인해보시는 걸 권장드려요.',
      };
    }

    // 2. 다른 매뉴얼 정보 제공 (리스트형)
    if (userText.includes('청소')) {
      return {
        id: time + 1,
        sender: 'worky',
        text: '매뉴얼 3페이지 기준으로 다음 구역 청소가 포함됩니다.',
        type: 'bullet_list',
        listItems: ['매장 바닥', '테이블 및 의자', '계산대 주변'],
      };
    }

    // 3. 기본 응답
    return {
      id: time + 1,
      sender: 'worky',
      text: `"${userText}"에 대한 답변을 준비 중입니다. 백엔드가 연동되면 실제 매뉴얼 내용을 알려드릴게요!`,
    };
  };

  // 📤 메시지 전송 함수
  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: new Date().getTime(),
      sender: 'user',
      text: inputText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText(''); // 입력창 초기화

    // AI 응답 시뮬레이션 (1초 후)
    setTimeout(() => {
      const aiResponse = getSimulatedResponse(userMessage.text);
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  // ⬇️ 새 메시지가 오면 자동으로 아래로 스크롤
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 🛑 헤더 영역 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#2F4AFF" /> {/* 포인트 컬러 블루 */}
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Image source={WORKY_LOGO} style={styles.headerLogo} />
          <Text style={styles.headerTitle}>워키 (Worky)</Text>
        </View>
        <View style={{ width: 28 }} /> {/* 우측 밸런스를 위한 Dummy View */}
      </View>

      {/* 💬 채팅 대화 영역 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          return (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                isUser ? styles.userMessageRow : styles.workyMessageRow,
              ]}
            >
              {/* 워키일 때만 로고 프로필 표시 */}
              {!isUser && <Image source={WORKY_LOGO} style={styles.avatar} />}
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.workyBubble,
                ]}
              >
                {/* 기본 텍스트 */}
                <Text style={[styles.messageText, isUser ? styles.userText : styles.workyText]}>
                  {message.text}
                </Text>

                {/* 리스트 형태의 답변 처리 */}
                {message.listItems && (
                  <View style={styles.listContainer}>
                    {message.listItems.map((item, index) => (
                      <Text
                        key={index}
                        style={[styles.listItemText, isUser ? styles.userText : styles.workyText]}
                      >
                        {message.type === 'numbered_list'
                          ? `${index + 1}. ${item}` // 1. 포스 마감...
                          : `• ${item}`} {/* • 매장 바닥... */}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ⌨️ 입력창 영역 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // 탭바 높이 고려
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="무엇을 물어보시겠습니까?"
            placeholderTextColor="#A0A0A0"
            value={inputText}
            onChangeText={setInputText}
            multiline // 여러 줄 입력 가능
          />
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="mic-outline" size={24} color="#A0A0A0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <MaterialCommunityIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // 헤더 스타일
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 14, // 원형 로고
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F4AFF', // WorkMate 포인트 블루
  },

  // 채팅 영역 스타일
  chatContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA', // 배경색 약간 어둡게
  },
  chatContent: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%',
  },
  userMessageRow: {
    alignSelf: 'flex-end', // 오른쪽 정렬
    flexDirection: 'row-reverse',
  },
  workyMessageRow: {
    alignSelf: 'flex-start', // 왼쪽 정렬
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    marginTop: 2, // 텍스트 첫 줄과 맞추기 위해
  },
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#2F4AFF', // 진한 블루
    borderBottomRightRadius: 5, // 뾰족한 부분
  },
  workyBubble: {
    backgroundColor: '#E9ECFF', // 연한 퍼플 블루 (시안 반영)
    borderTopLeftRadius: 5, // 뾰족한 부분
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  workyText: {
    color: '#333',
  },

  // 리스트 답변 스타일
  listContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  listItemText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 2,
  },

  // 입력바 스타일
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    // iOS 하단 여백 safe area 처리 (behavior='padding'과 함께 작용)
    paddingBottom: Platform.OS === 'ios' ? 10 : 8, 
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    maxHeight: 100, // 여러 줄 입력 시 최대 높이
    color: '#333',
  },
  iconButton: {
    padding: 10,
  },
  sendButton: {
    backgroundColor: '#2F4AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
});