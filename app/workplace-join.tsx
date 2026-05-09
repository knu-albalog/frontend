import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiRequest } from '../utils/api';

type WorkplaceType = {
  id: number;
  name: string;
};

export default function WorkplaceJoinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [searchResults, setSearchResults] = useState<WorkplaceType[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceType | null>(null);

  const [searchLoading, setSearchLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [inviteJoinLoading, setInviteJoinLoading] = useState(false);

  const getWorkplaceList = (result: any): WorkplaceType[] => {
    if (Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    if (Array.isArray(result?.result)) {
      return result.result;
    }

    if (Array.isArray(result?.content)) {
      return result.content;
    }

    return [];
  };

  const handleSearch = async () => {
    const keyword = search.trim();

    if (!keyword) {
      Alert.alert('알림', '사업장 이름을 입력해주세요.');
      return;
    }

    setSearchLoading(true);
    setSelectedWorkplace(null);
    setSearchResults([]);

    try {
      const result = await apiRequest(
        `/workplace/search?name=${encodeURIComponent(keyword)}`
      );

      const workplaceList = getWorkplaceList(result);
      setSearchResults(workplaceList);

      if (workplaceList.length === 0) {
        Alert.alert('검색 결과 없음', '해당 사업장을 찾을 수 없습니다.');
      }
    } catch (error: any) {
      console.log('사업장 검색 실패:', error.message);
      Alert.alert('검색 실패', error.message || '다시 시도해주세요.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleJoinById = async () => {
    if (!selectedWorkplace) {
      return;
    }

    setJoinLoading(true);

    try {
      const result = await apiRequest(
        `/workplace/joinId?workplaceId=${selectedWorkplace.id}`,
        {
          method: 'PATCH',
        }
      );

      Alert.alert(
        '사업장 참가 완료',
        `${result?.workplaceName ?? selectedWorkplace.name}에 참가했습니다.`,
        [
          {
            text: '확인',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.log('사업장 참가 실패:', error.message);
      Alert.alert('참가 실패', error.message || '다시 시도해주세요.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleJoinByInviteCode = async () => {
    const trimmedCode = inviteCode.trim();

    if (!trimmedCode) {
      Alert.alert('알림', '초대코드를 입력해주세요.');
      return;
    }

    setInviteJoinLoading(true);

    try {
      const result = await apiRequest(
        `/workplace/joinCode?inviteCode=${encodeURIComponent(trimmedCode)}`,
        {
          method: 'PATCH',
        }
      );

      Alert.alert(
        '사업장 참가 완료',
        `${result?.workplaceName ?? '사업장'}에 참가했습니다.`,
        [
          {
            text: '확인',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.log('초대코드 참가 실패:', error.message);

      const errorMessage = String(error?.message ?? '');

      if (
        errorMessage.includes('초대') ||
        errorMessage.includes('invite') ||
        errorMessage.includes('존재') ||
        errorMessage.includes('잘못')
      ) {
        Alert.alert('참가 실패', '유효하지 않은 초대코드입니다.');
        return;
      }

      Alert.alert('참가 실패', error.message || '다시 시도해주세요.');
    } finally {
      setInviteJoinLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 30 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Text style={styles.title}>사업장 선택</Text>

            <Text style={styles.description}>
              사업장 이름으로 검색하거나 초대코드로 사업장에 참여할 수 있습니다.
            </Text>

            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>사업장 이름으로 검색</Text>

              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#BDBDBD" />

                <TextInput
                  style={styles.searchInput}
                  placeholder="사업장 이름을 입력하세요"
                  placeholderTextColor="#BDBDBD"
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  editable={!searchLoading && !joinLoading && !inviteJoinLoading}
                />

                {searchLoading && <ActivityIndicator size="small" color="#2140DC" />}
              </View>

              <TouchableOpacity
                style={[
                  styles.searchBtn,
                  (!search.trim() || searchLoading) && styles.disabledBtn,
                ]}
                disabled={!search.trim() || searchLoading}
                activeOpacity={0.8}
                onPress={handleSearch}
              >
                {searchLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.searchBtnText}>검색</Text>
                )}
              </TouchableOpacity>
            </View>

            {searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                style={styles.resultList}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.resultItem,
                      selectedWorkplace?.id === item.id && styles.resultItemSelected,
                    ]}
                    onPress={() => setSelectedWorkplace(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultLeft}>
                      <View style={styles.resultIconCircle}>
                        <Ionicons name="storefront-outline" size={18} color="#2140DC" />
                      </View>

                      <Text
                        style={[
                          styles.resultItemText,
                          selectedWorkplace?.id === item.id &&
                            styles.resultItemTextSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>

                    {selectedWorkplace?.id === item.id && (
                      <Ionicons name="checkmark-circle" size={20} color="#2140DC" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}

            {selectedWorkplace && (
              <Text style={styles.selectedText}>
                선택된 사업장: {selectedWorkplace.name}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.doneBtn,
                (!selectedWorkplace || joinLoading) && styles.disabledBtn,
              ]}
              disabled={!selectedWorkplace || joinLoading}
              activeOpacity={0.8}
              onPress={handleJoinById}
            >
              {joinLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.doneBtnText}>선택한 사업장으로 참여</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>초대코드로 참여</Text>

              <View style={styles.searchBox}>
                <Ionicons name="key-outline" size={18} color="#BDBDBD" />

                <TextInput
                  style={styles.searchInput}
                  placeholder="초대코드를 입력하세요"
                  placeholderTextColor="#BDBDBD"
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  returnKeyType="done"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!searchLoading && !joinLoading && !inviteJoinLoading}
                  onSubmitEditing={handleJoinByInviteCode}
                />

                {inviteJoinLoading && <ActivityIndicator size="small" color="#2140DC" />}
              </View>

              <TouchableOpacity
                style={[
                  styles.inviteBtn,
                  (!inviteCode.trim() || inviteJoinLoading) && styles.disabledBtn,
                ]}
                disabled={!inviteCode.trim() || inviteJoinLoading}
                activeOpacity={0.8}
                onPress={handleJoinByInviteCode}
              >
                {inviteJoinLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.searchBtnText}>초대코드로 참여</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 30,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 10,
  },

  description: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 20,
    marginBottom: 24,
  },

  sectionBox: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111111',
  },

  searchBtn: {
    backgroundColor: '#2140DC',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inviteBtn: {
    backgroundColor: '#2140DC',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledBtn: {
    backgroundColor: '#BDBDBD',
  },

  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  resultList: {
    marginBottom: 12,
  },

  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
  },

  resultItemSelected: {
    borderColor: '#2140DC',
    backgroundColor: '#F0F4FF',
  },

  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },

  resultIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  resultItemText: {
    flex: 1,
    fontSize: 15,
    color: '#111111',
  },

  resultItemTextSelected: {
    color: '#2140DC',
    fontWeight: 'bold',
  },

  selectedText: {
    fontSize: 13,
    color: '#2140DC',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },

  doneBtn: {
    backgroundColor: '#2140DC',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },

  dividerText: {
    fontSize: 12,
    color: '#AAAAAA',
    marginHorizontal: 12,
    fontWeight: '600',
  },
});