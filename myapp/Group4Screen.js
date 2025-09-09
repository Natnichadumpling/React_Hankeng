import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'react-native';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ImageBackground, Alert, Modal, TextInput, ActivityIndicator
} from 'react-native';

const API_URL =
  'https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_R8PxpJWiO0qlvgzzhE7UKsiO2Pgbdw1ZQ53KK9Vl&currencies=THB&base_currency=USD';

const Group4Screen = ({ navigation, route }) => {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const [selectedImages, setSelectedImages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(''); // 'THB' | 'USD'
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(null);

  const [rateTHB, setRateTHB] = useState(null);  // จำนวนบาทต่อ 1 USD
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [rateError, setRateError] = useState(null);

    // subscribe realtime chat
    useEffect(() => {
      if (!groupId) return;
      const channel = supabase
        .channel('group_messages_realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        }, payload => {
          supabase
            .from('group_messages')
            .select('*')
            .eq('group_id', groupId)
            .order('created_at', { ascending: true })
            .then(({ data, error }) => {
              if (!error && data) {
                setChatMessages(data.map(msg => ({
                  type: msg.type,
                  uri: msg.content,
                  userId: msg.user_id,
                  createdAt: msg.created_at,
                })));
              }
            });
        });
      channel.subscribe();
      return () => {
        channel.unsubscribe();
      };
    }, [groupId]);
    // ฟังก์ชันอัปโหลดรูปไป Supabase Storage
    const uploadImageToSupabase = async (uri) => {
      try {
        console.log('เริ่มอัปโหลดรูป:', uri);
        const response = await fetch(uri);
        const blob = await response.blob();
        const fileExt = uri.split('.').pop();
        const fileName = `chat_${Date.now()}.${fileExt}`;
        const filePath = `chat_images/${fileName}`;
        const { data, error } = await supabase.storage
          .from('chat-images')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: false,
          });
        if (error) {
          console.log('อัปโหลดรูปผิดพลาด:', error.message);
          throw error;
        }
        const { publicUrl } = supabase.storage
          .from('chat-images')
          .getPublicUrl(filePath).data;
        console.log('publicUrl ที่ได้:', publicUrl);
        Alert.alert('อัปโหลดสำเร็จ', publicUrl);
        return publicUrl;
      } catch (err) {
        console.log('เกิดข้อผิดพลาดระหว่างอัปโหลด:', err);
        Alert.alert('อัปโหลดรูปไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาด');
        return null;
      }
    };
  const { groupName: gNameFromNav, transferKey, from, to, amount: amountParam } = route?.params || {};
  const groupName = gNameFromNav || 'กลุ่มของเรา';
  const groupId = route?.params?.groupId;
  const userId = route?.params?.userId;

  const isSendDisabled = selectedImages.length === 0;
  const isSendTextDisabled = !messageText.trim();

  // โหลดข้อความแชทจากฐานข้อมูล Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      if (!groupId) return;
      setIsLoadingMessages(true);
      setMessagesError(null);
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
      if (error) {
        setMessagesError(error.message);
      } else if (data) {
        setChatMessages(data.map(msg => ({
          type: msg.type,
          uri: msg.content,
          userId: msg.user_id,
          createdAt: msg.created_at,
        })));
      }
      setIsLoadingMessages(false);
    };
    fetchMessages();
  }, [groupId]);

  const fetchRateIfNeeded = async () => {
    if (rateTHB !== null || isLoadingRate) return;
    try {
      setIsLoadingRate(true);
      setRateError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const thb = json && json.data && json.data.THB;
      if (typeof thb !== 'number') throw new Error('Invalid response: THB missing');
      setRateTHB(thb);
    } catch (e) {
      setRateError(e?.message || 'โหลดอัตราแลกเปลี่ยนไม่สำเร็จ');
    } finally {
      setIsLoadingRate(false);
    }
  };

  const handleSendMessage = async () => {
    if ((selectedImages.length > 0 || messageText.trim()) && groupId && userId) {
      // ส่งข้อความ
      if (messageText.trim()) {
        const { error } = await supabase
          .from('group_messages')
          .insert([{
            group_id: groupId,
            user_id: userId,
            type: 'text',
            content: messageText.trim(),
          }]);
        if (error) {
          Alert.alert('เกิดข้อผิดพลาด', error.message);
          return;
        }
        setMessageText('');
      }
      // ส่งรูปภาพ (อัปโหลดไป storage ก่อน)
      if (selectedImages.length > 0) {
        for (const uri of selectedImages) {
          const publicUrl = await uploadImageToSupabase(uri);
          console.log('publicUrl สำหรับบันทึก:', publicUrl);
          if (!publicUrl) {
            Alert.alert('ไม่ได้รับ public URL จากการอัปโหลดรูป');
            continue;
          }
          const { data, error } = await supabase
            .from('group_messages')
            .insert([{
              group_id: groupId,
              user_id: userId,
              type: 'image',
              content: publicUrl,
            }]);
          if (error) {
            console.log('บันทึก URL ผิดพลาด:', error.message);
            Alert.alert('เกิดข้อผิดพลาด', error.message);
            return;
          } else {
            console.log('บันทึกลงฐานข้อมูลสำเร็จ:', data);
            Alert.alert('บันทึก URL สำเร็จ', publicUrl);
          }
        }
        setSelectedImages([]);
      }
      // โหลดข้อความใหม่หลังส่ง
      const { data, error: fetchError } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
      if (!fetchError && data) {
        setChatMessages(data.map(msg => ({
          type: msg.type,
          uri: msg.content,
          userId: msg.user_id,
          createdAt: msg.created_at,
        })));
      }
    }
  };

  const goBack = () => navigation.goBack();

  // ฟังก์ชันเลือกไฟล์ภาพ
  const handleImageSelect = async () => {
    setShowImagePicker(false);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.assets && res.assets.length > 0 && res.assets[0].uri) {
        setSelectedImages(prev => [...prev, res.assets[0].uri]);
        Alert.alert('เลือกรูปภาพ', 'เลือกรูปภาพแล้ว');
      } else {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกไฟล์ภาพได้');
      }
    } catch (err) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกไฟล์ภาพได้');
    }
  };

  const openCurrencyTool = async () => {
    setShowToolsModal(false);
    setShowCurrencyModal(true);
    await fetchRateIfNeeded();
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency); // 'THB' หรือ 'USD'
    setConvertedAmount(null); // Reset the conversion result

    // When selecting THB, set amount to the transfer info amount in THB
    if (currency === 'THB' && from && to && amountParam) {
      setAmount(Number(amountParam || 0).toFixed(2)); // Set the amount in THB format
    }

    // When selecting USD, convert the amount from THB to USD if THB rate is available
    if (currency === 'USD' && rateTHB) {
      const thbAmount = Number(amountParam || 0); // Assuming amountParam is in THB
      const usdAmount = thbAmount / rateTHB; // Convert THB to USD
      setAmount(usdAmount.toFixed(2)); // Set the amount in USD format
    }
  };

  const handleConvertCurrency = () => {
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกจำนวนเงินที่ถูกต้อง');
      return;
    }
    if (!rateTHB) {
      Alert.alert('ข้อผิดพลาด', 'ยังไม่สามารถโหลดอัตราแลกเปลี่ยนได้');
      return;
    }

    let result = null;
    if (selectedCurrency === 'THB') {
      // THB -> USD
      result = n / rateTHB;
    } else if (selectedCurrency === 'USD') {
      // USD -> THB
      result = n * rateTHB;
    }
    setConvertedAmount(result);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  const rateBanner = useMemo(() => {
    if (isLoadingRate) return 'กำลังโหลดอัตราแลกเปลี่ยน...';
    if (rateError) return `โหลดอัตราแลกเปลี่ยนไม่สำเร็จ: ${rateError}`;
    if (rateTHB) return `อัตราล่าสุด: 1 USD ≈ ${rateTHB.toFixed(4)} THB`;
    return 'ยังไม่มีอัตราแลกเปลี่ยน';
  }, [isLoadingRate, rateError, rateTHB]);

  return (
    <ImageBackground
      source={require('./assets/images/p1.png')}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{groupName}</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Group2Screen', { groupName })} // Pass groupName to Group2Screen
          >
            <Text style={styles.menuText}>เชิญเพื่อน</Text>
          </TouchableOpacity>
        </View>

        {/* Transfer info */}
        {(from || to) && (
          <View style={styles.transferInfo}>
            <Text style={styles.transferInfoText}>
              รายการ: {from} → {to} จำนวน ฿{Number(amountParam || 0).toFixed(2)}
            </Text>
          </View>
        )}

        {/* Messages / Empty */}
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {isLoadingMessages ? (
            <ActivityIndicator size="large" color="#4a90e2" style={{ marginTop: 40 }} />
          ) : messagesError ? (
            <View style={styles.emptyChatContainer}>
              <Text style={styles.emptyChatText}>เกิดข้อผิดพลาด: {messagesError}</Text>
            </View>
          ) : chatMessages.length === 0 && selectedImages.length === 0 ? (
            <View style={styles.emptyChatContainer}>
              <Text style={styles.emptyChatText}>แนบหลักฐานการชำระเงิน</Text>
              <Text style={styles.emptyChatSubText}>กดไอคอนรูปภาพด้านล่างเพื่อเลือกรูป หรือพิมพ์ข้อความ</Text>
            </View>
          ) : (
            <>
              {/* แสดงข้อความแชท */}
              {chatMessages.map((msg, idx) => (
                <View key={idx} style={styles.chatBubble}>
                  {msg.type === 'image' ? (
                    <Image source={{ uri: msg.uri }} style={styles.chatImage} />
                  ) : (
                    <Text style={styles.chatText}>{msg.uri}</Text>
                  )}
                </View>
              ))}
            </>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowImagePicker(true)}>
            <Text style={styles.iconText}>🖼️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => setShowToolsModal(true)}>
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>

          {/* ช่องกรอกข้อความ */}
          <TextInput
            style={styles.textInput}
            placeholder="พิมพ์ข้อความ..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendButton, isSendDisabled && isSendTextDisabled && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={isSendDisabled && isSendTextDisabled}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

        {/* Image Picker Modal */}
        <Modal visible={showImagePicker} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>เพิ่มไฟล์ภาพ</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 10, backgroundColor: '#fafafa', minWidth: 160, justifyContent: 'center' }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#e0e0e0', padding: 15, borderRadius: 50 }}
                  onPress={handleImageSelect}
                >
                  <Text style={{ fontSize: 30, color: '#333' }}>📷</Text>
                </TouchableOpacity>
                {selectedImages.length > 0 && (
                  <Image source={{ uri: selectedImages[selectedImages.length - 1] }} style={{ width: 80, height: 80, borderRadius: 10, marginLeft: 15, backgroundColor: '#eee' }} />
                )}
              </View>
              <Text style={styles.cameraText}>เลือกไฟล์ภาพแล้วกดส่ง</Text>
              <TouchableOpacity
                style={[styles.sendButton, selectedImages.length === 0 && styles.sendButtonDisabled, { marginTop: 10 }]}
                onPress={() => {
                  setShowImagePicker(false);
                  if (selectedImages.length > 0) {
                    // ส่งรูปทันที
                    handleSendMessage();
                  }
                }}
                disabled={selectedImages.length === 0}
              >
                <Text style={styles.sendIcon}>➤ ส่ง</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowImagePicker(false)}>
                <Text style={styles.modalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Tools Modal */}
        <Modal visible={showToolsModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>เครื่องมือ</Text>

              <TouchableOpacity style={styles.modalOption} onPress={openCurrencyTool}>
                <Text style={styles.modalOptionText}>💱 แปลงสกุลเงิน</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowToolsModal(false)}>
                <Text style={styles.modalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Currency Tool Modal */}
        <Modal visible={showCurrencyModal} transparent animationType="slide" onRequestClose={() => setShowCurrencyModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>แปลงสกุลเงิน</Text>

              <View style={{ marginBottom: 10, alignItems: 'center' }}>
                {isLoadingRate ? <ActivityIndicator /> : <Text style={{ color: rateError ? '#d32f2f' : '#333' }}>{rateBanner}</Text>}
              </View>

              <Text style={{ marginBottom: 6, color: '#333' }}>จำนวนเงินที่ต้องจ่าย(สกุลเงิน):</Text>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <TouchableOpacity
                  style={[styles.chip, selectedCurrency === 'THB' && styles.chipActive]}
                  onPress={() => handleCurrencySelect('THB')}
                >
                  <Text style={[styles.chipText, selectedCurrency === 'THB' && styles.chipTextActive]}>THB</Text>
                </TouchableOpacity>
                <View style={{ width: 10 }} />
                <TouchableOpacity
                  style={[styles.chip, selectedCurrency === 'USD' && styles.chipActive]}
                  onPress={() => handleCurrencySelect('USD')}
                >
                  <Text style={[styles.chipText, selectedCurrency === 'USD' && styles.chipTextActive]}>USD</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.currencyInput}
                keyboardType="numeric"
                value={amount}
                onChangeText={t => { setAmount(t); setConvertedAmount(null); }}
                editable={!isLoadingRate && !rateError}
              />

              {convertedAmount !== null && selectedCurrency ? (
                <Text style={styles.convertResult}>
                  ผลลัพธ์: {selectedCurrency === 'THB'
                    ? `${convertedAmount.toFixed(2)} USD`
                    : `${convertedAmount.toFixed(2)} THB`}
                </Text>
              ) : null}

              <TouchableOpacity style={[styles.modalCancelButton, { marginTop: 16 }]} onPress={() => setShowCurrencyModal(false)}>
                <Text style={styles.modalCancelText}>ปิด</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 8,
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#333',
  },
  chatText: {
    fontSize: 15,
    color: '#333',
    paddingVertical: 2,
  },
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.9)', borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 5 },
  backIcon: { fontSize: 24, color: '#333' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  menuButton: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#e8f4fd', borderRadius: 15 },
  menuText: { fontSize: 14, color: '#4a90e2' },

  transferInfo: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#fff8e1' },
  transferInfoText: { color: '#6d4c41', fontSize: 13 },

  messagesContainer: { flex: 1, paddingHorizontal: 15, paddingVertical: 20 },
  emptyChatContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyChatText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginBottom: 10 },
  emptyChatSubText: { fontSize: 14, color: '#999', textAlign: 'center' },

  selectedImagesContainer: { marginTop: 10, padding: 15, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10 },
  selectedImagesTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  imagePreview: { backgroundColor: '#b3e5fc', padding: 10, borderRadius: 8, marginRight: 10, position: 'relative', minWidth: 100, alignItems: 'center' },
  imagePreviewText: { fontSize: 14, color: '#333' },
  removeImageButton: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ff4444', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  removeImageText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#e0e0e0',
  },
  iconButton: { padding: 8, marginRight: 8 },
  iconText: { fontSize: 22, color: '#666' },
  sendButton: { backgroundColor: '#4a90e2', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.5 },
  sendIcon: { fontSize: 18, color: '#fff' },

  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingVertical: 30 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalOptionText: { fontSize: 16, color: '#333' },
  modalCancelButton: { paddingVertical: 15, marginTop: 10, backgroundColor: '#f8f8f8', borderRadius: 10, alignItems: 'center' },
  modalCancelText: { fontSize: 16, color: '#666', fontWeight: 'bold' },

  currencyInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, borderRadius: 5 },
  convertResult: { fontSize: 16, color: '#333', marginTop: 10 },

  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
  chipActive: { backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
  chipText: { color: '#333', fontSize: 14 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  cameraText: { fontSize: 14, color: '#333', marginTop: 10, textAlign: 'center' },
  chatBubble: { backgroundColor: '#e8f4fd', borderRadius: 12, padding: 8, marginBottom: 10, alignSelf: 'flex-start', maxWidth: '80%' },
  chatImage: { width: 120, height: 120, borderRadius: 10 },
});

export default Group4Screen;
