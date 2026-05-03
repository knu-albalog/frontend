import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiRequest } from '../../utils/api';
import { deleteAccessToken } from '../../utils/tokenStorage';

const MAIN_COLOR = '#2140DC';
const MAIN_LIGHT_COLOR = '#EEF1FF';
const MAIN_SOFT_COLOR = '#AEBBFF';

type RoleType = '사장님' | '파트타이머';

const avatarColors = [MAIN_COLOR, '#FF8A00', '#27AE60', '#9B51E0', '#EB5757'];

export default function MyPageScreen() {
  const router = useRouter();

  const [nickname, setNickname] = useState('사용자');
  const [role, setRole] = useState<RoleType>('파트타이머');
  const [email, setEmail] = useState('');
  const [avatarColor, setAvatarColor] = useState(MAIN_COLOR);

  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const [tempNickname, setTempNickname] = useState('');
  const [tempAvatarColor, setTempAvatarColor] = useState(MAIN_COLOR);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getRoleText = (value: any): RoleType => {
    console.log('role 값 확인:', value);

    if (
      value === 1 ||
      value === true ||
      value === '1' ||
      value === 'OWNER' ||
      value === 'owner' ||
      value === 'ADMIN' ||
      value === 'admin' ||
      value === 'BOSS' ||
      value === 'boss' ||
      value === '사장님'
    ) {
      return '사장님';
    }

    return '파트타이머';
  };

  const getProfileIconName = () => {
    return role === '사장님' ? 'briefcase-outline' : 'happy-outline';
  };

  const loadSavedAvatarColor = async () => {
    try {
      const savedColor = await AsyncStorage.getItem('avatarColor');

      if (savedColor) {
        setAvatarColor(savedColor);
      }
    } catch (error) {
      console.log('프로필 색상 불러오기 실패:', error);
    }
  };

  const loadProfile = async () => {
    setLoading(true);

    try {
      const result = await apiRequest('/user/profile');

      setNickname(result?.name ?? result?.nickname ?? '사용자');
      setEmail(result?.email ?? '');
      setRole(
        getRoleText(
          result?.role ??
            result?.userRole ??
            result?.authority ??
            result?.isAdmin ??
            result?.admin
        )
      );

      if (result?.avatarColor) {
        setAvatarColor(result.avatarColor);
      } else {
        await loadSavedAvatarColor();
      }
    } catch (error: any) {
      console.log('프로필 조회 실패:', error.message);
      Alert.alert('오류', '프로필 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const openProfileEditModal = () => {
    setTempNickname(nickname);
    setTempAvatarColor(avatarColor);
    setEditModalVisible(true);
  };

  const saveProfile = async () => {
    if (!tempNickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }

    try {
      await AsyncStorage.setItem('avatarColor', tempAvatarColor);

      setNickname(tempNickname.trim());
      setAvatarColor(tempAvatarColor);
      setEditModalVisible(false);

      Alert.alert('완료', '프로필이 수정되었습니다.');
    } catch (error: any) {
      console.log('프로필 수정 실패:', error.message);
      Alert.alert('수정 실패', error.message || '다시 시도해주세요.');
    }
  };

  const changePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('알림', '비밀번호를 모두 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await apiRequest('/user/password', {
        method: 'PATCH',
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      setNewPassword('');
      setConfirmPassword('');
      setPasswordModalVisible(false);

      Alert.alert('완료', '비밀번호가 변경되었습니다.');
    } catch (error: any) {
      console.log('비밀번호 변경 실패:', error.message);
      Alert.alert('변경 실패', error.message || '다시 시도해주세요.');
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await deleteAccessToken();
          Alert.alert('안내', '로그아웃 되었습니다.');
          router.replace('/role-select');
        },
      },
    ]);
  };

  const handleWithdraw = () => {
    Alert.alert('회원탈퇴', '정말 탈퇴하시겠어요?\n이 동작은 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴하기',
        style: 'destructive',
        onPress: () => {
          setInfoModalVisible(false);
          Alert.alert('안내', '회원탈퇴 API는 Swagger에 없어서 추후 연동이 필요합니다.');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MAIN_COLOR} />
          <Text style={styles.loadingText}>프로필을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <View style={[styles.avatarIcon, { backgroundColor: avatarColor }]}>
              <Ionicons name={getProfileIconName() as any} size={28} color="#FFFFFF" />
            </View>

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
            onPress={() => setInfoModalVisible(true)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={18} color={MAIN_COLOR} />
              </View>

              <View>
                <Text style={styles.menuTitle}>나의 정보</Text>
                <Text style={styles.menuDescription}>
                  이메일, 역할, 회원탈퇴 정보를 확인할 수 있습니다
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
                <Ionicons name="shield-checkmark-outline" size={18} color={MAIN_COLOR} />
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

          <TouchableOpacity style={styles.menuRow} activeOpacity={0.8} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="log-out-outline" size={18} color={MAIN_COLOR} />
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

            <View style={styles.avatarPreviewRow}>
              <View style={[styles.avatarPreview, { backgroundColor: tempAvatarColor }]}>
                <Ionicons name={getProfileIconName() as any} size={34} color="#FFFFFF" />
              </View>

              <Text style={styles.avatarHelpText}>
                {role === '사장님' ? '사장님 픽토그램' : '알바생 픽토그램'}
              </Text>
            </View>

            <Text style={styles.inputLabel}>프로필 색상</Text>

            <View style={styles.colorRow}>
              {avatarColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    tempAvatarColor === color && styles.colorCircleSelected,
                  ]}
                  onPress={() => setTempAvatarColor(color)}
                  activeOpacity={0.8}
                />
              ))}
            </View>

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

              <TouchableOpacity style={styles.confirmButton} onPress={saveProfile} activeOpacity={0.8}>
                <Text style={styles.confirmButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
              <Text style={styles.readonlyText}>{email || '이메일 정보 없음'}</Text>
            </View>

            <Text style={[styles.infoLabel, { marginTop: 18 }]}>역할</Text>

            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{role}</Text>
            </View>

            <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw} activeOpacity={0.8}>
              <Text style={styles.withdrawText}>회원탈퇴</Text>
            </TouchableOpacity>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setInfoModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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

            <Text style={styles.inputLabel}>새 비밀번호</Text>

            <TextInput
              style={styles.input}
              placeholder="새 비밀번호를 입력하세요"
              placeholderTextColor="#A9A9A9"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.inputLabel}>새 비밀번호 확인</Text>

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

              <TouchableOpacity style={styles.confirmButton} onPress={changePassword} activeOpacity={0.8}>
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888888',
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
    backgroundColor: MAIN_COLOR,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    shadowColor: MAIN_COLOR,
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

  avatarIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },

  profileRole: {
    fontSize: 12,
    color: '#DDE3FF',
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
    backgroundColor: MAIN_LIGHT_COLOR,
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

  avatarPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  avatarPreview: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarHelpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },

  colorRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  colorCircleSelected: {
    borderColor: '#111111',
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
    backgroundColor: MAIN_COLOR,
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