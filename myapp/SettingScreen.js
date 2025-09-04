import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { supabase } from './supabaseClient';

const SettingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // state for select simple currency
  const [currency, setCurrency] = useState('THB');
  const [language, setLanguage] = useState('ภาษาไทย');

  // state for currency modal
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // state for user info
  const [slipName, setSlipName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('********');

  // state for profile image
  const [profileImage, setProfileImage] = useState(null);

  // ดึงข้อมูลผู้ใช้จาก Supabase ทุกครั้งที่เข้า/กลับมาหน้านี้
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchUser = async () => {
        try {
          const userEmail = route?.params?.email || 'film0936123963@gmail.com'; // กำหนดค่าอีเมลล์ที่ต้องการ
          const { data, error } = await supabase
            .from('users')
            .select('name, email, phone, password')
            .eq('email', userEmail)
            .single();
          if (error) {
            if (error.code === 'PGRST116') {
              console.warn('No user found for the provided email.');
            } else {
              console.warn('Supabase fetch user error:', error);
            }
            return;
          }
          if (isActive && data) {
            setSlipName(data.name || '');
            setEmail(data.email || '');
            setPhone(data.phone || '');
            setPassword(data.password ? '*'.repeat(data.password.length) : '********');
          }
        } catch (e) {
          console.warn('fetchUser exception:', e);
        }
      };
      fetchUser();
      return () => {
        isActive = false;
      };
    }, [route])
  );

  const handleCurrencySelect = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setShowCurrencyModal(false);
  };

  // Function to open the image picker (camera or gallery)
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access gallery is required!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileImage(result.assets?.[0]?.uri ?? result.uri);
    }
  };

  // Function to open the camera
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileImage(result.assets?.[0]?.uri ?? result.uri);
    }
  };

  return (
    <ImageBackground
      source={require('./assets/images/p1.png')}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>การตั้งค่าบัญชี</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Profile */}
        <View style={styles.profileSection}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <Image
              source={require('./assets/images/logo.png')}
              style={styles.avatar}
            />
          )}
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.changePhotoText}>เลือกภาพจากไฟล์</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={takePhoto}>
            <Text style={styles.changePhotoText}>ถ่ายภาพใหม่</Text>
          </TouchableOpacity>
        </View>

        {/* Info fields */}
        <View style={styles.formCard}>
          <Field label="ชื่อบนสลิป" value={slipName} editable={true} onEdit={setSlipName} />
          <Field label="ที่อยู่อีเมล" value={email} editable={false} />
          <Field label="หมายเลขโทรศัพท์" value={phone} editable={false} />
          <Field label="รหัสผ่าน" value={password} editable={false} />

          {/* Showing currency without modal */}
          <Field label="สกุลเงินเริ่มต้น" value={currency} editable={false} />
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={() => {}}>
          <Text style={styles.saveBtnText}>บันทึกการเปลี่ยนแปลง</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

// Small components to show editable fields
const Field = ({ label, value, editable, onEdit }) => {
  return (
    <View style={styles.fieldRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {editable ? (
          <TextInput
            style={styles.fieldValue}
            value={value}
            onChangeText={onEdit}
          />
        ) : (
          <Text style={styles.fieldValue}>{value}</Text>
        )}
      </View>
      {editable && (
        <TouchableOpacity>
          <Text style={styles.editText}>แก้ไข</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerWrap: {
    backgroundColor: 'rgba(203, 229, 232, 0.9)', 
    paddingTop: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#2c2c2c',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    resizeMode: 'contain',
    backgroundColor: '#fdecec',
  },
  changePhotoText: {
    marginTop: 8,
    color: '#6b7280',
  },
  formCard: {
    backgroundColor: 'rgba(232, 244, 248, 0.9)',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  editText: {
    color: '#10b981',
    marginTop: 18,
    marginLeft: 8,
  },
  saveBtn: {
    backgroundColor: '#22c55e',
    marginHorizontal: 16,
    marginTop: 16,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default SettingScreen;
