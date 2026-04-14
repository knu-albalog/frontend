import React, { useState, useMemo } from 'react';
import { 
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, Modal, Keyboard, Pressable 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type CategoryType = '공지' | '일반' | '매뉴얼';
type BoardType = {
  id: string;
  category: CategoryType;
  title: string;
  isNew: boolean;
};

export default function BoardScreen() {
  const router = useRouter();
  
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('공지');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const [boards, setBoards] = useState<BoardType[]>([
    { id: '1', category: '공지', title: '메뉴 안내 게시판', isNew: true },
    { id: '2', category: '공지', title: '가격 인상/변경 안내 게시판', isNew: false },
    { id: '3', category: '일반', title: '궁금한 점 게시판', isNew: false },
  ]);

  const filteredBoards = useMemo(() => {
    return boards.filter(board => 
      board.title.includes(searchText) || board.category.includes(searchText)
    );
  }, [boards, searchText]);

  const handleCreateBoard = () => {
    if (newBoardTitle.trim() === '') return; 

    const newBoard: BoardType = {
      id: Date.now().toString(),
      category: selectedCategory,
      title: newBoardTitle.trim(),
      isNew: true, 
    };

    setBoards([newBoard, ...boards]);
    
    setIsModalOpen(false);
    setNewBoardTitle('');
    setIsDropdownOpen(false);
  };

  const getBadgeStyle = (category: CategoryType) => {
    switch (category) {
      case '공지': return { bg: '#F0F4FF', text: '#2140DC' };
      case '매뉴얼': return { bg: '#FFF4E5', text: '#FF8C00' };
      case '일반': return { bg: '#F5F5F5', text: '#333333' };
      default: return { bg: '#F5F5F5', text: '#333333' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.header}>
          {/* 이전 화면으로 돌아가는 백버튼 */}
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>게시판</Text>
          <View style={{ width: 26 }} /> 
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#BDBDBD" />
            <TextInput
              style={styles.searchInput}
              placeholder="검색"
              placeholderTextColor="#BDBDBD"
              value={searchText}
              onChangeText={setSearchText}
              autoCorrect={false}
            />
          </View>

          {filteredBoards.map((board) => {
            const badgeColor = getBadgeStyle(board.category);
            return (
              <TouchableOpacity 
                key={board.id} 
                style={styles.boardCard} 
                activeOpacity={0.7}
                // 💡 여기서 post-list 화면으로 이동!
                onPress={() => {
                  router.push({
                    pathname: '/post-list', 
                    params: { title: board.title, category: board.category }
                  });
                }}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.badge, { backgroundColor: badgeColor.bg }]}>
                    <Text style={[styles.badgeText, { color: badgeColor.text }]}>{board.category}</Text>
                  </View>
                  <Text style={styles.boardTitle}>{board.title}</Text>
                </View>
                {board.isNew && <Text style={styles.newTag}>new</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => setIsModalOpen(true)}>
        <Ionicons name="create-outline" size={24} color="#FFF" />
        <Text style={styles.fabText}>게시판 생성</Text>
      </TouchableOpacity>

      {/* 팝업 모달 영역 */}
      <Modal visible={isModalOpen} transparent={true} animationType="fade">
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => {
            Keyboard.dismiss();
            setIsDropdownOpen(false);
          }}
        >
          <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ width: 24 }} /> 
              <Text style={styles.modalTitle}>게시판 생성</Text>
              <TouchableOpacity onPress={() => { setIsModalOpen(false); setNewBoardTitle(''); setIsDropdownOpen(false); }}>
                <Ionicons name="close" size={24} color="#2140DC" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputBoxArea}>
                <TouchableOpacity 
                  style={styles.categorySelectBtn} 
                  activeOpacity={0.7}
                  onPress={() => {
                    Keyboard.dismiss(); 
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                >
                  <Text style={styles.categorySelectText}>{selectedCategory}</Text>
                  <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={14} color="#2140DC" />
                </TouchableOpacity>

                {isDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    {(['공지', '일반', '매뉴얼'] as CategoryType[]).map((item, index) => (
                      <TouchableOpacity 
                        key={item} 
                        style={[styles.dropdownItem, index === 2 && { borderBottomWidth: 0 }]}
                        onPress={() => {
                          setSelectedCategory(item);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TextInput
                  style={styles.modalTextInput}
                  placeholder="제목을 입력하세요"
                  placeholderTextColor="#A9A9A9"
                  value={newBoardTitle}
                  onChangeText={setNewBoardTitle}
                  maxLength={30} 
                />
              </View>

              <View style={styles.submitRow}>
                <TouchableOpacity 
                  style={[styles.submitBtn, newBoardTitle.trim() === '' && { backgroundColor: '#BDBDBD' }]} 
                  activeOpacity={0.8}
                  onPress={handleCreateBoard}
                  disabled={newBoardTitle.trim() === ''} 
                >
                  <Text style={styles.submitBtnText}>등록하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  scrollContent: { paddingBottom: 100, paddingTop: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 24 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
  boardCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 4, marginBottom: 12 },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  boardTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  newTag: { color: '#FF3B30', fontSize: 13, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 72, height: 72, borderRadius: 36, backgroundColor: '#2140DC', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  fabText: { color: '#FFF', fontSize: 10, fontWeight: '600', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', paddingHorizontal: 30 },
  modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E8EAFF', paddingVertical: 14, paddingHorizontal: 16 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  modalBody: { padding: 20 },
  inputBoxArea: { borderWidth: 1, borderColor: '#EFEFEF', borderRadius: 8, padding: 16, minHeight: 160, position: 'relative' },
  categorySelectBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, alignSelf: 'flex-start', marginBottom: 16 },
  categorySelectText: { fontSize: 12, fontWeight: '600', color: '#333', marginRight: 4 },
  dropdownMenu: { position: 'absolute', top: 48, left: 16, backgroundColor: '#FFFFFF', borderRadius: 8, width: 80, borderWidth: 1, borderColor: '#EFEFEF', zIndex: 10, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  dropdownItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', alignItems: 'center' },
  dropdownItemText: { fontSize: 13, color: '#333', fontWeight: '500' },
  modalTextInput: { fontSize: 15, color: '#111', paddingTop: 10 },
  submitRow: { alignItems: 'flex-end', marginTop: 16 },
  submitBtn: { backgroundColor: '#2140DC', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});