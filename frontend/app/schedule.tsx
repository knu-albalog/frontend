import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ScheduleScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backButton}>← 메인으로 돌아가기</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>스케줄표 화면</Text>
      <Text style={styles.subtitle}>알바생들의 근무 일정을 달력 형태로 확인할 수 있습니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  backButton: { marginTop: 50, color: '#2F4AFF', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 30, marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#555' }
});