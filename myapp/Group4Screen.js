import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ImageBackground, Alert, Modal, TextInput
} from 'react-native';

const Group4Screen = ({ navigation, route }) => {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(''); // State สำหรับสกุลเงินที่เลือก
  const [amount, setAmount] = useState(''); // จำนวนเงินที่จะแปลง
  const [convertedAmount, setConvertedAmount] = useState(null); // ผลลัพธ์การแปลงสกุลเงิน

  // params จาก Group5Screen
  const { groupName: gNameFromNav, transferKey, from, to, amount: amountParam } = route?.params || {};
  const groupName = gNameFromNav || route?.params?.groupName || 'กลุ่มของเรา';

  const isSendDisabled = selectedImages.length === 0;

  const handleSendMessage = () => {
    if (selectedImages.length > 0) {
      // TODO: อัปโหลด/ส่งไป backend จริงตรงนี้
      console.log('Sending images:', { transferKey, from, to, amount, files: selectedImages });
      Alert.alert('ส่งรูปแล้ว', 'ระบบจะบันทึกหลักฐานตามรายการชำระนี้');
      setSelectedImages([]);
    }
  };

  const goBack = () => navigation.goBack();

  const handleImageSelect = (imageType) => {
    // TODO: เปลี่ยนเป็น URI จาก image picker จริง
    setShowImagePicker(false);
    setSelectedImages(prev => [...prev, imageType]);
    Alert.alert('เลือกรูปภาพ', `เลือก${imageType}แล้ว`);
  };

  const handleMenuOption = (option) => {
    if (option === 'แปลงสกุลเงิน') {
      setShowMenuOptions(true); // แสดง modal เลือกสกุลเงิน
    } else {
      Alert.alert('เลือกตัวเลือก', `เลือก${option}แล้ว`);
    }
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency); // เก็บสกุลเงินที่เลือก
    Alert.alert('เลือกสกุลเงิน', `คุณเลือกสกุลเงิน: ${currency}`);
    setShowMenuOptions(false); // ปิด modal หลังจากเลือก
  };

  const handleConvertCurrency = () => {
    let result = null;
    const amountNumber = parseFloat(amount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกจำนวนเงินที่ถูกต้อง');
      return;
    }

    if (selectedCurrency === 'THB') {
      // แปลงจาก THB → USD
      result = amountNumber / 35; // 1 USD = 35 THB (อัตราแลกเปลี่ยนตัวอย่าง)
    } else if (selectedCurrency === 'USD') {
      // แปลงจาก USD → THB
      result = amountNumber * 35; // 1 USD = 35 THB (อัตราแลกเปลี่ยนตัวอย่าง)
    }

    setConvertedAmount(result); // ตั้งค่าให้แสดงผลลัพธ์
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  return (
    <ImageBackground
      // ปรับ path ให้ตรงกับโปรเจกต์จริงของคุณ
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
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Group2Screen')}>
            <Text style={styles.menuText}>เชิญเพื่อน</Text>
          </TouchableOpacity>
        </View>

        {/* แสดงข้อมูลรายการที่แนบหลักฐาน (ถ้ามี) */}
        {(from || to) && (
          <View style={styles.transferInfo}>
            <Text style={styles.transferInfoText}>
              รายการ: {from} → {to} จำนวน ฿{Number(amountParam || 0).toFixed(2)}
            </Text>
          </View>
        )}

        {/* Messages / Empty */}
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {selectedImages.length === 0 ? (
            <View style={styles.emptyChatContainer}>
              <Text style={styles.emptyChatText}>แนบหลักฐานการชำระเงิน</Text>
              <Text style={styles.emptyChatSubText}>กดไอคอนรูปภาพด้านล่างเพื่อเลือกรูป</Text>
            </View>
          ) : (
            <View style={styles.selectedImagesContainer}>
              <Text style={styles.selectedImagesTitle}>รูปภาพที่เลือก:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Text style={styles.imagePreviewText}>{image}</Text>
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowImagePicker(true)}>
            <Text style={styles.iconText}>🖼️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => setShowMenuOptions(true)}>
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={[styles.sendButton, isSendDisabled && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={isSendDisabled}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

        {/* Image Picker Modal */}
        <Modal visible={showImagePicker} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>เลือกรูปภาพ</Text>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleImageSelect('เลือกจากแกลเลอรี่')}>
                <Text style={styles.modalOptionText}>🖼️ เลือกจากแกลเลอรี่</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowImagePicker(false)}>
                <Text style={styles.modalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Menu Options Modal */}
        <Modal visible={showMenuOptions} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>เครื่องมือ</Text>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleMenuOption('แปลภาษา')}>
                <Text style={styles.modalOptionText}>🌐 แปลภาษา</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleMenuOption('แปลงสกุลเงิน')}>
                <Text style={styles.modalOptionText}>💱 แปลงสกุลเงิน</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowMenuOptions(false)}>
                <Text style={styles.modalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Currency Selection Modal */}
        <Modal visible={showMenuOptions && selectedCurrency === ''} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>เลือกสกุลเงิน</Text>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleCurrencySelect('THB')}>
                <Text style={styles.modalOptionText}>THB (บาทไทย)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleCurrencySelect('USD')}>
                <Text style={styles.modalOptionText}>USD (ดอลลาร์สหรัฐ)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowMenuOptions(false)}>
                <Text style={styles.modalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Currency Input & Result */}
        {selectedCurrency && (
          <View style={styles.currencyContainer}>
            <Text style={styles.currencyTitle}>แปลงสกุลเงิน</Text>
            <TextInput
              style={styles.currencyInput}
              placeholder="กรอกจำนวนเงิน"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity style={styles.convertButton} onPress={handleConvertCurrency}>
              <Text style={styles.convertText}>แปลง</Text>
            </TouchableOpacity>
            {convertedAmount !== null && (
              <Text style={styles.convertResult}>ผลลัพธ์: {convertedAmount} {selectedCurrency === 'THB' ? 'USD' : 'THB'}</Text>
            )}
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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

  currencyContainer: { padding: 20, backgroundColor: 'rgba(255,255,255,0.9)', marginTop: 20, borderRadius: 10 },
  currencyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  currencyInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, borderRadius: 5 },
  convertButton: { backgroundColor: '#4a90e2', padding: 10, borderRadius: 20, alignItems: 'center' },
  convertText: { color: '#fff', fontSize: 16 },
  convertResult: { fontSize: 16, color: '#333', marginTop: 10 },
});

export default Group4Screen;
