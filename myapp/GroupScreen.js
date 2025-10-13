import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "./supabaseClient";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

// ✅ อัปโหลดรูปแบบ base64 → Supabase
const uploadImageUri = async (uri) => {
  try {
    if (!uri) return null;
    let localUri = uri;

    if (localUri.startsWith("content://")) {
      const dest = FileSystem.cacheDirectory + `upload_${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: localUri, to: dest });
      localUri = dest;
    }

    // อ่านไฟล์เป็น base64
    const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: "base64" });
    const extMatch = /\.(\w+)$/.exec(localUri);
    const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
    const fileName = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const filePath = `group_images/${fileName}`;

    // แปลง base64 → Uint8Array
    const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const { error } = await supabase.storage.from("group-images").upload(filePath, byteArray, {
      contentType: `image/${ext}`,
      upsert: false,
    });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from("group-images").getPublicUrl(filePath);
    return urlData?.publicUrl || null;
  } catch (err) {
    console.error("Upload error:", err);
    Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปโหลดรูปได้");
    return null;
  }
};

const GroupScreen = () => {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  const categories = [
    { name: "อาหาร", icon: require("./assets/images/food.png") },
    { name: "เครื่องดื่ม", icon: require("./assets/images/drink.png") },
    { name: "ท่องเที่ยว", icon: require("./assets/images/travel.png") },
    { name: "ออกกำลังกาย", icon: require("./assets/images/exercise.png") },
    { name: "กิจกรรมอื่นๆ", icon: require("./assets/images/i.jpg"), isOther: true },
  ];

  // ✅ บันทึกข้อมูลกลุ่มลงฐานข้อมูล
  const handleNext = async () => {
    if (!groupName.trim()) {
      Alert.alert("กรุณากรอกชื่อกลุ่ม");
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl = groupImage;
      if (groupImage && !/^https?:\/\//i.test(groupImage)) {
        imageUrl = await uploadImageUri(groupImage);
      }

      // ✅ บันทึกข้อมูลลงตาราง groups และดึง group_id กลับมา
      const { data, error } = await supabase
        .from("groups")
        .insert([
          {
            name: groupName,
            image: groupImage,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const groupId = data?.id;
      const image_url = data?.image_url;

      Alert.alert("สำเร็จ", "สร้างกลุ่มเรียบร้อยแล้ว!");

      // ✅ ไปยังหน้า Group2Screen พร้อมส่งข้อมูลไปด้วย
      navigation.navigate("Group2Screen", {
        groupId,
        groupName,
        imageUrl: image_url,
      });
    } catch (err) {
      Alert.alert("เกิดข้อผิดพลาด", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const pickFromGallery = async () => {
    setShowImagePickerModal(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตเข้าถึงแกลเลอรี่");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setGroupImage(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("ไม่สามารถเลือกรูปได้", err.message);
    }
  };

  const pickFromFiles = async () => {
    setShowImagePickerModal(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });
      if (result.type === "success" && result.uri) {
        setGroupImage(result.uri);
      }
    } catch (err) {
      Alert.alert("ไม่สามารถเลือกไฟล์ได้", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("./assets/images/p1.png")}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* ✅ Modal เลือกรูปภาพ */}
          <Modal visible={showImagePickerModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>เลือกรูปภาพจาก</Text>
                <TouchableOpacity style={styles.modalButton} onPress={pickFromGallery}>
                  <Text style={styles.modalText}>📷 แกลเลอรี่</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#34A853" }]}
                  onPress={pickFromFiles}
                >
                  <Text style={styles.modalText}>📁 ไฟล์</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#999" }]}
                  onPress={() => setShowImagePickerModal(false)}
                >
                  <Text style={styles.modalText}>ยกเลิก</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← กลับ</Text>
            </TouchableOpacity>
            <Text style={styles.title}>สร้างกลุ่ม</Text>
            <TouchableOpacity onPress={handleNext} disabled={isUploading}>
              <Text style={styles.saveText}>{isUploading ? "..." : "ถัดไป"}</Text>
            </TouchableOpacity>
          </View>

          {/* เนื้อหา */}
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.imageSection}>
              {groupImage ? (
                <Image source={{ uri: groupImage }} style={styles.previewImage} />
              ) : (
                <TouchableOpacity
                  style={styles.imagePlaceholder}
                  onPress={() => setShowImagePickerModal(true)}
                >
                  <Text style={styles.folderIcon}>📁</Text>
                  <Text style={styles.pickText}>เลือกรูป</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.noteText}>เพิ่มรูปภาพกลุ่ม (ไม่บังคับ)</Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>ชื่อกลุ่ม *</Text>
              <TextInput
                style={styles.input}
                placeholder="กรอกชื่อกลุ่ม"
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>

            <View style={styles.categorySection}>
              <Text style={styles.label}>ประเภทกิจกรรม *</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.categoryItem,
                      selectedCategory === cat.name && styles.selectedCategory,
                    ]}
                    onPress={() => setSelectedCategory(cat.name)}
                  >
                    <Image source={cat.icon} style={styles.categoryIcon} />
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === cat.name && styles.selectedCategoryText,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* ✅ ปุ่มถัดไป */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.nextButton, isUploading && styles.disabledButton]}
              disabled={isUploading}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {isUploading ? "กำลังบันทึก..." : "ถัดไป →"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

// 🎨 สไตล์
const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#333" },
  backText: { fontSize: 16, color: "#007BFF" },
  saveText: { fontSize: 16, color: "#007BFF", fontWeight: "600" },
  scrollContainer: { padding: 20, paddingBottom: 100 },
  imageSection: { alignItems: "center", marginVertical: 20 },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4ff",
    borderRadius: 16,
    padding: 20,
  },
  folderIcon: { fontSize: 40 },
  pickText: { marginTop: 6, fontSize: 14, color: "#007BFF" },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#007BFF",
  },
  noteText: { marginTop: 8, color: "#666" },
  inputSection: { marginTop: 20 },
  label: { fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  categorySection: { marginTop: 20 },
  categoryContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryItem: {
    width: "30%",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#eee",
  },
  selectedCategory: { borderColor: "#4CAF50", backgroundColor: "#e8f5e9" },
  categoryIcon: { width: 40, height: 40 },
  categoryText: { color: "#333" },
  selectedCategoryText: { color: "#2E7D32", fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  nextButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 16,
  },
  nextButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  disabledButton: { backgroundColor: "#ccc" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  modalButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    paddingVertical: 12,
    width: "90%",
    marginTop: 10,
    alignItems: "center",
  },
  modalText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default GroupScreen;
