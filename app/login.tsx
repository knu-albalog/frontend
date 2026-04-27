import React, { useState } from 'react';
import { SafeAreaView, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role as string; // role-select에서 넘어온 role

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValid = email && password;

  const handleLogin = () => {
    // role에 따라 다른 화면으로 이동
    if (role === 'owner') {
      router.replace('/workplace-create');
    } else {
      router.replace('/workplace-join');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>로그인</Text>

        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor="#BDBDBD"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="#BDBDBD"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginBtn, !isValid && { backgroundColor: '#BDBDBD' }]}
          disabled={!isValid}
          activeOpacity={0.8}
          onPress={handleLogin}
        >
          <Text style={styles.loginBtnText}>로그인</Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>아직 계정이 없으신가요?</Text>
        <TouchableOpacity onPress={() => router.push('/role-select')}>
          <Text style={styles.signupLink}>회원가입</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, height: 52, paddingHorizontal: 16, fontSize: 15, color: '#111', marginBottom: 12 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 12, color: '#888' },
  loginBtn: { backgroundColor: '#2140DC', height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  bottomText: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 8 },
  signupLink: { color: '#2140DC', fontWeight: 'bold', textAlign: 'center', fontSize: 14 },
});