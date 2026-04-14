import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform, // 🚀 웹/모바일 환경 구분을 위해 추가
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// --- 날짜 유틸리티 ---
const WEEKDAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

function formatMonthLabel(date: Date) {
  return `${date.getFullYear()} ${date.getMonth() + 1}월`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getWeekDates(baseDate: Date) {
  const start = getWeekStart(baseDate);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatCardDate(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function toDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// --- 타입 ---
type TeamShift = {
  id: number | string;
  start: string;
  end: string;
  date: Date;
  originalWorker: string;
  substituteWorker?: string;
  isSubstituted: boolean;
};

type SubRequest = {
  id: number;
  shiftId: number;
  date: Date;
  start: string;
  end: string;
};

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const initialSelectedDate = new Date(2026, 3, 11);

  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [currentWeekBase, setCurrentWeekBase] = useState(initialSelectedDate);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tempYear, setTempYear] = useState(initialSelectedDate.getFullYear());
  const [tempMonth, setTempMonth] = useState(initialSelectedDate.getMonth());

  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedShift, setSelectedShift] = useState<TeamShift | null>(null);

  const [shifts, setShifts] = useState<TeamShift[]>([
    { id: 1, start: '09:00', end: '12:00', date: new Date(2026, 3, 11), originalWorker: '홍길동', isSubstituted: false },
    { id: 2, start: '13:00', end: '18:00', date: new Date(2026, 3, 11), originalWorker: '이몽룡', isSubstituted: false },
    { id: 3, start: '09:00', end: '15:00', date: new Date(2026, 3, 13), originalWorker: '성춘향', isSubstituted: false },
  ]);

  const [subRequests, setSubRequests] = useState<SubRequest[]>([
    { id: 101, shiftId: 1, date: new Date(2026, 3, 11), start: '09:00', end: '12:00' },
  ]);

  const weekDates = useMemo(() => getWeekDates(currentWeekBase), [currentWeekBase]);

  // ✅ 근무 등록 연동
  useEffect(() => {
    const { newWorker, newDate, newTime, newId } = params;
    if (!newWorker || !newDate || !newTime || !newId) return;

    const [year, month, day] = (newDate as string).split('-').map(Number);
    const newDateObj = new Date(year, month - 1, day);
    const [newStart, newEnd] = (newTime as string).split(' ~ ');

    setShifts(prev => {
      if (prev.some(s => String(s.id) === String(newId))) return prev;
      return [...prev, {
        id: newId as string,
        date: newDateObj,
        start: newStart,
        end: newEnd,
        originalWorker: newWorker as string,
        isSubstituted: false,
      }];
    });

    setSelectedDate(newDateObj);
    setCurrentWeekBase(newDateObj);

    router.setParams({ newId: '', newWorker: '', newDate: '', newTime: '' });
  }, [params.newId]);

  // ✅ 수정 후 반영
  useEffect(() => {
    const { editId, editWorker, editDate, editTime } = params;
    if (!editId || !editWorker || !editDate || !editTime) return;

    const [year, month, day] = (editDate as string).split('-').map(Number);
    const editDateObj = new Date(year, month - 1, day);
    const [editStart, editEnd] = (editTime as string).split(' ~ ');

    setShifts(prev => prev.map(s =>
      String(s.id) === String(editId)
        ? { ...s, date: editDateObj, start: editStart, end: editEnd, originalWorker: editWorker as string }
        : s
    ));

    setSelectedDate(editDateObj);
    setCurrentWeekBase(editDateObj);

    router.setParams({ editId: '', editWorker: '', editDate: '', editTime: '' });
  }, [params.editId]);

  const dailyShifts = useMemo(() => {
    return shifts
      .filter((item) => isSameDay(item.date, selectedDate))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [shifts, selectedDate]);

  const dailySubRequests = useMemo(() => {
    return subRequests.filter((item) => isSameDay(item.date, selectedDate));
  }, [subRequests, selectedDate]);

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekBase);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekBase(newDate);
    if (!getWeekDates(newDate).some((d) => isSameDay(d, selectedDate)))
      setSelectedDate(getWeekDates(newDate)[0]);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekBase);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekBase(newDate);
    if (!getWeekDates(newDate).some((d) => isSameDay(d, selectedDate)))
      setSelectedDate(getWeekDates(newDate)[0]);
  };

  const openMonthPicker = () => {
    setTempYear(currentWeekBase.getFullYear());
    setTempMonth(currentWeekBase.getMonth());
    setPickerVisible(true);
  };

  const applyMonthPicker = () => {
    const newDate = new Date(tempYear, tempMonth, 1);
    setCurrentWeekBase(newDate);
    setSelectedDate(newDate);
    setPickerVisible(false);
  };

  const openActionSheet = (shift: TeamShift) => {
    setSelectedShift(shift);
    setActionSheetVisible(true);
  };

  const handleEdit = () => {
    if (!selectedShift) return;
    setActionSheetVisible(false);
    router.push({
      pathname: '/schedule-register',
      params: {
        editId: String(selectedShift.id),
        editWorker: selectedShift.originalWorker,
        editDate: toDateString(selectedShift.date),
        editTime: `${selectedShift.start} ~ ${selectedShift.end}`,
      },
    });
  };

  // 🚀 대타 신청하기
  const handleAcceptSubstitute = (req: SubRequest) => {
    Alert.alert('대타 수락', '이 대타 근무를 수락하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '수락하기', onPress: () => {
          setShifts((prev) => prev.map((shift) =>
            shift.id === req.shiftId
              ? { ...shift, isSubstituted: true, substituteWorker: '천지우' }
              : shift
          ));
          setSubRequests((prev) => prev.filter((r) => r.id !== req.id));

          const showCompleteAlert = () => {
            Alert.alert('수락 완료', '대타 신청이 완료되었습니다.', [
              { text: '확인', onPress: () => router.push('/substitute') }
            ]);
          };

          // 🚀 웹 브라우저 팝업 차단 방지 로직
          if (Platform.OS === 'web') {
            showCompleteAlert();
          } else {
            setTimeout(showCompleteAlert, 300);
          }
        },
      },
    ]);
  };

  // 🚀 삭제 기능 (웹 브라우저 버그 완벽 해결)
  const handleDelete = () => {
    if (!selectedShift) return;

    const idToDelete = selectedShift.id;
    const workerName = selectedShift.originalWorker;
    const timeText = `${selectedShift.start} ~ ${selectedShift.end}`;

    setActionSheetVisible(false);

    const showDeleteAlert = () => {
      Alert.alert(
        '근무 삭제',
        `${workerName}의 ${timeText} 근무를 삭제하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제', style: 'destructive',
            onPress: () => {
              setShifts(prev => prev.filter(s => String(s.id) !== String(idToDelete)));
              setSubRequests(prev => prev.filter(r => String(r.shiftId) !== String(idToDelete)));
            },
          },
        ]
      );
    };

    // 🚀 웹 브라우저는 바로 실행(팝업 차단 방지), 모바일은 0.4초 딜레이(모달 겹침 방지)
    if (Platform.OS === 'web') {
      showDeleteAlert();
    } else {
      setTimeout(showDeleteAlert, 400);
    }
  };

  const years = Array.from({ length: 11 }, (_, i) => 2022 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#2B50E6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스케줄표</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={styles.monthButton} activeOpacity={0.8} onPress={openMonthPicker}>
          <Text style={styles.monthButtonText}>{formatMonthLabel(currentWeekBase)}</Text>
          <Ionicons name="chevron-down" size={16} color="#222222" />
        </TouchableOpacity>

        <View style={styles.weekRowWrapper}>
          <TouchableOpacity style={styles.arrowButton} onPress={handlePrevWeek}>
            <Ionicons name="chevron-back" size={20} color="#2B50E6" />
          </TouchableOpacity>
          <View style={styles.weekRow}>
            {weekDates.map((date) => {
              const active = isSameDay(date, selectedDate);
              const hasEvent = shifts.some((s) => isSameDay(s.date, date));
              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={[styles.dayChip, active && styles.dayChipActive]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{date.getDate()}</Text>
                  <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{WEEKDAY_KR[date.getDay()]}</Text>
                  {hasEvent && <View style={[styles.eventDot, active && styles.eventDotActive]} />}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={styles.arrowButton} onPress={handleNextWeek}>
            <Ionicons name="chevron-forward" size={20} color="#2B50E6" />
          </TouchableOpacity>
        </View>

        {/* 근무 목록 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="calendar-outline" size={18} color="#151515" />
            <Text style={styles.sectionTitle}>{selectedDate.getDate()}일 근무</Text>
          </View>

          {dailyShifts.length > 0 ? (
            dailyShifts.map((item) => (
              <View key={item.id} style={styles.shiftCard}>
                <View style={styles.shiftCardLeft}>
                  <Text style={styles.shiftTimeText}>{item.start} ~ {item.end}</Text>
                  {item.isSubstituted ? (
                    <View style={styles.substitutedRow}>
                      <Text style={styles.originalWorkerText}>{item.originalWorker}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#2B50E6" style={{ marginHorizontal: 6 }} />
                      <Text style={styles.substituteWorkerText}>{item.substituteWorker} 근무</Text>
                    </View>
                  ) : (
                    <Text style={styles.normalWorkerText}>{item.originalWorker} 근무</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.moreBtn}
                  onPress={() => openActionSheet(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color="#BBBBBB" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>예정된 근무 일정이 없어요.</Text>
            </View>
          )}
        </View>

        {/* 대타 요청 */}
        {dailySubRequests.length > 0 && (
          <View style={[styles.sectionContainer, { marginTop: 10 }]}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="notifications-outline" size={18} color="#151515" />
              <Text style={styles.sectionTitle}>대타 요청</Text>
            </View>
            {dailySubRequests.map((req) => (
              <View key={req.id} style={styles.subRequestCard}>
                <View>
                  <Text style={styles.shiftTimeText}>{req.start} ~ {req.end}</Text>
                  <Text style={styles.subRequestDate}>{formatCardDate(req.date)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => handleAcceptSubstitute(req)}
                >
                  <Text style={styles.applyButtonText}>신청하기</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/schedule-register')}>
          <Text style={styles.registerButtonText}>근무 등록</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 수정/삭제 액션 시트 */}
      <Modal visible={actionSheetVisible} transparent animationType="slide" onRequestClose={() => setActionSheetVisible(false)}>
        <View style={styles.asOverlay}>
          <TouchableOpacity style={styles.asBackdrop} activeOpacity={1} onPress={() => setActionSheetVisible(false)} />
          <View style={styles.asSheet}>
            <View style={styles.asHandle} />
            {selectedShift && (
              <View style={styles.asInfo}>
                <Text style={styles.asInfoWorker}>{selectedShift.originalWorker}</Text>
                <Text style={styles.asInfoTime}>{selectedShift.start} ~ {selectedShift.end}</Text>
              </View>
            )}
            <View style={styles.asDivider} />
            <TouchableOpacity style={styles.asItem} onPress={handleEdit}>
              <View style={styles.asIconWrap}>
                <Ionicons name="create-outline" size={20} color="#2B50E6" />
              </View>
              <Text style={styles.asItemText}>수정하기</Text>
              <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.asItem} onPress={handleDelete}>
              <View style={[styles.asIconWrap, { backgroundColor: '#FFF0F0' }]}>
                <Ionicons name="trash-outline" size={20} color="#FF4444" />
              </View>
              <Text style={[styles.asItemText, { color: '#FF4444' }]}>삭제하기</Text>
              <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.asCancelBtn} onPress={() => setActionSheetVisible(false)}>
              <Text style={styles.asCancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 년/월 선택 모달 */}
      <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>년 / 월 선택</Text>
            <Text style={styles.modalSectionLabel}>년도</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerRow}>
              {years.map((year) => {
                const selected = tempYear === year;
                return (
                  <TouchableOpacity key={year} style={[styles.pickerChip, selected && styles.pickerChipActive]} onPress={() => setTempYear(year)}>
                    <Text style={[styles.pickerChipText, selected && styles.pickerChipTextActive]}>{year}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={styles.modalSectionLabel}>월</Text>
            <View style={styles.monthGrid}>
              {months.map((month) => {
                const selected = tempMonth === month;
                return (
                  <TouchableOpacity key={month} style={[styles.monthCell, selected && styles.monthCellActive]} onPress={() => setTempMonth(month)}>
                    <Text style={[styles.monthCellText, selected && styles.monthCellTextActive]}>{month + 1}월</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setPickerVisible(false)}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={applyMonthPicker}>
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1 },
  contentContainer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 140 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  monthButton: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 24, marginTop: 10 },
  monthButtonText: { fontSize: 16, fontWeight: '700', color: '#222222' },
  weekRowWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  arrowButton: { width: 28, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between', marginHorizontal: 6 },
  dayChip: { width: 38, height: 58, borderRadius: 19, borderWidth: 1, borderColor: '#D7D7D7', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  dayChipActive: { backgroundColor: '#2B50E6', borderColor: '#2B50E6' },
  dayNumber: { fontSize: 18, fontWeight: '700', color: '#1F1F1F', marginBottom: 2 },
  dayNumberActive: { color: '#FFFFFF' },
  dayLabel: { fontSize: 10, color: '#5F5F5F', fontWeight: '500' },
  dayLabelActive: { color: '#FFFFFF' },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#2B50E6', position: 'absolute', bottom: 6 },
  eventDotActive: { backgroundColor: '#FFFFFF' },
  sectionContainer: { backgroundColor: '#EEF0FF', borderRadius: 18, padding: 18, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#151515', marginLeft: 6 },
  shiftCard: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shiftCardLeft: { flex: 1 },
  moreBtn: { padding: 4, marginLeft: 8 },
  subRequestCard: { backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shiftTimeText: { fontSize: 15, fontWeight: '700', color: '#262626', marginBottom: 6 },
  normalWorkerText: { fontSize: 13, color: '#767676', fontWeight: '500' },
  substitutedRow: { flexDirection: 'row', alignItems: 'center' },
  originalWorkerText: { fontSize: 13, color: '#B0B0B0', fontWeight: '500', textDecorationLine: 'line-through' },
  substituteWorkerText: { fontSize: 14, color: '#2B50E6', fontWeight: '700' },
  subRequestDate: { fontSize: 12, color: '#888' },
  applyButton: { borderWidth: 1, borderColor: '#2B50E6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  applyButtonText: { color: '#2B50E6', fontSize: 13, fontWeight: '600' },
  emptyBox: { marginTop: 8, backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#8A8A8A' },
  bottomButtonContainer: { position: 'absolute', bottom: 20, left: 24, right: 24 },
  registerButton: { backgroundColor: '#2B50E6', borderRadius: 16, height: 54, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  registerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  asOverlay: { flex: 1, justifyContent: 'flex-end' },
  asBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.32)' },
  asSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 },
  asHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 20 },
  asInfo: { marginBottom: 14, alignItems: 'center' },
  asInfoWorker: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
  asInfoTime: { fontSize: 14, color: '#888', fontWeight: '500' },
  asDivider: { height: 1, backgroundColor: '#F2F2F2', marginBottom: 10 },
  asItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  asIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F3FF', alignItems: 'center', justifyContent: 'center' },
  asItemText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111' },
  asCancelBtn: { marginTop: 8, backgroundColor: '#F5F5F5', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  asCancelText: { fontSize: 15, fontWeight: '700', color: '#888' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', justifyContent: 'center', paddingHorizontal: 24 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1B1B1B', marginBottom: 18 },
  modalSectionLabel: { fontSize: 14, fontWeight: '700', color: '#444444', marginBottom: 10, marginTop: 4 },
  pickerRow: { paddingBottom: 8, gap: 8 },
  pickerChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: '#F3F4F8', marginRight: 8 },
  pickerChipActive: { backgroundColor: '#2B50E6' },
  pickerChipText: { fontSize: 14, fontWeight: '600', color: '#4B4B4B' },
  pickerChipTextActive: { color: '#FFFFFF' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 2, marginBottom: 10 },
  monthCell: { width: '30%', backgroundColor: '#F3F4F8', borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  monthCellActive: { backgroundColor: '#2B50E6' },
  monthCellText: { fontSize: 14, fontWeight: '600', color: '#4B4B4B' },
  monthCellTextActive: { color: '#FFFFFF' },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 12, marginRight: 8 },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: '#777777' },
  confirmButton: { backgroundColor: '#2B50E6', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12 },
  confirmButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});