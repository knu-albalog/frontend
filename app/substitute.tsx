import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Modal, TextInput, Alert, KeyboardAvoidingView,
  Platform, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { apiRequest } from '../utils/api';

// 대타 응답 타입
type SubstituteType = {
  substituteId: number;
  scheduleId: number;
  requesterName: string;
  substituteUserName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  status: 'REQUESTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
};

// 스케줄 타입
type ScheduleType = {
  id: number;
  workDate: string;
  startTime: string;
  endTime: string;
  note: string;
};

// 날짜/시간 포맷 함수
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${month}월 ${day}일 ${hours}:${mins}`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = days[date.getDay()];
  return `${month}월 ${day}일 ${dayOfWeek}요일`;
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'REQUESTED': return '구인 중';
    case 'PENDING_APPROVAL': return '승인 대기';
    case 'APPROVED': return '승인 완료';
    case 'REJECTED': return '거절됨';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'REQUESTED': return '#F0F2FF';
    case 'PENDING_APPROVAL': return '#FFF4E5';
    case 'APPROVED': return '#2F4AFF';
    case 'REJECTED': return '#F5F5F5';
    default: return '#F0F2FF';
  }
};

export default function SubstituteScreen() {
  const router = useRouter();

  const [myRole, setMyRole] = useState<string | null>(null); // 'ADMIN' or 'WORKER'
  const [myName, setMyName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 알바생 상태
  const [availableList, setAvailableList] = useState<SubstituteType[]>([]); // 지원 가능한 대타 목록
  const [mySchedules, setMySchedules] = useState<ScheduleType[]>([]); // 내 스케줄 목록

  // 사장님 상태
  const [pendingList, setPendingList] = useState<SubstituteType[]>([]); // 승인 대기 목록

  // 모달 상태
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);
  const [note, setNote] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // 거절 모달 상태 (사장님)
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<number | null>(null);

  // 내 프로필 불러오기
  const fetchMyProfile = async () => {
    try {
      const result = await apiRequest('/user/profile');
      setMyRole(result.role); // 'ADMIN' or 'WORKER'
      setMyName(result.name);
      return result.role;
    } catch (e: any) {
      console.log('프로필 조회 실패:', e.message);
      return null;
    }
  };

  // 알바생 - 지원 가능한 대타 목록 조회
  const fetchAvailableList = async () => {
    try {
      const result = await apiRequest('/api/substitutes/available');
      setAvailableList(Array.isArray(result) ? result : []);
    } catch (e: any) {
      console.log('대타 목록 조회 실패:', e.message);
      setAvailableList([]);
    }
  };

  // 알바생 - 내 스케줄 목록 조회 (대타 신청용)
  const fetchMySchedules = async () => {
    try {
      const result = await apiRequest('/schedule/week?offset=0');
      const schedules = result?.scheduleDates ?? [];
      setMySchedules(schedules);
    } catch (e: any) {
      console.log('스케줄 조회 실패:', e.message);
      setMySchedules([]);
    }
  };

  // 사장님 - 승인 대기 목록 조회
  const fetchPendingList = async () => {
    try {
      const result = await apiRequest('/api/substitutes/pending-approvals');
      setPendingList(Array.isArray(result) ? result : []);
    } catch (e: any) {
      console.log('승인 대기 목록 조회 실패:', e.message);
      setPendingList([]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const role = await fetchMyProfile();
    if (role === 'ADMIN') {
      await fetchPendingList();
    } else {
      await fetchAvailableList();
      await fetchMySchedules();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // 알바생 - 대타 신청
  const handleCreateSubstitute = async () => {
    if (!selectedSchedule) {
      Alert.alert('알림', '대타 신청할 스케줄을 선택해주세요.');
      return;
    }
    setSubmitLoading(true);
    try {
      await apiRequest('/api/substitutes', {
        method: 'POST',
        body: JSON.stringify({
          scheduleId: selectedSchedule.id,
          note: note.trim(),
        }),
      });
      Alert.alert('완료', '대타 신청이 완료되었습니다.');
      setIsModalVisible(false);
      setSelectedSchedule(null);
      setNote('');
      await fetchAvailableList();
    } catch (e: any) {
      Alert.alert('오류', '대타 신청에 실패했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 알바생 - 대타 지원
  const handleApply = async (substituteId: number) => {
    Alert.alert('대타 지원', '이 대타에 지원하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '지원',
        onPress: async () => {
          try {
            await apiRequest(`/api/substitutes/${substituteId}/apply`, { method: 'PATCH' });
            Alert.alert('완료', '대타 지원이 완료되었습니다. 점주 승인을 기다려주세요.');
            await fetchAvailableList();
          } catch (e: any) {
            Alert.alert('오류', '대타 지원에 실패했습니다.');
          }
        },
      },
    ]);
  };

  // 사장님 - 대타 승인
  const handleApprove = async (substituteId: number) => {
    Alert.alert('대타 승인', '이 대타를 승인하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '승인',
        onPress: async () => {
          try {
            await apiRequest(`/api/substitutes/${substituteId}/approve`, { method: 'PATCH' });
            Alert.alert('완료', '대타가 승인되었습니다.');
            await fetchPendingList();
          } catch (e: any) {
            Alert.alert('오류', '승인에 실패했습니다.');
          }
        },
      },
    ]);
  };

  // 사장님 - 대타 거절
  const handleReject = async () => {
    if (!selectedSubstituteId) return;
    if (!rejectReason.trim()) {
      Alert.alert('알림', '거절 사유를 입력해주세요.');
      return;
    }
    try {
      await apiRequest(`/api/substitutes/${selectedSubstituteId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      Alert.alert('완료', '대타가 거절되었습니다.');
      setIsRejectModalVisible(false);
      setRejectReason('');
      setSelectedSubstituteId(null);
      await fetchPendingList();
    } catch (e: any) {
      Alert.alert('오류', '거절에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2F4AFF" />
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 사장님 화면
  // ==========================================
  if (myRole === 'ADMIN') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#2F4AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>대타 승인 관리</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {pendingList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>승인 대기 중인 대타가 없습니다.</Text>
            </View>
          ) : (
            pendingList.map((item) => (
              <View key={item.substituteId} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>승인 대기</Text>
                  </View>
                </View>
                <Text style={styles.dateText}>
                  {formatDateTime(item.shiftStartTime)} ~ {new Date(item.shiftEndTime).getHours().toString().padStart(2,'0')}:{new Date(item.shiftEndTime).getMinutes().toString().padStart(2,'0')}
                </Text>
                <Text style={styles.nameText}>요청자: {item.requesterName}</Text>
                <Text style={styles.nameText}>지원자: {item.substituteUserName}</Text>

                <View style={styles.adminBtnGroup}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(item.substituteId)}
                  >
                    <Text style={styles.approveBtnText}>승인</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => {
                      setSelectedSubstituteId(item.substituteId);
                      setIsRejectModalVisible(true);
                    }}
                  >
                    <Text style={styles.rejectBtnText}>거절</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* 거절 사유 모달 */}
        <Modal animationType="slide" transparent visible={isRejectModalVisible}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsRejectModalVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>거절 사유 입력</Text>
                <TouchableOpacity onPress={() => setIsRejectModalVisible(false)}>
                  <Ionicons name="close" size={24} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="거절 사유를 입력해주세요"
                placeholderTextColor="#C0C0C0"
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleReject}>
                <Text style={styles.submitText}>거절하기</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    );
  }

  // ==========================================
  // 알바생 화면
  // ==========================================
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
        <Text style={styles.sectionTitle}>지원 가능한 대타 목록</Text>

        {availableList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>지원 가능한 대타가 없습니다.</Text>
          </View>
        ) : (
          availableList.map((item) => (
            <View
              key={item.substituteId}
              style={[styles.card, { backgroundColor: getStatusColor(item.status) }]}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.statusBadge, { backgroundColor: '#2F4AFF' }]}>
                  <Text style={styles.statusBadgeText}>{getStatusText(item.status)}</Text>
                </View>
              </View>
              <Text style={styles.dateText}>
                {formatDateTime(item.shiftStartTime)} ~ {new Date(item.shiftEndTime).getHours().toString().padStart(2,'0')}:{new Date(item.shiftEndTime).getMinutes().toString().padStart(2,'0')}
              </Text>
              <Text style={styles.nameText}>요청자: {item.requesterName}</Text>

              {item.status === 'REQUESTED' && item.requesterName !== myName && (
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => handleApply(item.substituteId)}
                >
                  <Text style={styles.applyBtnText}>지원하기</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* 대타 신청 FAB */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="pencil" size={24} color="#fff" />
      </TouchableOpacity>

      {/* 대타 신청 모달 */}
      <Modal animationType="slide" transparent visible={isModalVisible}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalView}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>대타 신청</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>*대타 신청할 스케줄 선택</Text>

              {mySchedules.length === 0 ? (
                <View style={styles.emptySchedule}>
                  <Text style={styles.emptyScheduleText}>이번 주 스케줄이 없습니다.</Text>
                </View>
              ) : (
                mySchedules.map((schedule) => (
                  <TouchableOpacity
                    key={schedule.id}
                    style={[
                      styles.scheduleItem,
                      selectedSchedule?.id === schedule.id && styles.scheduleItemSelected,
                    ]}
                    onPress={() => setSelectedSchedule(schedule)}
                  >
                    <Text style={[
                      styles.scheduleItemText,
                      selectedSchedule?.id === schedule.id && styles.scheduleItemTextSelected,
                    ]}>
                      {formatDate(schedule.workDate)} {schedule.startTime} ~ {schedule.endTime}
                    </Text>
                    {schedule.note ? (
                      <Text style={styles.scheduleNoteText}>{schedule.note}</Text>
                    ) : null}
                    {selectedSchedule?.id === schedule.id && (
                      <Ionicons name="checkmark-circle" size={20} color="#2F4AFF" />
                    )}
                  </TouchableOpacity>
                ))
              )}

              <Text style={[styles.label, { marginTop: 16 }]}>사유 (선택)</Text>
              <TextInput
                style={styles.input}
                placeholder="ex) 개인사정, 가족행사 등"
                placeholderTextColor="#C0C0C0"
                value={note}
                onChangeText={setNote}
              />

              <TouchableOpacity
                style={[styles.submitBtn, (!selectedSchedule || submitLoading) && { backgroundColor: '#BDBDBD' }]}
                onPress={handleCreateSubstitute}
                disabled={!selectedSchedule || submitLoading}
              >
                {submitLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitText}>신청하기</Text>
                }
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#BDBDBD' },
  card: { borderRadius: 16, padding: 20, marginBottom: 16, backgroundColor: '#F0F2FF' },
  cardTopRow: { flexDirection: 'row', marginBottom: 10 },
  statusBadge: { backgroundColor: '#2F4AFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  dateText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  nameText: { fontSize: 13, color: '#666', marginBottom: 4 },
  adminBtnGroup: { flexDirection: 'row', marginTop: 12, gap: 8 },
  approveBtn: { flex: 1, backgroundColor: '#2F4AFF', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: 'bold' },
  rejectBtn: { flex: 1, borderWidth: 1, borderColor: '#FF3B30', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  rejectBtnText: { color: '#FF3B30', fontWeight: 'bold' },
  applyBtn: { marginTop: 12, backgroundColor: '#2F4AFF', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: 'bold' },
  floatingButton: { position: 'absolute', bottom: 30, right: 24, backgroundColor: '#2F4AFF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 16, backgroundColor: '#FAFAFA', marginBottom: 16 },
  textArea: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 16, backgroundColor: '#FAFAFA', minHeight: 100, marginBottom: 16, textAlignVertical: 'top' },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 14, marginBottom: 8, backgroundColor: '#FAFAFA' },
  scheduleItemSelected: { borderColor: '#2F4AFF', backgroundColor: '#F0F2FF' },
  scheduleItemText: { fontSize: 14, color: '#333', flex: 1 },
  scheduleItemTextSelected: { color: '#2F4AFF', fontWeight: 'bold' },
  scheduleNoteText: { fontSize: 12, color: '#999', marginTop: 2 },
  emptySchedule: { alignItems: 'center', paddingVertical: 20 },
  emptyScheduleText: { fontSize: 14, color: '#BDBDBD' },
  submitBtn: { backgroundColor: '#2F4AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});