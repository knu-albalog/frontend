import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

export default function WorkplaceCreateScreen() {
  const router = useRouter();
  const [workplaceName, setWorkplaceName] = useState('');

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
          style={[styles.doneBtn, !workplaceName.trim() && { backgroundColor: '#BDBDBD' }]}
          disabled={!workplaceName.trim()}
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.doneBtnText}>완료</Text>
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