import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, ImageBackground, Alert, Modal } from 'react-native';

const Group4Screen = ({ navigation, route }) => {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // ส่งได้เมื่อมีรูปเท่านั้น
  const isSendDisabled = selectedImages.length === 0;

  const groupName = route?.params?.groupName || 'น้องรัก';

  const handleSendMessage = () => {
    if (selectedImages.length > 0) {
      console.log('Sending images:', selectedImages);
      // TODO: ส่งรูปไปยัง backend / state จริงตรงนี้
      setSelectedImages([]);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleImageSelect = (imageType) => {
    // TODO: เปลี่ยนเป็น URI ของรูปเมื่อใช้ image-picker จริง (เช่น expo-image-picker)
    console.log('Selected image type:', imageType);
    setShowImagePicker(false);
    setSelectedImages(prev => [...prev, imageType]);
    Alert.alert('เลือกรูปภาพ', `เลือก${imageType}แล้ว`);
  };

  const handleMenuOption = (option) => {
    console.log('Selected option:', option);
    setShowMenuOptions(false);
    Alert.alert('เลือกตัวเลือก', `เลือก${option}แล้ว`);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  return (
    <ImageBackground
      // ปรับ path ให้ตรงตำแหน่งไฟล์จริงของคุณ
      // ถ้าไฟล์นี้อยู่ใน screens/ และรูปอยู่ที่ assets/images ให้ใช้: require('../assets/images/p1.png')
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
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuText}>เชิญเพื่อน</Text>
          </TouchableOpacity>
        </View>

        {/* Messages / Empty */}
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.emptyChatContainer}>
            <Text style={styles.emptyChatText}>เริ่มต้นการสนทนา</Text>
            <Text style={styles.emptyChatSubText}>เลือกรูปภาพเพื่อเริ่มแชท</Text>
          </View>

          {/* แสดงตัวอย่างรูปที่เลือก */}
          {selectedImages.length > 0 && (
            <View style={styles.selectedImagesContainer}>
              <Text style={styles.selectedImagesTitle}>รูปภาพที่เลือก:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Text style={styles.imagePreviewText}>{image}</Text>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Input Area (ไอคอนซ้าย + ตัวดัน + ปุ่มส่งชิดขวา) */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowImagePicker(true)}
          >
            <Text style={styles.iconText}>🖼️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowMenuOptions(true)}
          >
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>

          {/* ตัวดันพื้นที่ให้ปุ่มส่งไปชิดขวา */}
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

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleImageSelect('เลือกจากแกลเลอรี่')}
              >
                <Text style={styles.modalOptionText}>🖼️ เลือกจากแกลเลอรี่</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowImagePicker(false)}
              >
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

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleMenuOption('แปลภาษา')}
              >
                <Text style={styles.modalOptionText}>🌐 แปลภาษา</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleMenuOption('แปลงสกุลเงิน')}
              >
                <Text style={styles.modalOptionText}>💱 แปลงสกุลเงิน</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowMenuOptions(false)}
              >
                <Text style={styles.modalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 5 },
  backIcon: { fontSize: 24, color: '#333' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  menuButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#e8f4fd',
    borderRadius: 15,
  },
  menuText: { fontSize: 14, color: '#4a90e2' },

  /* Messages / Empty */
  messagesContainer: { flex: 1, paddingHorizontal: 15, paddingVertical: 20 },
  emptyChatContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyChatText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginBottom: 10 },
  emptyChatSubText: { fontSize: 14, color: '#999', textAlign: 'center' },

  /* Selected images preview */
  selectedImagesContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
  selectedImagesTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  imagePreview: {
    backgroundColor: '#b3e5fc',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    position: 'relative',
    minWidth: 100,
    alignItems: 'center',
  },
  imagePreviewText: { fontSize: 14, color: '#333' },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  /* Input Area */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  iconButton: { padding: 8, marginRight: 8 },
  iconText: { fontSize: 22, color: '#666' },
  sendButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendIcon: { fontSize: 18, color: '#fff' },

  /* Modal */
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalOptionText: { fontSize: 16, color: '#333' },
  modalCancelButton: {
    paddingVertical: 15,
    marginTop: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 16, color: '#666', fontWeight: 'bold' },
});

export default Group4Screen;
