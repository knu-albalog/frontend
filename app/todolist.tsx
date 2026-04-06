import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TodoScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ marginTop: 50, color: '#2F4AFF', fontSize: 16 }}>← 메인으로 돌아가기</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>투두리스트 화면</Text>
      <Text>여기에 할 일 목록 기능이 추가될 예정입니다!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 30, marginBottom: 10 }
});