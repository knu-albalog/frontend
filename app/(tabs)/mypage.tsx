import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const [profileImage, setProfileImage] = useState(
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200'
  );
  const [nickname, setNickname] = useState('워클리');
  const [role, setRole] = useState<'사장님' | '파트타이머'>('파트타이머');
  const [email] = useState('workly@example.com');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const [tempNickname, setTempNickname] = useState(nickname);
  const [tempImage, setTempImage] = useState(profileImage);
  const [tempRole, setTempRole] = useState(role);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const openProfileEditModal = () => {
    setTempNickname(nickname);
    setTempImage(profileImage);
    setEditModalVisible(true);
  };

  const saveProfile = () => {
    if (!tempNickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }

    setNickname(tempNickname.trim());
    setProfileImage(tempImage.trim() || profileImage);
    setEditModalVisible(false);
    Alert.alert('완료', '프로필이 수정되었습니다.');
  };

  const openInfoModal = () => {
    setTempRole(role);
    setInfoModalVisible(true);
  };

  const saveInfo = () => {
    setRole(tempRole);
    setInfoModalVisible(false);
    Alert.alert('완료', '회원 정보가 수정되었습니다.');
  };

  const handleWithdraw = () => {
    Alert.alert(
      '회원탈퇴',
      '정말 탈퇴하시겠어요?\n이 동작은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: () => {
            setInfoModalVisible(false);
            Alert.alert('안내', '회원탈퇴 기능은 추후 서버 연동이 필요합니다.');
          },
        },
      ]
    );
  };

  const changePassword = () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('알림', '비밀번호를 모두 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalVisible(false);
    Alert.alert('완료', '비밀번호가 변경되었습니다.');
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          Alert.alert('안내', '로그아웃 되었습니다.');
          // 실제 로그인 화면이 있으면 아래처럼 이동해서 쓰면 됨
          // router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>마이페이지</Text>

        <Text style={styles.sectionLabel}>프로필 화면</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <Image source={{ uri: profileImage }} style={styles.avatar} />
            <View>
              <Text style={styles.profileName}>{nickname}</Text>
              <Text style={styles.profileRole}>{role}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={openProfileEditModal}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>정보</Text>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.8}
            onPress={openInfoModal}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={18} color="#7B8CFF" />
              </View>
              <View>
                <Text style={styles.menuTitle}>나의 정보</Text>
                <Text style={styles.menuDescription}>
                  이메일 정보, 직업 전환, 회원탈퇴를 수정할 수 있습니다
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B7B7B7" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.8}
            onPress={() => setPasswordModalVisible(true)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#7B8CFF" />
              </View>
              <View>
                <Text style={styles.menuTitle}>비밀번호 변경</Text>
                <Text style={styles.menuDescription}>
                  비밀번호 변경 및 변경 확인을 진행합니다
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B7B7B7" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="log-out-outline" size={18} color="#7B8CFF" />
              </View>
              <View>
                <Text style={styles.menuTitle}>로그아웃</Text>
                <Text style={styles.menuDescription}>현재 계정에서 로그아웃합니다</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B7B7B7" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 프로필 편집 모달 */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>프로필 편집</Text>

            <Text style={styles.inputLabel}>프로필 이미지 URL</Text>
            <TextInput
              style={styles.input}
              placeholder="이미지 주소를 입력하세요"
              placeholderTextColor="#A9A9A9"
              value={tempImage}
              onChangeText={setTempImage}
            />

            <Text style={styles.inputLabel}>닉네임</Text>
            <TextInput
              style={styles.input}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor="#A9A9A9"
              value={tempNickname}
              onChangeText={setTempNickname}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={saveProfile}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 나의 정보 모달 */}
      <Modal
        visible={infoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>나의 정보</Text>

            <Text style={styles.infoLabel}>이메일</Text>
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{email}</Text>
            </View>

            <Text style={[styles.infoLabel, { marginTop: 18 }]}>직업 전환</Text>
            <View style={styles.roleRow}>
              <Text style={styles.roleText}>
                {tempRole === '사장님' ? '사장님' : '파트타이머'}
              </Text>
              <Switch
                value={tempRole === '사장님'}
                onValueChange={(value) =>
                  setTempRole(value ? '사장님' : '파트타이머')
                }
                trackColor={{ false: '#D9DCE7', true: '#A9B6FF' }}
                thumbColor={tempRole === '사장님' ? '#2F4AFF' : '#FFFFFF'}
              />
            </View>

            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={handleWithdraw}
              activeOpacity={0.8}
            >
              <Text style={styles.withdrawText}>회원탈퇴</Text>
            </TouchableOpacity>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setInfoModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={saveInfo}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 비밀번호 변경 모달 */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>비밀번호 변경</Text>

            <Text style={styles.inputLabel}>비밀번호 변경</Text>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호를 입력하세요"
              placeholderTextColor="#A9A9A9"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.inputLabel}>비밀번호 변경확인</Text>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호를 다시 입력하세요"
              placeholderTextColor="#A9A9A9"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPasswordModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={changePassword}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>변경</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#171717',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C7C7C7',
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: '#2F4AFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    shadowColor: '#1D2F9C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAEAEA',
    marginRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    color: '#C9D3FF',
    fontWeight: '500',
  },
  editButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    overflow: 'hidden',
  },
  menuRow: {
    minHeight: 82,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F4F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#242424',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 11,
    color: '#B8B8B8',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F2F6',
    marginLeft: 62,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E4E7EE',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111111',
    backgroundColor: '#FAFBFF',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F3F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2F4AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555555',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 8,
  },
  readonlyBox: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F6F7FB',
    borderWidth: 1,
    borderColor: '#E6E9F2',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  readonlyText: {
    fontSize: 14,
    color: '#333333',
  },
  roleRow: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F6F7FB',
    borderWidth: 1,
    borderColor: '#E6E9F2',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  withdrawButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#FFF2F2',
  },
  withdrawText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E24A4A',
  },
});