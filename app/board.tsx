import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function BoardScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ marginTop: 50, color: 'blue' }}> 뒤로가기</Text>
      </TouchableOpacity>
      <Text style={styles.title}>게시판 화면</Text>
      <Text>여기에 게시판 목록을 구현하면 됩니다!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 20 }
})