  // อัปโหลดรูปภาพไปยัง Supabase Storage และบันทึก URL ลงฐานข้อมูล
  const uploadGroupImage = async (uri) => {
    try {
      if (!uri) return null;
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `group_images/${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('group-images')
        .upload(filePath, blob, { cacheControl: '3600', upsert: false });
      if (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert('อัปโหลดรูปไม่สำเร็จ', uploadError.message);
        return null;
      }
      const { data: urlData } = supabase.storage.from('group-images').getPublicUrl(filePath);
      return urlData?.publicUrl || null;
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('อัปโหลดรูปไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาด');
      return null;
    }
  };
import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
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
  SafeAreaView,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const GroupScreen = () => {
  const [otherModalVisible, setOtherModalVisible] = useState(false);
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [groupImage, setGroupImage] = useState(null);
  const [otherActivity, setOtherActivity] = useState("");

  const categories = [
    {
      name: "อาหาร",
      icon: require("./assets/images/food.png"),
      image: "food.png",
    },
    {
      name: "เครื่องดื่ม",
      icon: require("./assets/images/drink.png"),
      image: "drink.png",
    },
    {
      name: "ท่องเที่ยว",
      icon: require("./assets/images/travel.png"),
      image: "travel.png",
    },
    {
      name: "ออกกำลังกาย",
      icon: require("./assets/images/exercise.png"),
      image: "exercise.png",
    },
    {
      name: "กิจกรรมอื่นๆ",
      icon: require("./assets/images/i.jpg"), // ใช้ภาพ i.jpg
      image: "i.jpg",
      isOther: true,
    },
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category.isOther) {
      setOtherModalVisible(true);
    }
  };

  const handleFilePicker = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      console.log("DocumentPicker result:", res);
      if (res.assets && res.assets.length > 0 && res.assets[0].uri) {
        setGroupImage(res.assets[0].uri);
        console.log("groupImage set to:", res.assets[0].uri);
      } else {
        setGroupImage(null);
        console.log("groupImage set to null");
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเลือกไฟล์ภาพได้");
      }
    } catch (err) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเลือกไฟล์ภาพได้");
    }
  };

  const addGroupToDatabase = async () => {
    if (!groupName || !selectedCategory) {
      console.log(
        "groupName or selectedCategory is missing:",
        groupName,
        selectedCategory
      );
      return false;
    }
    let created_by = null;
    try {
      const { data } = await supabase.auth.getSession();
      created_by = data?.session?.user?.email || null;
    } catch (e) {}
    const activityType = selectedCategory && selectedCategory.isOther && otherActivity ? otherActivity : selectedCategory?.name;
    let imageUrl = null;
    if (groupImage) {
      imageUrl = await uploadGroupImage(groupImage);
    }
    const { data, error } = await supabase
      .from("groups")
      .insert([
        {
          name: groupName,
          created_by,
          image: selectedCategory.image,
          image_url: imageUrl,
          activity_type: activityType,
        },
      ])
      .select();
    console.log("AFTER GROUP INSERT", data, error);

    if (!error && data && data[0]) {
      let userId = null;
      try {
        const { data } = await supabase.auth.getSession();
        userId = data?.session?.user?.id || null;
      } catch (e) {
        console.log("ERROR getSession:", e);
      }
      console.log("DEBUG groupName:", groupName);
      console.log("DEBUG selectedCategory:", selectedCategory);
      console.log("DEBUG userId:", userId);
      console.log("DEBUG group_id:", data[0].id);

      if (!data[0].id) {
        console.log(
          "Cannot insert activities: group_id is missing",
          data[0].id
        );
        return !error;
      }
          const activityType = selectedCategory?.isOther && otherActivity ? otherActivity : selectedCategory.name;

      const activityPayload = {
        type: "create_group",
        description: `คุณสร้างกลุ่ม "${groupName}"`,
        group_id: data[0].id,
        group_name: groupName,
        group_activity_type: activityType,
      };
      if (userId) activityPayload.user_id = userId;

      console.log("Insert to activities:", activityPayload);

      try {
        const { data: actData, error: actError } = await supabase
          .from("activities")
          .insert([activityPayload])
          .select();
        console.log("Insert activities result:", actData, actError);
      } catch (e) {
        console.log("ERROR insert activities:", e);
      }
    } else {
      console.log("Supabase insert error (groups):", error);
    }
    return !error;
  };

  const handleDone = async () => {
    if (groupName && selectedCategory) {
      const success = await addGroupToDatabase();
      if (success) {
        navigation.navigate("Group2Screen", {
          groupName,
          category: selectedCategory.name,
        });
      } else {
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเพิ่มกลุ่มได้");
      }
    } else {
      Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อกลุ่มและเลือกประเภทกิจกรรม");
    }
  };

  const handleNext = async () => {
    if (groupName && selectedCategory) {
      const success = await addGroupToDatabase();
      if (success) {
        navigation.navigate("Group2Screen", {
          groupName,
          category: selectedCategory.name,
        });
      } else {
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเพิ่มกลุ่มได้");
      }
    } else {
      Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อกลุ่มและเลือกประเภทกิจกรรม");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("./assets/images/p1.png")}
        style={styles.container}
      >
        <Modal
          visible={otherModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setOtherModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Image source={require("./assets/images/i.jpg")}
                  style={{ width: 72, height: 72, marginBottom: 18, borderRadius: 36, borderWidth: 2, borderColor: '#4A90E2' }}
                  resizeMode="cover"
                />
                <Text style={styles.modalTitle}>กรอกชื่อกิจกรรมอื่นๆ</Text>
                <Text style={styles.modalLabel}>โปรดระบุชื่อกิจกรรมที่ต้องการ</Text>
                <TextInput
                  style={[styles.input, { marginBottom: 18, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, fontSize: 16, backgroundColor: '#f7f7f7' }]}
                  placeholder="ชื่อกิจกรรมอื่นๆ"
                  value={otherActivity}
                  onChangeText={setOtherActivity}
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setOtherModalVisible(false)}
                >
                  <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold' }}>ตกลง</Text>
                </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backArrow}>กลับ</Text>
            </TouchableOpacity>
            <Text style={styles.title}>สร้างกลุ่ม</Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={handleDone}
              activeOpacity={0.7}
            >
              <Text style={styles.editText}>เสร็จ</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.cameraSection, { alignItems: "center" }]}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 12,
                padding: 10,
                backgroundColor: "#fafafa",
                minWidth: 160,
              }}
            >
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleFilePicker}
              >
                <Text style={styles.cameraIcon}>📁</Text>
              </TouchableOpacity>
              {groupImage && (
                <Image
                  source={{ uri: groupImage }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 10,
                    marginLeft: 15,
                    backgroundColor: "#eee",
                  }}
                />
              )}
            </View>
            <Text style={styles.cameraText}>เพิ่มไฟล์ภาพ</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="ชื่อกลุ่ม"
            value={groupName}
            onChangeText={setGroupName}
          />

          <Text style={styles.categoryLabel}>ประเภทกิจกรรม</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryItem,
                  selectedCategory?.name === category.name &&
                    styles.selectedCategory,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Image source={category.icon} style={styles.categoryIcon} />
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>ถัดไป</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
  },
  modalButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  modalLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  backArrow: {
    fontSize: 16,
    color: "#007BFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    padding: 10,
  },
  editText: {
    fontSize: 16,
    color: "#007BFF",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  cameraSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 50,
  },
  cameraIcon: {
    fontSize: 30,
    color: "#333",
  },
  cameraText: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  categoryLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  selectedCategory: {
    backgroundColor: "#c2f5d8ff",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 5,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(240, 242, 245, 0.9)",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GroupScreen;
