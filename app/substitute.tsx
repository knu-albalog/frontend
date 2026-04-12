import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function SubstituteScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backButton}>← 메인으로 돌아가기</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>대타신청 화면</Text>
      <Text style={styles.subtitle}>대타를 구하거나 지원할 수 있는 페이지입니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  backButton: { marginTop: 50, color: '#2F4AFF', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 30, marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#555' }
});