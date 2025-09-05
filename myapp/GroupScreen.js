import React, { useState } from 'react';
// ...existing code...
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from './supabaseClient';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GroupScreen = () => {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [groupImage, setGroupImage] = useState(null);

  const categories = [
    { name: 'อาหาร', icon: require('./assets/images/food.png'), image: 'food.png' },
    { name: 'เครื่องดื่ม', icon: require('./assets/images/drink.png'), image: 'drink.png' },
    { name: 'ท่องเที่ยว', icon: require('./assets/images/travel.png'), image: 'travel.png' },
    { name: 'ออกกำลังกาย', icon: require('./assets/images/exercise.png'), image: 'exercise.png' },
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // ฟังก์ชันเลือกไฟล์ภาพ (Expo)
  const handleFilePicker = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
      console.log('DocumentPicker result:', res);
      if (res.assets && res.assets.length > 0 && res.assets[0].uri) {
        setGroupImage(res.assets[0].uri);
        console.log('groupImage set to:', res.assets[0].uri);
      } else {
        setGroupImage(null);
        console.log('groupImage set to null');
      }
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเลือกไฟล์ภาพได้');
    }
  };

  // ฟังก์ชันเพิ่มกลุ่มลงฐานข้อมูล
  const addGroupToDatabase = async () => {
    if (!groupName || !selectedCategory) return false;
    // หากมีระบบ auth สามารถดึง email จาก session ได้
    let created_by = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      created_by = session?.user?.email || null;
    } catch (e) {}
    const { data, error } = await supabase
      .from('groups')
      .insert([{ 
        name: groupName, 
        created_by, 
        image: selectedCategory.image,
        image_url: groupImage || null
      }]);
    if (!error && data && data[0]) {
      // ดึง user id จาก session ถ้ามี
      let userId = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id || null;
      } catch (e) {}
      // บันทึกกิจกรรมการสร้างกลุ่ม
      await supabase
        .from('activities')
        .insert([{
          user_id: userId,
          type: 'create_group',
          description: `คุณสร้างกลุ่ม "${groupName}"`,
          group_id: data[0].id
        }]);
    }
    if (error) {
      console.log('Supabase insert error:', error);
    }
    return !error;
  };

  // ปุ่ม "เสร็จ" -> ไปหน้า Group2Screen และบันทึกลงฐานข้อมูล
  const handleDone = async () => {
    if (groupName && selectedCategory) {
      const success = await addGroupToDatabase();
      if (success) {
        navigation.navigate('Group2Screen', {
          groupName,
          category: selectedCategory.name,
        });
      } else {
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มกลุ่มได้');
      }
    } else {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อกลุ่มและเลือกประเภทกิจกรรม');
    }
  };

  // ปุ่ม "ถัดไป" -> ไปหน้า Group2Screen และบันทึกลงฐานข้อมูล
  const handleNext = async () => {
    if (groupName && selectedCategory) {
      const success = await addGroupToDatabase();
      if (success) {
        navigation.navigate('Group2Screen', {
          groupName,
          category: selectedCategory.name,
        });
      } else {
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มกลุ่มได้');
      }
    } else {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อกลุ่มและเลือกประเภทกิจกรรม');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        // หมายเหตุ: ปรับ path ถ้าไฟล์นี้อยู่ในโฟลเดอร์ย่อย (เช่น ../assets/images/p1.png)
        source={require('./assets/images/p1.png')}
        style={styles.container}
      >
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>กลับ</Text>
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>สร้างกลุ่ม</Text>

            {/* Done Button */}
            <TouchableOpacity style={styles.editButton} onPress={handleDone} activeOpacity={0.7}>
              <Text style={styles.editText}>เสร็จ</Text>
            </TouchableOpacity>
          </View>

          {/* Camera Section */}
          <View style={[styles.cameraSection, { alignItems: 'center' }]}> 
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 10, backgroundColor: '#fafafa', minWidth: 160 }}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleFilePicker}
              >
                <Text style={styles.cameraIcon}>📁</Text>
              </TouchableOpacity>
              {groupImage && (
                <Image source={{ uri: groupImage }} style={{ width: 60, height: 60, borderRadius: 10, marginLeft: 15, backgroundColor: '#eee' }} />
              )}
            </View>
            <Text style={styles.cameraText}>เพิ่มไฟล์ภาพ</Text>
          </View>

          {/* Group Name */}
          <TextInput
            style={styles.input}
            placeholder="ชื่อกลุ่ม"
            value={groupName}
            onChangeText={setGroupName}
          />

          {/* Category Selection */}
          <Text style={styles.categoryLabel}>ประเภทกิจกรรม</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryItem,
                  selectedCategory?.name === category.name && styles.selectedCategory,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Image source={category.icon} style={styles.categoryIcon} />
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Next Button Container */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.buttonText}>ถัดไป</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  backArrow: {
    fontSize: 16,
    color: '#007BFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 10,
  },
  editText: {
    fontSize: 16,
    color: '#007BFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  cameraSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 50,
  },
  cameraIcon: {
    fontSize: 30,
    color: '#333',
  },
  cameraText: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  categoryLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  selectedCategory: {
    backgroundColor: '#c2f5d8ff',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(240, 242, 245, 0.9)',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupScreen;
