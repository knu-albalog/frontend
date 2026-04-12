import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ==========================================
// ⭐ 커스텀 휠 스크롤 피커
// ==========================================
const ITEM_HEIGHT = 40;
const WheelPicker = ({ data, selectedValue, onValueChange }: { data: string[], selectedValue: string, onValueChange: (val: string) => void }) => {
  return (
    <View style={styles.wheelContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          if (data[index]) onValueChange(data[index]);
        }}
        onScrollEndDrag={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          if (data[index]) onValueChange(data[index]);
        }}
      >
        <View style={{ height: ITEM_HEIGHT }} />
        {data.map((item) => (
          <TouchableOpacity 
            key={item} 
            style={styles.wheelItem}
            onPress={() => onValueChange(item)} 
          >
            <Text style={[styles.wheelText, selectedValue === item && styles.wheelTextSelected]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: ITEM_HEIGHT }} />
      </ScrollView>
      <View style={styles.wheelHighlight} pointerEvents="none" />
    </View>
  );
};

export default function SubstituteScreen() {
  const router = useRouter();

  const currentUser = '워클리'; 
  const [requests, setRequests] = useState([
    { id: 1, date: '4월 13일 월요일', time: '13:00 ~ 18:00', reason: '가족행사 참석', status: 'pending', author: '김철수' },
    { id: 2, date: '4월 25일 수요일', time: '09:00 ~ 12:00', reason: '개인사정', status: 'pending', author: '워클리' },
    { id: 3, date: '4월 30일 목요일', time: '19:00 ~ 21:00', reason: '대학교 전공 중간고사', status: 'pending', author: '이영희' },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // 폼 입력 상태
  const [formDate, setFormDate] = useState('');
  const [formReason, setFormReason] = useState('');
  
  // 시간 및 토글 상태
  const [startHour, setStartHour] = useState('09');
  const [startMin, setStartMin] = useState('00');
  const [endHour, setEndHour] = useState('18');
  const [endMin, setEndMin] = useState('00');
  
  // ⭐ 시간 선택 여부를 추적하는 상태 (흐린 글씨 처리를 위함)
  const [hasSelectedTime, setHasSelectedTime] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const aprilDays = Array.from({ length: 30 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const mins = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); 

  const parseDateToTime = (dateStr: string) => {
    const match = dateStr.match(/(\d+)월 (\d+)일/);
    return match ? new Date(2026, parseInt(match[1]) - 1, parseInt(match[2])).getTime() : 0;
  };

  const executeDelete = (id: number) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const confirmDelete = (id: number) => {
    if (Platform.OS === 'web') {
      const isConfirmed = window.confirm("정말 삭제하시겠습니까?\n한 번 삭제된 글은 복구할 수 없습니다.");
      if (isConfirmed) executeDelete(id);
    } else {
      Alert.alert(
        "삭제 확인",
        "정말 삭제하시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          { text: "삭제", style: "destructive", onPress: () => executeDelete(id) }
        ]
      );
    }
  };

  const handleStatusChange = (id: number, status: 'matched' | 'rejected') => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status, matchedWith: status === 'matched' ? currentUser : undefined } : req
    ));
  };

  const openModal = (item?: typeof requests[0]) => {
    if (item) {
      setEditingId(item.id);
      setFormDate(item.date);
      setFormReason(item.reason);
      const times = item.time.split(' ~ ');
      if (times.length === 2) {
        setStartHour(times[0].split(':')[0]);
        setStartMin(times[0].split(':')[1]);
        setEndHour(times[1].split(':')[0]);
        setEndMin(times[1].split(':')[1]);
      }
      setHasSelectedTime(true); // 수정 모드일 때는 이미 시간이 선택된 상태로 간주
    } else {
      setEditingId(null);
      setFormDate('');
      setFormReason('');
      setStartHour('09'); setStartMin('00'); setEndHour('18'); setEndMin('00');
      setHasSelectedTime(false); // 새 글 작성 시에는 선택되지 않은 상태로 초기화
    }
    setShowCalendar(false);
    setShowTimePicker(false);
    setIsModalVisible(true);
  };

  const handleFormSubmit = () => {
    // 날짜와 시간 둘 다 선택되었는지 검사
    if (!formDate || !hasSelectedTime) {
      Platform.OS === 'web' 
        ? window.alert('날짜와 시간을 모두 선택해주세요.') 
        : Alert.alert('알림', '날짜와 시간을 모두 선택해주세요.');
      return;
    }
    const fullTime = `${startHour}:${startMin} ~ ${endHour}:${endMin}`;

    if (editingId) {
      setRequests(prev => prev.map(r => r.id === editingId ? { ...r, date: formDate, time: fullTime, reason: formReason } : r));
    } else {
      const newReq = { id: Date.now(), date: formDate, time: fullTime, reason: formReason, status: 'pending', author: currentUser };
      setRequests(prev => [...prev, newReq]);
    }
    setIsModalVisible(false);
  };

  const pending = requests.filter(r => r.status === 'pending').sort((a,b) => parseDateToTime(a.date) - parseDateToTime(b.date));
  const matched = requests.filter(r => r.status === 'matched').sort((a,b) => parseDateToTime(a.date) - parseDateToTime(b.date));
  const rejected = requests.filter(r => r.status === 'rejected').sort((a,b) => parseDateToTime(a.date) - parseDateToTime(b.date));
  const displayList = [...pending, ...matched, ...rejected];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#2F4AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>대타 신청</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {displayList.map((item) => {
          const isMatched = item.status === 'matched';
          const isRejected = item.status === 'rejected';
          const isMyPost = item.author === currentUser;

          return (
            <View key={item.id} style={[styles.card, isMatched ? styles.cardMatched : isRejected ? styles.cardRejected : styles.cardPending]}>
              <View style={styles.cardContent}>
                <View style={styles.textGroup}>
                  <Text style={[styles.dateText, isMatched && styles.textWhite, isRejected && styles.textStrikethrough]}>
                    {isMatched ? `[${item.matchedWith}] ${item.date}` : `${item.date} (${item.author})`}
                  </Text>
                  <Text style={[styles.timeText, isMatched && styles.textWhiteLight, isRejected && styles.textStrikethrough]}>
                    {item.time}
                  </Text>
                  <Text style={[styles.reasonText, isMatched && styles.textWhiteLight, isRejected && styles.textStrikethrough]}>
                    사유 : {item.reason || '없음'}
                  </Text>
                </View>

                {item.status === 'pending' && (
                  <View style={styles.buttonGroup}>
                    {isMyPost ? (
                      <>
                        <TouchableOpacity style={[styles.btn, styles.editBtn]} onPress={() => openModal(item)}>
                          <Text style={styles.editBtnText}>수정</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.delBtn]} onPress={() => confirmDelete(item.id)}>
                          <Text style={styles.delBtnText}>삭제</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity style={styles.btn} onPress={() => handleStatusChange(item.id, 'matched')}>
                          <Text style={styles.btnText}>수락</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn} onPress={() => handleStatusChange(item.id, 'rejected')}>
                          <Text style={styles.btnText}>거절</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={() => openModal()}>
        <Ionicons name="pencil" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={isModalVisible}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsModalVisible(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalView}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>대타 신청 {editingId ? '수정' : '작성'}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}><Ionicons name="close" size={24} /></TouchableOpacity>
            </View>
            
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>*날짜 선택</Text>
                <TouchableOpacity style={[styles.input, showCalendar && styles.inputActive]} onPress={() => { setShowCalendar(!showCalendar); setShowTimePicker(false); }}>
                  <Text style={{color: formDate ? '#333' : '#CCC', fontSize: 16}}>{formDate || '날짜를 선택하세요'}</Text>
                </TouchableOpacity>
              </View>

              {showCalendar && (
                <View style={styles.calContainer}>
                  {aprilDays.map(d => (
                    <TouchableOpacity key={d} style={[styles.day, formDate.includes(`${d}일`) && styles.dayActive]} 
                      onPress={() => {
                        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date(2026, 3, d).getDay()];
                        setFormDate(`4월 ${d}일 ${dayOfWeek}요일`);
                        setShowCalendar(false);
                      }}>
                      <Text style={{color: formDate.includes(`${d}일`) ? '#fff' : '#333'}}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>*시간 선택 (시작 ~ 종료)</Text>
                <TouchableOpacity 
                  style={[styles.input, showTimePicker && styles.inputActive]} 
                  onPress={() => { 
                    setShowTimePicker(!showTimePicker); 
                    setShowCalendar(false); 
                    setHasSelectedTime(true); // 누르는 순간 선택 상태로 변경
                  }}
                >
                  <Text style={{
                    color: hasSelectedTime ? '#333' : '#CCC', // 선택 전에는 흐리게
                    fontSize: 16, 
                    fontWeight: hasSelectedTime ? 'bold' : 'normal' // 선택 후에는 굵게
                  }}>
                    {hasSelectedTime ? `${startHour}:${startMin}  ~  ${endHour}:${endMin}` : '시간을 선택하세요'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showTimePicker && (
                <View style={styles.wheelPickerWrapper}>
                  <View style={styles.wheelGroup}>
                    <WheelPicker data={hours} selectedValue={startHour} onValueChange={setStartHour} />
                    <Text style={styles.wheelColon}>:</Text>
                    <WheelPicker data={mins} selectedValue={startMin} onValueChange={setStartMin} />
                  </View>
                  
                  <Text style={styles.wheelTilde}>~</Text>
                  
                  <View style={styles.wheelGroup}>
                    <WheelPicker data={hours} selectedValue={endHour} onValueChange={setEndHour} />
                    <Text style={styles.wheelColon}>:</Text>
                    <WheelPicker data={mins} selectedValue={endMin} onValueChange={setEndMin} />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>사유</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="ex) 개인사정" 
                  placeholderTextColor="#C0C0C0" 
                  value={formReason} 
                  onChangeText={setFormReason} 
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleFormSubmit}>
                <Text style={styles.submitText}>{editingId ? '수정 완료' : '작성 완료'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  
  card: { borderRadius: 16, padding: 20, marginBottom: 16 },
  cardPending: { backgroundColor: '#F0F2FF' },
  cardMatched: { backgroundColor: '#2F4AFF' },
  cardRejected: { backgroundColor: '#F5F5F5', opacity: 0.6 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  textGroup: { flex: 1 },
  dateText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  timeText: { fontSize: 14, color: '#666', marginBottom: 12 },
  reasonText: { fontSize: 12, color: '#888' },
  textWhite: { color: '#fff' },
  textWhiteLight: { color: 'rgba(255, 255, 255, 0.8)' },
  textStrikethrough: { textDecorationLine: 'line-through', color: '#AAA' },
  
  buttonGroup: { flexDirection: 'row' },
  btn: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginLeft: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  btnText: { fontSize: 14, fontWeight: '600', color: '#333' },
  editBtn: { borderColor: '#2F4AFF', borderWidth: 1 },
  editBtnText: { color: '#2F4AFF', fontWeight: 'bold' },
  delBtn: { borderColor: '#FF3B30', borderWidth: 1 },
  delBtnText: { color: '#FF3B30', fontWeight: 'bold' },
  floatingButton: { position: 'absolute', bottom: 30, right: 24, backgroundColor: '#2F4AFF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 16, backgroundColor: '#FAFAFA' },
  inputActive: { borderColor: '#2F4AFF', backgroundColor: '#fff' },
  
  calContainer: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#F9FAFF', borderRadius: 12, padding: 10, marginBottom: 15 },
  day: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  dayActive: { backgroundColor: '#2F4AFF', borderRadius: 20 },
  
  wheelPickerWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFF', borderRadius: 12, paddingVertical: 15, marginBottom: 15 },
  wheelGroup: { flexDirection: 'row', alignItems: 'center' },
  wheelContainer: { height: 120, width: 45, overflow: 'hidden', position: 'relative', alignItems: 'center' },
  wheelItem: { height: 40, justifyContent: 'center', alignItems: 'center' },
  wheelText: { fontSize: 16, color: '#C0C0C0' },
  wheelTextSelected: { fontSize: 20, color: '#333', fontWeight: 'bold' },
  wheelHighlight: { position: 'absolute', top: 40, height: 40, width: '100%', borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: '#2F4AFF', opacity: 0.3 },
  wheelColon: { fontSize: 20, fontWeight: 'bold', color: '#333', marginHorizontal: 2 },
  wheelTilde: { fontSize: 20, fontWeight: 'bold', color: '#888', marginHorizontal: 15 },

  submitBtn: { backgroundColor: '#2F4AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});