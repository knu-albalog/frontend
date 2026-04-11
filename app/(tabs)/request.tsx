import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FilterType = 'All' | '사장' | '파트타이머';

type RequestItem = {
  id: number;
  senderType: '사장' | '파트타이머';
  senderName: string;
  content: string;
  confirmed: boolean;
};

export default function RequestScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
  const [searchText, setSearchText] = useState('');

  const [requestList, setRequestList] = useState<RequestItem[]>([
    {
      id: 1,
      senderType: '사장',
      senderName: '사장 닉네임',
      content: '냉장고 음료 채워주세요',
      confirmed: false,
    },
    {
      id: 2,
      senderType: '사장',
      senderName: '사장 닉네임',
      content: '다음 주 근무 일정 확인해주세요',
      confirmed: false,
    },
    {
      id: 3,
      senderType: '파트타이머',
      senderName: '파트타이머 닉네임',
      content: '아이스컵 거의 없어서 내일 채워야 돼',
      confirmed: false,
    },
    {
      id: 4,
      senderType: '파트타이머',
      senderName: '파트타이머 닉네임',
      content: '우유 얼마 안 남았어',
      confirmed: false,
    },
  ]);

  const handleConfirm = (id: number) => {
    setRequestList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, confirmed: true } : item
      )
    );
  };

  const filteredRequests = useMemo(() => {
    const filtered = requestList.filter((item) => {
      const matchFilter =
        selectedFilter === 'All' ? true : item.senderType === selectedFilter;

      const trimmedSearch = searchText.trim();
      const matchSearch =
        trimmedSearch.length === 0 ||
        item.senderName.includes(trimmedSearch) ||
        item.content.includes(trimmedSearch) ||
        item.senderType.includes(trimmedSearch);

      return matchFilter && matchSearch;
    });

    return filtered.sort((a, b) => {
      if (a.confirmed === b.confirmed) {
        return a.id - b.id;
      }
      return a.confirmed ? 1 : -1;
    });
  }, [selectedFilter, searchText, requestList]);

  const renderRequestItem = ({ item }: { item: RequestItem }) => {
    const isConfirmed = item.confirmed;

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestLeft}>
          <View
            style={[
              styles.iconCircle,
              isConfirmed ? styles.inactiveIconCircle : styles.activeIconCircle,
            ]}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color={isConfirmed ? '#9E9E9E' : '#2140DC'}
            />
          </View>

          <View style={styles.requestTextWrap}>
            <Text style={styles.senderText}>
              {item.senderType}{' '}
              <Text style={styles.nickText}>{item.senderName}</Text>
            </Text>
            <Text style={styles.requestContent} numberOfLines={1}>
              {item.content}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleConfirm(item.id)}
          disabled={item.confirmed}
          style={[
            styles.confirmButton,
            item.confirmed ? styles.confirmedButton : styles.activeConfirmButton,
          ]}
        >
          <Text
            style={[
              styles.confirmButtonText,
              item.confirmed && styles.confirmedButtonText,
            ]}
          >
            {item.confirmed ? '확인됨' : '확인'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const FilterButton = ({
    label,
    value,
  }: {
    label: string;
    value: FilterType;
  }) => {
    const isActive = selectedFilter === value;

    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.activeFilterButton]}
        onPress={() => setSelectedFilter(value)}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.filterButtonText,
            isActive && styles.activeFilterButtonText,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>요구사항</Text>

        <View style={styles.filterContainer}>
          <FilterButton label="All" value="All" />
          <FilterButton label="사장" value="사장" />
          <FilterButton label="파트타이머" value="파트타이머" />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color="#C6C6C6" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="검색"
            placeholderTextColor="#C6C6C6"
            style={styles.searchInput}
            underlineColorAndroid="transparent"
            selectionColor="#2140DC"
          />
        </View>

        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 20,
  },

  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#2140DC',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },

  searchContainer: {
    height: 40,
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 14,
    color: '#222222',
    paddingVertical: 0,
    borderWidth: 0,
  
  },

  listContent: {
    paddingBottom: 24,
  },

  requestCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },

  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },

  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeIconCircle: {
    backgroundColor: '#F1F5FF',
  },
  inactiveIconCircle: {
    backgroundColor: '#F0F0F0',
  },

  requestTextWrap: {
    flex: 1,
  },
  senderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  nickText: {
    fontWeight: '600',
    color: '#333333',
  },
  requestContent: {
    fontSize: 12,
    color: '#999999',
  },

  confirmButton: {
    minWidth: 62,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  activeConfirmButton: {
    backgroundColor: '#2140DC',
  },
  confirmedButton: {
    backgroundColor: '#D3D3D3',
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmedButtonText: {
    color: '#FFFFFF',
  },
});