import React, { useState } from 'react';
import { SafeAreaView, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role as string;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');

  const isValid = email && password && passwordConfirm && name && password === passwordConfirm;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>회원가입</Text>

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
        <TextInput
          style={[styles.input, passwordConfirm && password !== passwordConfirm && styles.inputError]}
          placeholder="비밀번호 확인"
          placeholderTextColor="#BDBDBD"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />
        {passwordConfirm && password !== passwordConfirm && (
          <Text style={styles.errorText}>비밀번호가 일치하지 않습니다</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="이름 입력"
          placeholderTextColor="#BDBDBD"
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity
          style={[styles.signupBtn, !isValid && { backgroundColor: '#BDBDBD' }]}
          disabled={!isValid}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/login', params: { role: role } })}
        >
          <Text style={styles.signupBtnText}>회원가입</Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          이미 사용 중인 아이디 / 비밀번호가 기억나지 않습니다{' '}
          <Text style={styles.loginLink} onPress={() => router.push({ pathname: '/login', params: { role: role } })}>로그인</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, height: 52, paddingHorizontal: 16, fontSize: 15, color: '#111', marginBottom: 12 },
  inputError: { borderColor: '#FF3B30' },
  errorText: { color: '#FF3B30', fontSize: 12, marginBottom: 8, marginTop: -4 },
  signupBtn: { backgroundColor: '#2140DC', height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 24 },
  signupBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  bottomText: { fontSize: 12, color: '#888', textAlign: 'center', lineHeight: 20 },
  loginLink: { color: '#2140DC', fontWeight: 'bold' },
});