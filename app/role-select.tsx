import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RoleSelectScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<'owner' | 'worker' | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원님은 어떤 분인가요?</Text>
      <Text style={styles.subtitle}>회원님의 주 역할을 선택해주세요</Text>

      <View style={styles.cardRow}>
        <TouchableOpacity
          style={[styles.card, selected === 'owner' && styles.cardSelected]}
          onPress={() => setSelected('owner')}
          activeOpacity={0.8}
        >
          <Ionicons name="briefcase-outline" size={32} color={selected === 'owner' ? '#2140DC' : '#888'} />
          <Text style={[styles.cardTitle, selected === 'owner' && styles.cardTitleSelected]}>사장님</Text>
          <Text style={styles.cardDesc}>가게를 운영하고{'\n'}직원들을 관리해요</Text>
          <View style={[styles.radio, selected === 'owner' && styles.radioSelected]}>
            {selected === 'owner' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selected === 'worker' && styles.cardSelected]}
          onPress={() => setSelected('worker')}
          activeOpacity={0.8}
        >
          <Ionicons name="person-outline" size={32} color={selected === 'worker' ? '#2140DC' : '#888'} />
          <Text style={[styles.cardTitle, selected === 'worker' && styles.cardTitleSelected]}>알바생</Text>
          <Text style={styles.cardDesc}>아르바이트 일정을{'\n'}관리해요</Text>
          <View style={[styles.radio, selected === 'worker' && styles.radioSelected]}>
            {selected === 'worker' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, !selected && { backgroundColor: '#BDBDBD' }]}
        disabled={!selected}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/signup', params: { role: selected } })}
      >
        <Text style={styles.nextBtnText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 40 },
  cardRow: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  card: { flex: 1, borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, padding: 20, alignItems: 'center', gap: 8 },
  cardSelected: { borderColor: '#2140DC', backgroundColor: '#F0F4FF' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#888' },
  cardTitleSelected: { color: '#2140DC' },
  cardDesc: { fontSize: 12, color: '#AAAAAA', textAlign: 'center', lineHeight: 18 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#BDBDBD', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  radioSelected: { borderColor: '#2140DC' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2140DC' },
  nextBtn: { width: '100%', height: 52, backgroundColor: '#2140DC', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});