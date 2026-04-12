import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ShiftItem = {
  id: number;
  start: string;
  end: string;
  date: Date;
};

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

function formatTimeInput(value: string) {
  const numbersOnly = value.replace(/\D/g, '').slice(0, 4);

  if (numbersOnly.length <= 2) {
    return numbersOnly;
  }

  return `${numbersOnly.slice(0, 2)}:${numbersOnly.slice(2)}`;
}

function isValidTime(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function normalizeTime(value: string) {
  const digits = value.replace(/\D/g, '');

  if (digits.length !== 4) return value;

  const hour = Number(digits.slice(0, 2));
  const minute = Number(digits.slice(2, 4));

  if (hour > 23 || minute > 59) return value;

  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

export default function CalendarScreen() {
  const initialSelectedDate = new Date(2026, 3, 11);

  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [currentWeekBase, setCurrentWeekBase] = useState(initialSelectedDate);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [tempYear, setTempYear] = useState(initialSelectedDate.getFullYear());
  const [tempMonth, setTempMonth] = useState(initialSelectedDate.getMonth());

  const [shifts, setShifts] = useState<ShiftItem[]>([
    {
      id: 1,
      start: '09:00',
      end: '12:00',
      date: new Date(2026, 3, 11),
    },
    {
      id: 2,
      start: '09:00',
      end: '12:00',
      date: new Date(2026, 3, 9),
    },
    {
      id: 3,
      start: '09:00',
      end: '12:00',
      date: new Date(2026, 3, 14),
    },
    {
      id: 4,
      start: '09:00',
      end: '12:00',
      date: new Date(2026, 3, 15),
    },
    {
      id: 5,
      start: '13:00',
      end: '18:00',
      date: new Date(2026, 3, 16),
    },
  ]);

  const weekDates = useMemo(() => getWeekDates(currentWeekBase), [currentWeekBase]);

  const weeklyShifts = useMemo(() => {
    return shifts
      .filter((item) => weekDates.some((d) => isSameDay(d, item.date)))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [shifts, weekDates]);

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekBase);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekBase(newDate);

    if (!getWeekDates(newDate).some((d) => isSameDay(d, selectedDate))) {
      setSelectedDate(getWeekDates(newDate)[0]);
    }

    setIsEditing(false);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekBase);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekBase(newDate);

    if (!getWeekDates(newDate).some((d) => isSameDay(d, selectedDate))) {
      setSelectedDate(getWeekDates(newDate)[0]);
    }

    setIsEditing(false);
  };

  const openMonthPicker = () => {
    setTempYear(selectedDate.getFullYear());
    setTempMonth(selectedDate.getMonth());
    setPickerVisible(true);
  };

  const applyMonthPicker = () => {
    const newDate = new Date(tempYear, tempMonth, 1);
    setCurrentWeekBase(newDate);
    setSelectedDate(newDate);
    setPickerVisible(false);
    setIsEditing(false);
  };

  const handleChangeShiftStart = (id: number, value: string) => {
    const formatted = formatTimeInput(value);
    setShifts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, start: formatted } : item))
    );
  };

  const handleChangeShiftEnd = (id: number, value: string) => {
    const formatted = formatTimeInput(value);
    setShifts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, end: formatted } : item))
    );
  };

  const handleBlurShiftStart = (id: number) => {
    setShifts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const normalized = normalizeTime(item.start);
        return { ...item, start: normalized };
      })
    );
  };

  const handleBlurShiftEnd = (id: number) => {
    setShifts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const normalized = normalizeTime(item.end);
        return { ...item, end: normalized };
      })
    );
  };

  const handlePressEdit = () => {
    setIsEditing(true);
  };

  const handleDeleteShift = (id: number) => {
    Alert.alert('근무 삭제', '이 근무를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setShifts((prev) => prev.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  const handleCompleteEdit = () => {
    const invalidShift = weeklyShifts.find(
      (item) => !isValidTime(item.start) || !isValidTime(item.end)
    );

    if (invalidShift) {
      Alert.alert('시간 형식 확인', '시간은 09:00 형식으로 입력해주세요.');
      return;
    }

    setIsEditing(false);
  };

  const years = Array.from({ length: 11 }, (_, i) => 2022 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.screenTitle}>캘린더</Text>

          <TouchableOpacity
            style={styles.monthButton}
            activeOpacity={0.8}
            onPress={openMonthPicker}
          >
            <Text style={styles.monthButtonText}>{formatMonthLabel(selectedDate)}</Text>
            <Ionicons name="chevron-down" size={16} color="#222222" />
          </TouchableOpacity>

          <View style={styles.weekRowWrapper}>
            <TouchableOpacity style={styles.arrowButton} onPress={handlePrevWeek}>
              <Ionicons name="chevron-back" size={20} color="#2B50E6" />
            </TouchableOpacity>

            <View style={styles.weekRow}>
              {weekDates.map((date) => {
                const active = isSameDay(date, selectedDate);

                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>
                      {date.getDate()}
                    </Text>
                    <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>
                      {WEEKDAY_KR[date.getDay()]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.arrowButton} onPress={handleNextWeek}>
              <Ionicons name="chevron-forward" size={20} color="#2B50E6" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>나의 근무</Text>

            <View style={styles.headerRightRow}>
              <TouchableOpacity
                style={[styles.editButton, isEditing && styles.editingButton]}
                activeOpacity={0.85}
                onPress={handlePressEdit}
                disabled={isEditing}
              >
                <Ionicons
                  name={isEditing ? 'build-outline' : 'create-outline'}
                  size={12}
                  color={isEditing ? '#2B50E6' : '#8E8E8E'}
                />
                <Text
                  style={[
                    styles.editButtonText,
                    isEditing && styles.editingButtonText,
                  ]}
                >
                  {isEditing ? '수정 중' : '편집'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardList}>
            {weeklyShifts.length > 0 ? (
              weeklyShifts.map((item) => {
                const active = isSameDay(item.date, selectedDate);
                const startInvalid = item.start.length > 0 && !isValidTime(item.start);
                const endInvalid = item.end.length > 0 && !isValidTime(item.end);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.shiftCard, active && styles.shiftCardActive]}
                    activeOpacity={isEditing ? 1 : 0.9}
                    onPress={() => {
                      if (!isEditing) {
                        setSelectedDate(item.date);
                      }
                    }}
                  >
                    <View style={styles.shiftTopRow}>
                      <View style={styles.shiftTitleRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color={active ? '#2F2F2F' : '#3C3C3C'}
                        />
                        <Text style={styles.shiftDateText}>{formatCardDate(item.date)}</Text>
                      </View>

                      {isEditing && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          activeOpacity={0.8}
                          onPress={() => handleDeleteShift(item.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#FF4D4F" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {isEditing ? (
                      <View style={styles.editFormArea}>
                        <Text style={styles.inputLabel}>시작 시간</Text>
                        <TextInput
                          value={item.start}
                          onChangeText={(text) => handleChangeShiftStart(item.id, text)}
                          onBlur={() => handleBlurShiftStart(item.id)}
                          placeholder="09:00"
                          style={[
                            styles.editInput,
                            startInvalid && styles.editInputError,
                          ]}
                          placeholderTextColor="#A0A0A0"
                          keyboardType="number-pad"
                          maxLength={5}
                        />

                        <Text style={styles.inputLabel}>종료 시간</Text>
                        <TextInput
                          value={item.end}
                          onChangeText={(text) => handleChangeShiftEnd(item.id, text)}
                          onBlur={() => handleBlurShiftEnd(item.id)}
                          placeholder="12:00"
                          style={[
                            styles.editInput,
                            endInvalid && styles.editInputError,
                          ]}
                          placeholderTextColor="#A0A0A0"
                          keyboardType="number-pad"
                          maxLength={5}
                        />

                        {(startInvalid || endInvalid) && (
                          <Text style={styles.errorText}>
                            시간은 09:00 형식으로 입력해주세요.
                          </Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.shiftTimeText}>
                        {item.start} ~ {item.end}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>이번 주 근무 일정이 없어요.</Text>
              </View>
            )}
          </View>

          {isEditing && weeklyShifts.length > 0 && (
            <TouchableOpacity
              style={styles.completeButton}
              activeOpacity={0.9}
              onPress={handleCompleteEdit}
            >
              <Text style={styles.completeButtonText}>수정 완료</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <Modal
          visible={pickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>년 / 월 선택</Text>

              <Text style={styles.modalSectionLabel}>년도</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerRow}
              >
                {years.map((year) => {
                  const selected = tempYear === year;
                  return (
                    <TouchableOpacity
                      key={year}
                      style={[styles.pickerChip, selected && styles.pickerChipActive]}
                      onPress={() => setTempYear(year)}
                    >
                      <Text
                        style={[
                          styles.pickerChipText,
                          selected && styles.pickerChipTextActive,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.modalSectionLabel}>월</Text>
              <View style={styles.monthGrid}>
                {months.map((month) => {
                  const selected = tempMonth === month;
                  return (
                    <TouchableOpacity
                      key={month}
                      style={[styles.monthCell, selected && styles.monthCellActive]}
                      onPress={() => setTempMonth(month)}
                    >
                      <Text
                        style={[
                          styles.monthCellText,
                          selected && styles.monthCellTextActive,
                        ]}
                      >
                        {month + 1}월
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setPickerVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.confirmButton} onPress={applyMonthPicker}>
                  <Text style={styles.confirmButtonText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scroll: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 140,
  },

  screenTitle: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginTop: 8,
    marginBottom: 20,
  },

  monthButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 18,
  },

  monthButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },

  weekRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  arrowButton: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: 6,
  },

  dayChip: {
    width: 36,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  dayChipActive: {
    backgroundColor: '#2B50E6',
    borderColor: '#2B50E6',
  },

  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 2,
  },

  dayNumberActive: {
    color: '#FFFFFF',
  },

  dayLabel: {
    fontSize: 10,
    color: '#5F5F5F',
    fontWeight: '500',
  },

  dayLabelActive: {
    color: '#FFFFFF',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#151515',
  },

  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  editingButton: {
    backgroundColor: '#EEF3FF',
    borderColor: '#C9D6FF',
  },

  editButtonText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#8A8A8A',
    fontWeight: '500',
  },

  editingButtonText: {
    color: '#2B50E6',
    fontWeight: '700',
  },

  cardList: {
    marginTop: 2,
  },

  shiftCard: {
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,
  },

  shiftCardActive: {
    backgroundColor: '#ECEFFF',
  },

  shiftTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  shiftTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  shiftDateText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#262626',
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF4F4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  shiftTimeText: {
    fontSize: 14,
    color: '#767676',
    fontWeight: '500',
  },

  editFormArea: {
    marginTop: 6,
  },

  inputLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },

  editInput: {
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADDE5',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1F1F1F',
  },

  editInputError: {
    borderColor: '#FF6B6B',
  },

  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#FF4D4F',
    fontWeight: '500',
  },

  emptyBox: {
    marginTop: 8,
    backgroundColor: '#F7F7F7',
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: '#8A8A8A',
  },

  completeButton: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#2B50E6',
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },

  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B1B1B',
    marginBottom: 18,
  },

  modalSectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444444',
    marginBottom: 10,
    marginTop: 4,
  },

  pickerRow: {
    paddingBottom: 8,
    gap: 8,
  },

  pickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#F3F4F8',
    marginRight: 8,
  },

  pickerChipActive: {
    backgroundColor: '#2B50E6',
  },

  pickerChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B4B4B',
  },

  pickerChipTextActive: {
    color: '#FFFFFF',
  },

  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 10,
  },

  monthCell: {
    width: '30%',
    backgroundColor: '#F3F4F8',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  monthCellActive: {
    backgroundColor: '#2B50E6',
  },

  monthCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B4B4B',
  },

  monthCellTextActive: {
    color: '#FFFFFF',
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },

  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777777',
  },

  confirmButton: {
    backgroundColor: '#2B50E6',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});