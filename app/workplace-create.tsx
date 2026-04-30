import React, { useState } from 'react';
import { 
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, 
  TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiRequest } from '../utils/api';

export default function WorkplaceCreateScreen() {
  const router = useRouter();
  const [workplaceName, setWorkplaceName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!workplaceName.trim()) return;

    setLoading(true);
    try {
      const result = await apiRequest('/workplace/create', {
        method: 'POST',
        body: JSON.stringify({
          name: workplaceName.trim(),
        }),
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
      Alert.alert('사업장 생성 실패', error.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>사업장 생성</Text>

        <TextInput
          style={styles.input}
          placeholder="사업장명"
          placeholderTextColor="#BDBDBD"
          value={workplaceName}
          onChangeText={setWorkplaceName}
        />

        <TouchableOpacity
          style={[styles.doneBtn, (!workplaceName.trim() || loading) && { backgroundColor: '#BDBDBD' }]}
          disabled={!workplaceName.trim() || loading}
          activeOpacity={0.8}
          onPress={handleCreate}
        >
          {loading
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
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, height: 52, paddingHorizontal: 16, fontSize: 15, color: '#111', marginBottom: 16 },
  doneBtn: { backgroundColor: '#2140DC', height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});