import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ImageBackground, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GroupScreen = () => {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { name: 'อาหาร', icon: require('./assets/images/food.png') },
    { name: 'เครื่องดื่ม', icon: require('./assets/images/drink.png') },
    { name: 'ท่องเที่ยว', icon: require('./assets/images/travel.png') },
    { name: 'ออกกำลังกาย', icon: require('./assets/images/exercise.png') }
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // ฟังก์ชันที่ตรวจสอบ groupName และ selectedCategory ก่อนนำทางไป Group2Screen
  const handleCreateGroup = () => {
    if (groupName && selectedCategory) {
      console.log(`Group Name: ${groupName}, Category: ${selectedCategory.name}`);
      // ส่ง groupName ไปยัง Group2Screen
      navigation.navigate('Group2Screen', { groupName: groupName });
    } else {
      alert('กรุณากรอกชื่อกลุ่มและเลือกประเภทกิจกรรม');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('./assets/images/p1.png')} // Path to your background image
        style={styles.container} // Set background image as container's background
      >
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backArrow}>กลับ</Text>
            </TouchableOpacity>
            
            {/* Title */}
            <Text style={styles.title}>สร้างกลุ่ม</Text>
            
            {/* Done Button */}
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editText}>เสร็จ</Text>
            </TouchableOpacity>
          </View>

          {/* Camera Section */}
          <View style={styles.cameraSection}>
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => Alert.alert('กล้อง', 'เปิดกล้องเพื่อถ่ายรูปกลุ่ม')}
            >
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
            <Text style={styles.cameraText}>ถ่ายรูป</Text>
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
                style={[styles.categoryItem, selectedCategory?.name === category.name && styles.selectedCategory]}
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
          <TouchableOpacity style={styles.button} onPress={handleCreateGroup}>
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
    backgroundColor: '#f0f2f5',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GroupScreen;
