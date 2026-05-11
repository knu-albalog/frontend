import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '../../utils/api';

type ShiftItem = {
  id: string;
  start: string;
  end: string;
  date: Date;
};

type ScheduleDate = {
  id?: number | null;
  scheduleId?: number | null;
  workDate?: string | null;
  date?: string | null;
  scheduleDate?: string | null;
  startTime?: string | null;
  start?: string | null;
  endTime?: string | null;
  end?: string | null;
  note?: string | null;
};

type MyScheduleResponse = {
  userId?: number | null;
  userName?: string | null;
  workplaceId?: number | null;
  workplaceName?: string | null;
  scheduleDates?: ScheduleDate[];
  schedules?: ScheduleDate[];
  content?: ScheduleDate[];
  data?: ScheduleDate[] | ScheduleDate | null;
};

const MAIN_COLOR = '#2140DC';
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

function getDateOnly(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isPastDate(date: Date) {
  return getDateOnly(date).getTime() < getDateOnly(new Date()).getTime();
}

function isTodayDate(date: Date) {
  return isSameDay(date, new Date());
}

function isFutureDate(date: Date) {
  return getDateOnly(date).getTime() > getDateOnly(new Date()).getTime();
}

function getShiftSortPriority(date: Date) {
  if (isTodayDate(date)) return 0;
  if (isFutureDate(date)) return 1;
  return 2;
}

function getWeekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();

  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);

  return copy;
}

function getWeekEnd(date: Date) {
  const start = getWeekStart(date);
  const end = new Date(start);

  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return end;
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

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDateValue(value: any) {
  if (!value) return new Date();

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value) && value.length >= 3) {
    return new Date(Number(value[0]), Number(value[1]) - 1, Number(value[2]));
  }

  if (typeof value === 'string') {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (dateOnlyMatch) {
      return new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3])
      );
    }

    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

