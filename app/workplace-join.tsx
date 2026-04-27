import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WorkplaceJoinScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>사업장 선택</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#BDBDBD" />
          <TextInput
            style={styles.searchInput}
            placeholder="사업장 검색"
            placeholderTextColor="#BDBDBD"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity
          style={[styles.doneBtn, !search.trim() && { backgroundColor: '#BDBDBD' }]}
          disabled={!search.trim()}
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
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, height: 52, paddingHorizontal: 16, marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#111' },
  doneBtn: { backgroundColor: '#2140DC', height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});