import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// ─────────────────────────────────────────────
// 유틸리티
// ─────────────────────────────────────────────
const WEEKDAY_SHORT = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function toDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

// ─────────────────────────────────────────────
// 드럼롤 시간 선택
// ─────────────────────────────────────────────
const HOURS = Array.from({ length: 25 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const ITEM_H = 52;
const VISIBLE = 5;
const DRUM_H = ITEM_H * VISIBLE;

function DrumColumn({
  items, selected, onSelect, label, fmt,
}: {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
  label: string;
  fmt: (v: number) => string;
}) {
  const listRef = useRef<FlatList>(null);

  const onLayout = useCallback(() => {
    const idx = items.indexOf(selected);
    if (idx >= 0) {
      listRef.current?.scrollToOffset({ offset: idx * ITEM_H, animated: false });
    }
  }, []);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIndex = e.nativeEvent.contentOffset.y / ITEM_H;
    const idx = Math.round(rawIndex);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    onSelect(items[clamped]);
    listRef.current?.scrollToOffset({ offset: clamped * ITEM_H, animated: true });
  };

  return (
    <View style={dc.wrap}>
      <Text style={dc.label}>{label}</Text>
      <View style={dc.listWrap} onLayout={onLayout}>
        <View style={dc.highlight} pointerEvents="none" />
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item) => String(item)}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_H}
          decelerationRate="fast"
          bounces={false}
          contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
          getItemLayout={(_, index) => ({ length: ITEM_H, offset: ITEM_H * index, index })}
          initialScrollIndex={items.indexOf(selected)}
          onMomentumScrollEnd={onScrollEnd}
          onScrollEndDrag={onScrollEnd}
          renderItem={({ item, index }) => {
            const isSel = item === selected;
            return (
              <TouchableOpacity
                style={dc.item}
                activeOpacity={0.6}
                onPress={() => {
                  onSelect(item);
                  listRef.current?.scrollToOffset({ offset: index * ITEM_H, animated: true });
                }}
              >
                <Text style={[dc.itemText, isSel && dc.itemTextSel]}>{fmt(item)}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}

const dc = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#AAAAAA', marginBottom: 6, letterSpacing: 0.5 },
  listWrap: { height: DRUM_H, width: '100%', overflow: 'hidden', position: 'relative' },
  highlight: { position: 'absolute', top: ITEM_H * 2, left: 6, right: 6, height: ITEM_H, backgroundColor: '#F5F5F5', borderRadius: 12, zIndex: 0 },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontSize: 18, fontWeight: '400', color: '#CCCCCC' },
  itemTextSel: { fontSize: 20, fontWeight: '600', color: '#333333' }, // 크기와 색상 톤 다운
});

function TimePickerModal({
  visible, title, hour, minute,
  onChangeHour, onChangeMinute, onClose,
}: {
  visible: boolean; title: string;
  hour: number; minute: number;
  onChangeHour: (h: number) => void;
  onChangeMinute: (m: number) => void;
  onClose: () => void;
}) {
  const pad = (v: number) => String(v).padStart(2, '0');
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={tm.overlay}>
        <TouchableOpacity style={tm.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={tm.sheet}>
          <View style={tm.handle} />
          <View style={tm.header}>
            <Text style={tm.title}>{title}</Text>
            <TouchableOpacity style={tm.doneBtn} onPress={onClose}>
              <Text style={tm.doneTxt}>완료</Text>
            </TouchableOpacity>
          </View>
          <Text style={tm.preview}>{pad(hour)}:{pad(minute)}</Text>
          <View style={tm.drums}>
            <DrumColumn items={HOURS} selected={hour} onSelect={onChangeHour} label="시" fmt={pad} />
            <Text style={tm.colon}>:</Text>
            <DrumColumn items={MINUTES} selected={minute} onSelect={onChangeMinute} label="분" fmt={pad} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const tm = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.32)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 44 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '700', color: '#111' },
  doneBtn: { backgroundColor: '#2B50E6', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  doneTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  preview: { fontSize: 36, fontWeight: '700', color: '#222', letterSpacing: 1, textAlign: 'center', marginVertical: 12 }, // 굵기와 크기 조절
  drums: { flexDirection: 'row', alignItems: 'center' },
  colon: { fontSize: 24, fontWeight: '600', color: '#666', paddingHorizontal: 4, marginTop: 20 }, // 파란색 제거, 톤 다운
});

