import React, { useState } from 'react';
import { 
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, 
  TextInput, Alert, ActivityIndicator, FlatList 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../utils/api';

type WorkplaceType = {
  id: number;
  name: string;
};

export default function WorkplaceJoinScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<WorkplaceType[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceType | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  // 사업장 검색
  const handleSearch = async () => {
    if (!search.trim()) return;

    setSearchLoading(true);
    setSelectedWorkplace(null);
    try {
      const result = await apiRequest(`/workplace/search?name=${encodeURIComponent(search.trim())}`);
      setSearchResults(result);
      if (result.length === 0) {
        Alert.alert('검색 결과 없음', '해당 사업장을 찾을 수 없습니다.');
      }
    } catch (error: any) {
      Alert.alert('검색 실패', error.message || '다시 시도해주세요.');
    } finally {
      setSearchLoading(false);
    }
  };

  // 사업장 참가
  const handleJoin = async () => {
    if (!selectedWorkplace) return;

    setJoinLoading(true);
    try {
      const result = await apiRequest(`/workplace/joinId?workplaceId=${selectedWorkplace.id}`, {
        method: 'PATCH',
      });

      Alert.alert('사업장 참가 완료', `${result.workplaceName}에 참가했습니다.`, [
        {
          text: '확인',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('참가 실패', error.message || '다시 시도해주세요.');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>사업장 선택</Text>

        {/* 검색창 */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#BDBDBD" />
          <TextInput
            style={styles.searchInput}
            placeholder="사업장 검색"
            placeholderTextColor="#BDBDBD"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchLoading && <ActivityIndicator size="small" color="#2140DC" />}
        </View>

        {/* 검색 버튼 */}
        <TouchableOpacity
          style={[styles.searchBtn, !search.trim() && { backgroundColor: '#BDBDBD' }]}
          disabled={!search.trim()}
          activeOpacity={0.8}
          onPress={handleSearch}
        >
          <Text style={styles.searchBtnText}>검색</Text>
        </TouchableOpacity>

        {/* 검색 결과 목록 */}
        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            style={styles.resultList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.resultItem,
                  selectedWorkplace?.id === item.id && styles.resultItemSelected,
                ]}
                onPress={() => setSelectedWorkplace(item)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.resultItemText,
                  selectedWorkplace?.id === item.id && styles.resultItemTextSelected,
                ]}>
                  {item.name}
                </Text>
                {selectedWorkplace?.id === item.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#2140DC" />
                )}
              </TouchableOpacity>
            )}
          />
        )}

        {/* 선택된 사업장 표시 */}
        {selectedWorkplace && (
          <Text style={styles.selectedText}>
            선택된 사업장: {selectedWorkplace.name}
          </Text>
        )}

        {/* 완료 버튼 */}
        <TouchableOpacity
          style={[styles.doneBtn, (!selectedWorkplace || joinLoading) && { backgroundColor: '#BDBDBD' }]}
          disabled={!selectedWorkplace || joinLoading}
          activeOpacity={0.8}
          onPress={handleJoin}
        >
          {joinLoading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.doneBtnText}>완료</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 24 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, height: 52, paddingHorizontal: 16, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#111' },
  searchBtn: { backgroundColor: '#2140DC', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  searchBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  resultList: { maxHeight: 200, marginBottom: 16 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, marginBottom: 8 },
  resultItemSelected: { borderColor: '#2140DC', backgroundColor: '#F0F4FF' },
  resultItemText: { fontSize: 15, color: '#111' },
  resultItemTextSelected: { color: '#2140DC', fontWeight: 'bold' },
  selectedText: { fontSize: 13, color: '#2140DC', marginBottom: 16, textAlign: 'center' },
  doneBtn: { backgroundColor: '#2140DC', height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});