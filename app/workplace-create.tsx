import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

const MAIN_COLOR = '#2140DC';
const MAIN_LIGHT_COLOR = '#EEF1FF';

export default function WorkplaceCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [workplaceName, setWorkplaceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');

  const normalizeName = (value: any) => {
    return String(value ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  };

  const getWorkplaceList = (result: any) => {
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

  const isDuplicateWorkplaceName = (list: any[], name: string) => {
    const targetName = normalizeName(name);

    return list.some((item: any) => {
      const existingName = item?.name ?? item?.workplaceName;
      return normalizeName(existingName) === targetName;
    });
  };

  const handleNameChange = (text: string) => {
    setWorkplaceName(text);

    if (duplicateError) {
      setDuplicateError('');
    }
  };

  const handleCreate = async () => {
    const trimmedName = workplaceName.trim();

    setDuplicateError('');

    if (!trimmedName) {
      Alert.alert('알림', '사업장 이름을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const searchResult = await apiRequest(
        `/workplace/search?name=${encodeURIComponent(trimmedName)}`
      );

      const workplaceList = getWorkplaceList(searchResult);

      if (isDuplicateWorkplaceName(workplaceList, trimmedName)) {
        setDuplicateError('이미 사용 중인 이름입니다.');
        return;
      }

      const result = await apiRequest('/workplace/create', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      if (!result?.id) {
        Alert.alert('사업장 생성 실패', '생성된 사업장 ID를 확인할 수 없습니다.');
        return;
      }

      await apiRequest(`/workplace/joinId?workplaceId=${result.id}`, {
        method: 'PATCH',
      });

      console.log('사업장 생성 성공:', result);

      Alert.alert('사업장 생성 완료', `${result.name} 사업장이 생성되었습니다.`, [
        {
          text: '확인',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error: any) {
      console.log('사업장 생성 실패:', error.message);

      const errorMessage = String(error?.message ?? '');

      if (
        errorMessage.includes('이미') ||
        errorMessage.includes('중복') ||
        errorMessage.includes('duplicate') ||
        errorMessage.includes('Duplicate')
      ) {
        setDuplicateError('이미 사용 중인 이름입니다.');
        return;
      }

      if (
        errorMessage.includes('관리자 권한') ||
        errorMessage.includes('권한')
      ) {
        Alert.alert('사업장 생성 실패', '사업장 생성은 사장님 계정만 가능합니다.');
        return;
      }

      Alert.alert('사업장 생성 실패', error.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={24} color="#222222" />
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <View style={styles.iconBox}>
              <Ionicons name="storefront-outline" size={34} color={MAIN_COLOR} />
            </View>

            <Text style={styles.title}>사업장 생성</Text>
            <Text style={styles.description}>
              새 사업장을 만들고 현재 계정에 연결합니다.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>사업장 이름</Text>

            <TextInput
              style={[
                styles.input,
                duplicateError ? styles.inputError : null,
              ]}
              placeholder="사업장 이름을 입력하세요"
              placeholderTextColor="#A9A9A9"
              value={workplaceName}
              onChangeText={handleNameChange}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />

            {duplicateError ? (
              <Text style={styles.errorText}>{duplicateError}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.createButton,
                (!workplaceName.trim() || loading) && styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              activeOpacity={0.85}
              disabled={!workplaceName.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>사업장 생성하기</Text>
              )}
            </TouchableOpacity>
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

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6FA',
    marginBottom: 28,
  },

  headerBox: {
    alignItems: 'center',
    marginBottom: 34,
  },

  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: MAIN_LIGHT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#151515',
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 21,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E4E7EE',
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#111111',
    backgroundColor: '#FAFBFF',
  },

  inputError: {
    borderColor: '#E24A4A',
    backgroundColor: '#FFF8F8',
  },

  errorText: {
    fontSize: 12,
    color: '#E24A4A',
    marginTop: 8,
    lineHeight: 18,
    fontWeight: '600',
  },

  createButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },

  createButtonDisabled: {
    opacity: 0.5,
  },

  createButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});