// ─────────────────────────────────────────────
// 메인 화면
// ─────────────────────────────────────────────
export default function ScheduleRegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const today = new Date();

  // ✅ 수정 모드 여부 판단
  const isEditMode = !!params.editId;

  const [selectedDate, setSelectedDate] = useState(today);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [workerName, setWorkerName] = useState('');
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [startOpen, setStartOpen] = useState(false);
  const [endHour, setEndHour] = useState(18);
  const [endMinute, setEndMinute] = useState(0);
  const [endOpen, setEndOpen] = useState(false);

  // ✅ 수정 모드일 때 기존 데이터로 초기화
  useEffect(() => {
    if (!isEditMode) return;

    if (params.editWorker) setWorkerName(params.editWorker as string);

    if (params.editDate) {
      const [y, m, d] = (params.editDate as string).split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      setSelectedDate(dateObj);
      setCalYear(y);
      setCalMonth(m - 1);
    }

    if (params.editTime) {
      const [startStr, endStr] = (params.editTime as string).split(' ~ ');
      const [sh, sm] = startStr.split(':').map(Number);
      const [eh, em] = endStr.split(':').map(Number);
      setStartHour(sh); setStartMinute(sm);
      setEndHour(eh); setEndMinute(em);
    }
  }, []);

  const pad = (v: number) => String(v).padStart(2, '0');
  const startStr = `${pad(startHour)}:${pad(startMinute)}`;
  const endStr   = `${pad(endHour)}:${pad(endMinute)}`;

  const daysInMonth    = useMemo(() => getDaysInMonth(calYear, calMonth), [calYear, calMonth]);
  const firstDayOffset = useMemo(() => getFirstDayOfWeek(calYear, calMonth), [calYear, calMonth]);
  const calCells = useMemo(() => {
    const cells: (number | null)[] = Array(firstDayOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [daysInMonth, firstDayOffset]);

  const prevMonth = () => calMonth === 0 ? (setCalMonth(11), setCalYear(y => y - 1)) : setCalMonth(m => m - 1);
  const nextMonth = () => calMonth === 11 ? (setCalMonth(0), setCalYear(y => y + 1)) : setCalMonth(m => m + 1);

  const isSelectedDay = (day: number | null) =>
    !!day &&
    selectedDate.getFullYear() === calYear &&
    selectedDate.getMonth() === calMonth &&
    selectedDate.getDate() === day;

  const handleDayPress = (day: number | null) => {
    if (!day) return;
    setSelectedDate(new Date(calYear, calMonth, day));
    setCalendarOpen(false);
  };

  const handleConfirm = () => {
    if (!workerName.trim()) {
      Alert.alert('입력 오류', '근무자 이름을 입력해주세요.');
      return;
    }
    if (startHour * 60 + startMinute >= endHour * 60 + endMinute) {
      Alert.alert('시간 오류', '종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    if (isEditMode) {
      router.replace({
        pathname: '/schedule',
        params: {
          editId: params.editId as string,
          editWorker: workerName.trim(),
          editDate: toDateString(selectedDate),
          editTime: `${startStr} ~ ${endStr}`,
        },
      });
    } else {
      router.replace({
        pathname: '/schedule',
        params: {
          newWorker: workerName.trim(),
          newDate: toDateString(selectedDate),
          newTime: `${startStr} ~ ${endStr}`,
          newId: Date.now().toString(),
        },
      });
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#2B50E6" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{isEditMode ? '근무 수정' : '근무 등록'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.pageTitle}>{isEditMode ? '근무 수정' : '근무 등록'}</Text>

        <Text style={s.label}>*근무자 이름</Text>
        <View style={s.inputBox}>
          <TextInput
            style={s.input}
            placeholder="이름을 입력하세요"
            placeholderTextColor="#BDBDBD"
            value={workerName}
            onChangeText={setWorkerName}
            returnKeyType="done"
          />
        </View>

        <Text style={[s.label, { marginTop: 20 }]}>*날짜선택</Text>
        <TouchableOpacity
          style={[s.inputBox, calendarOpen && s.inputBoxActive]}
          onPress={() => setCalendarOpen(o => !o)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={18} color={calendarOpen ? '#2B50E6' : '#BDBDBD'} style={{ marginRight: 10 }} />
          <Text style={[s.inputText, calendarOpen && { color: '#2B50E6' }]}>
            {toDateString(selectedDate)}
          </Text>
          <Ionicons name={calendarOpen ? 'chevron-up' : 'chevron-down'} size={16} color={calendarOpen ? '#2B50E6' : '#BDBDBD'} />
        </TouchableOpacity>

        {calendarOpen && (
          <View style={s.cal}>
            <View style={s.calHead}>
              <Text style={s.calMonth}>{MONTH_NAMES[calMonth]} {calYear}</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity onPress={prevMonth} style={s.navBtn}>
                  <Ionicons name="chevron-back" size={18} color="#888" />
                </TouchableOpacity>
                <TouchableOpacity onPress={nextMonth} style={s.navBtn}>
                  <Ionicons name="chevron-forward" size={18} color="#888" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={s.weekRow}>
              {WEEKDAY_SHORT.map(w => <Text key={w} style={s.weekTxt}>{w}</Text>)}
            </View>
            <View style={s.grid}>
              {calCells.map((day, idx) => {
                const active = isSelectedDay(day);
                const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[s.cell, active && s.cellActive]}
                    onPress={() => handleDayPress(day)}
                    activeOpacity={day ? 0.7 : 1}
                  >
                    <Text style={[s.cellTxt, active && s.cellTxtActive, !active && isToday && s.cellTxtToday, !day && { opacity: 0 }]}>
                      {day ?? '.'}
                    </Text>
                    {isToday && !active && <View style={s.todayDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <Text style={[s.label, { marginTop: 20 }]}>*시간</Text>
        <View style={s.timeRow}>
          <TouchableOpacity
            style={[s.timeCard, startOpen && s.timeCardActive]}
            onPress={() => { setStartOpen(true); setEndOpen(false); }}
            activeOpacity={0.8}
          >
            <Text style={s.timeCardLabel}>시작</Text>
            <Text style={[s.timeCardValue, startOpen && { color: '#222' }]}>{startStr}</Text>
          </TouchableOpacity>
          <Ionicons name="arrow-forward" size={18} color="#BDBDBD" style={{ paddingTop: 12 }} />
          <TouchableOpacity
            style={[s.timeCard, endOpen && s.timeCardActive]}
            onPress={() => { setEndOpen(true); setStartOpen(false); }}
            activeOpacity={0.8}
          >
            <Text style={s.timeCardLabel}>종료</Text>
            <Text style={[s.timeCardValue, endOpen && { color: '#222' }]}>{endStr}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.summary}>
          <Ionicons name="time-outline" size={15} color="#666" />
          <Text style={s.summaryTxt}>{startStr} ~ {endStr}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={s.confirmTxt}>{isEditMode ? '수정 완료' : '확인'}</Text>
        </TouchableOpacity>
      </View>

      <TimePickerModal
        visible={startOpen} title="시작 시간"
        hour={startHour} minute={startMinute}
        onChangeHour={setStartHour} onChangeMinute={setStartMinute}
        onClose={() => setStartOpen(false)}
      />
      <TimePickerModal
        visible={endOpen} title="종료 시간"
        hour={endHour} minute={endMinute}
        onChangeHour={setEndHour} onChangeMinute={setEndMinute}
        onClose={() => setEndOpen(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 120 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 8 },
  inputBox: { borderWidth: 1.5, borderColor: '#DADADF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA' },
  inputBoxActive: { borderColor: '#2B50E6', backgroundColor: '#F5F7FF' },
  input: { flex: 1, fontSize: 15, color: '#222', fontWeight: '500' },
  inputText: { flex: 1, fontSize: 15, color: '#222', fontWeight: '500' },
  cal: { marginTop: 8, borderWidth: 1.5, borderColor: '#2B50E6', borderRadius: 16, padding: 16, backgroundColor: '#F8F9FF' },
  calHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  calMonth: { fontSize: 15, fontWeight: '700', color: '#111' },
  navBtn: { padding: 6 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  weekTxt: { fontSize: 11, fontWeight: '700', color: '#ABABAB', width: 36, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  cellActive: { backgroundColor: '#2B50E6', borderRadius: 999 },
  cellTxt: { fontSize: 14, color: '#222', fontWeight: '500' },
  cellTxtActive: { color: '#fff', fontWeight: '700' },
  cellTxtToday: { color: '#2B50E6', fontWeight: '800' },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#2B50E6', position: 'absolute', bottom: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeCard: { flex: 1, borderWidth: 1.5, borderColor: '#DADADF', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FAFAFA', alignItems: 'center' },
  timeCardActive: { borderColor: '#2B50E6', backgroundColor: '#F5F7FF' },
  timeCardLabel: { fontSize: 11, fontWeight: '600', color: '#AAAAAA', marginBottom: 4 },
  timeCardValue: { fontSize: 18, fontWeight: '600', color: '#444' }, // 크기와 굵기 하향 조정, 색상 톤 다운
  summary: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#F8F9FA', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 }, // 은은한 배경으로 변경
  summaryTxt: { fontSize: 14, fontWeight: '600', color: '#555' }, // 파란색 제거 및 굵기 조절
  bottomBar: { position: 'absolute', bottom: 24, left: 24, right: 24 },
  confirmBtn: { backgroundColor: '#2B50E6', borderRadius: 16, height: 54, justifyContent: 'center', alignItems: 'center', shadowColor: '#2B50E6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  confirmTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});