function parseTimeValue(value: any, fallback = '00:00') {
  if (!value) return fallback;

  if (Array.isArray(value) && value.length >= 2) {
    return `${String(value[0]).padStart(2, '0')}:${String(value[1]).padStart(2, '0')}`;
  }

  if (typeof value === 'string') {
    const timeMatch = value.match(/(\d{2}):(\d{2})/);

    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]}`;
    }
  }

  return fallback;
}

function extractMyScheduleArray(result: MyScheduleResponse | ScheduleDate[] | any): ScheduleDate[] {
  if (!result) {
    return [];
  }

  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result.scheduleDates)) {
    return result.scheduleDates;
  }

  if (Array.isArray(result.schedules)) {
    return result.schedules;
  }

  if (Array.isArray(result.content)) {
    return result.content;
  }

  if (Array.isArray(result.data)) {
    return result.data;
  }

  if (result.data && typeof result.data === 'object') {
    return [result.data];
  }

  if (result.workDate || result.startTime || result.endTime) {
    return [result];
  }

  return [];
}

function normalizeScheduleItem(item: ScheduleDate, index: number): ShiftItem {
  const dateValue = item?.workDate ?? item?.date ?? item?.scheduleDate;
  const startValue = item?.startTime ?? item?.start;
  const endValue = item?.endTime ?? item?.end;

  return {
    id: String(item?.id ?? item?.scheduleId ?? index + 1),
    start: parseTimeValue(startValue, '00:00'),
    end: parseTimeValue(endValue, '00:00'),
    date: parseDateValue(dateValue),
  };
}

function dedupeShifts(items: ShiftItem[]) {
  const map = new Map<string, ShiftItem>();

  items.forEach((item) => {
    const key = [
      item.id,
      formatDateForApi(item.date),
      item.start,
      item.end,
    ].join('|');

    if (!map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values());
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();

  const [today, setToday] = useState(new Date());
  const [currentWeekBase, setCurrentWeekBase] = useState(new Date());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth());

  const [shifts, setShifts] = useState<ShiftItem[]>([]);

  const weekDates = useMemo(() => getWeekDates(currentWeekBase), [currentWeekBase]);

  const weeklyShifts = useMemo(() => {
    return shifts
      .filter((item) => weekDates.some((d) => isSameDay(d, item.date)))
      .sort((a, b) => {
        const priorityDiff = getShiftSortPriority(a.date) - getShiftSortPriority(b.date);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        const aPriority = getShiftSortPriority(a.date);

        if (aPriority === 2) {
          const dateDiff = b.date.getTime() - a.date.getTime();

          if (dateDiff !== 0) {
            return dateDiff;
          }

          return a.start.localeCompare(b.start);
        }

        const dateDiff = a.date.getTime() - b.date.getTime();

        if (dateDiff !== 0) {
          return dateDiff;
        }

        return a.start.localeCompare(b.start);
      });
  }, [shifts, weekDates]);

  const loadWeekSchedules = useCallback(async (baseDate: Date) => {
    setScheduleLoading(true);

    const targetWeekDates = getWeekDates(baseDate);
    const weekStart = getWeekStart(baseDate);
    const weekEnd = getWeekEnd(baseDate);

    const startDateText = formatDateForApi(weekStart);
    const endDateText = formatDateForApi(weekEnd);

    try {
      const result = await apiRequest(
        `/schedule/period?startDate=${startDateText}&endDate=${endDateText}`
      );

      console.log('캘린더 내 주간 근무 조회 결과:', result);

      const scheduleArray = extractMyScheduleArray(result);

      const normalizedSchedules = scheduleArray
        .map((item, index) => normalizeScheduleItem(item, index))
        .filter((item) => targetWeekDates.some((date) => isSameDay(date, item.date)))
        .filter((item) => item.start && item.end);

      setShifts(dedupeShifts(normalizedSchedules));
    } catch (error: any) {
      console.log('내 주간 스케줄 조회 실패:', error?.message || error);
      setShifts([]);
      Alert.alert('오류', '나의 주간 근무 일정을 불러오지 못했습니다.');
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const now = new Date();

      setToday(now);
      setCurrentWeekBase(now);
      setTempYear(now.getFullYear());
      setTempMonth(now.getMonth());

      loadWeekSchedules(now);
    }, [loadWeekSchedules])
  );

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekBase);
    newDate.setDate(newDate.getDate() - 7);

    setCurrentWeekBase(newDate);
    loadWeekSchedules(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekBase);
    newDate.setDate(newDate.getDate() + 7);

    setCurrentWeekBase(newDate);
    loadWeekSchedules(newDate);
  };

  const openMonthPicker = () => {
    setTempYear(currentWeekBase.getFullYear());
    setTempMonth(currentWeekBase.getMonth());
    setPickerVisible(true);
  };

  const applyMonthPicker = () => {
    const newDate = new Date(tempYear, tempMonth, 1);

    setCurrentWeekBase(newDate);
    setPickerVisible(false);
    loadWeekSchedules(newDate);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 150 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.screenTitle}>캘린더</Text>

          <TouchableOpacity
            style={styles.monthButton}
            activeOpacity={0.8}
            onPress={openMonthPicker}
          >
            <Text style={styles.monthButtonText}>{formatMonthLabel(currentWeekBase)}</Text>
            <Ionicons name="chevron-down" size={16} color="#222222" />
          </TouchableOpacity>

          <View style={styles.weekRowWrapper}>
            <TouchableOpacity style={styles.arrowButton} onPress={handlePrevWeek}>
              <Ionicons name="chevron-back" size={20} color={MAIN_COLOR} />
            </TouchableOpacity>

            <View style={styles.weekRow}>
              {weekDates.map((date) => {
                const active = isSameDay(date, today);
                const hasShift = shifts.some((shift) => isSameDay(shift.date, date));

                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                    activeOpacity={1}
                    disabled
                  >
                    <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>
                      {date.getDate()}
                    </Text>

                    <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>
                      {WEEKDAY_KR[date.getDay()]}
                    </Text>

                    {hasShift && (
                      <View style={[styles.shiftDot, active && styles.shiftDotActive]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.arrowButton} onPress={handleNextWeek}>
              <Ionicons name="chevron-forward" size={20} color={MAIN_COLOR} />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>나의 근무</Text>
          </View>

          <View style={styles.cardList}>
            {scheduleLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={MAIN_COLOR} />
                <Text style={styles.loadingBoxText}>근무 일정을 불러오는 중...</Text>
              </View>
            ) : weeklyShifts.length > 0 ? (
              weeklyShifts.map((item) => {
                const todayShift = isTodayDate(item.date);
                const pastShift = isPastDate(item.date);

                return (
                  <TouchableOpacity
                    key={`${item.id}-${formatDateForApi(item.date)}-${item.start}-${item.end}`}
                    style={[
                      styles.shiftCard,
                      todayShift && styles.shiftCardToday,
                      pastShift && styles.shiftCardPast,
                    ]}
                    activeOpacity={0.9}
                    disabled
                  >
                    <View style={styles.shiftTopRow}>
                      <View style={styles.shiftTitleRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color={todayShift ? '#FFFFFF' : '#202020'}
                        />

                        <Text
                          style={[
                            styles.shiftDateText,
                            todayShift && styles.todayText,
                            pastShift && styles.pastText,
                          ]}
                        >
                          {formatCardDate(item.date)}
                        </Text>
                      </View>

                      {todayShift && (
                        <View style={styles.todayBadge}>
                          <Text style={styles.todayBadgeText}>TODAY</Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.shiftTimeText,
                        todayShift && styles.todayText,
                        pastShift && styles.pastText,
                      ]}
                    >
                      {item.start} ~ {item.end}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>이번 주 근무 일정이 없어요.</Text>
              </View>
            )}
          </View>
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
    width: 38,
    height: 58,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  dayChipActive: {
    backgroundColor: MAIN_COLOR,
    borderColor: MAIN_COLOR,
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

  shiftDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: MAIN_COLOR,
    position: 'absolute',
    bottom: 6,
  },

  shiftDotActive: {
    backgroundColor: '#FFFFFF',
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

  cardList: {
    marginTop: 2,
  },

  loadingBox: {
    marginTop: 8,
    backgroundColor: '#F7F7F7',
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingBoxText: {
    marginTop: 8,
    fontSize: 13,
    color: '#8A8A8A',
  },

  shiftCard: {
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,
  },

  shiftCardToday: {
    backgroundColor: MAIN_COLOR,
  },

  shiftCardPast: {
    backgroundColor: '#E2E2E2',
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
    flex: 1,
  },

  shiftDateText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#262626',
  },

  shiftTimeText: {
    fontSize: 14,
    color: '#767676',
    fontWeight: '500',
  },

  todayText: {
    color: '#FFFFFF',
  },

  pastText: {
    color: '#777777',
    textDecorationLine: 'line-through',
  },

  todayBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  todayBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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
    backgroundColor: MAIN_COLOR,
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
    backgroundColor: MAIN_COLOR,
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
    backgroundColor: MAIN_COLOR,
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