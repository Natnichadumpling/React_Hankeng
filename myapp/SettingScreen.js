import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StyleSheet,
  Dimensions,
  Platform,
  TextInput 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from './supabaseClient';

const { width } = Dimensions.get('window');

const SettingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [currency, setCurrency] = useState('THB');
  const [language, setLanguage] = useState('ภาษาไทย');
  const [slipName, setSlipName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    console.log('Route params:', route.params); // Debugging log
    if (route.params?.userData) {
      const { name, email, phone, password } = route.params.userData;
      console.log('Received user data:', { name, email, phone, password }); // Debugging log
      setSlipName(name || '');
      setEmail(email || '');
      setPhone(phone || '');
      setPassword(password || '');
    } else {
      const fetchUserData = async () => {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error('Error fetching session:', sessionError);
            return;
          }

          const userEmail = session?.user?.email;
          console.log('User email from session:', userEmail); // Debugging log

          if (userEmail) {
            const { data, error } = await supabase
              .from('users')
              .select('name, email, phone, password')
              .eq('email', userEmail)
              .single();

            if (error) {
              console.error('Error fetching user data:', error);
            } else if (data) {
              console.log('Fetched user data:', data); // Debugging log
              setSlipName(data.name || '');
              setEmail(data.email || '');
              setPhone(data.phone || '');
              setPassword(data.password || '');
            }
          }
        } catch (error) {
          console.error('Error fetching session or user data:', error);
        }
      };

      fetchUserData();
    }
  }, [route.params]);

  const personalInfo = [
    { label: 'ชื่อนามสกุล', value: slipName, isEditable: true },
    { label: 'ที่อยู่อีเมล', value: email, isEditable: false },
    { label: 'หมายเลขโทรศัพท์', value: phone, isEditable: false },
    { label: 'รหัสผ่าน', value: password, isEditable: false },
  ];

  const appSettings = [
    { label: 'สกุลเงินเริ่มต้น', value: currency, isEditable: false },
    { label: 'ภาษา', value: language, isEditable: false },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>การตั้งค่าบัญชี</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('./assets/images/logo.png')}
              style={styles.avatar}
            />
          </View>
          <TouchableOpacity style={styles.changePhotoBtn} activeOpacity={0.8}>
            <Text style={styles.changePhotoText}>เปลี่ยนภาพโปรไฟล์</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.sectionContainer}>
          {personalInfo.map((item, index) => (
            <View key={index} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{item.label}</Text>
              <View style={styles.inputRow}>
                {item.isEditable && item.label === 'ชื่อนามสกุล' ? (
                  isEditingName ? (
                    <TextInput
                      style={styles.fieldValue}
                      value={slipName}
                      onChangeText={setSlipName}
                    />
                  ) : (
                    <Text style={styles.fieldValue}>{slipName}</Text>
                  )
                ) : (
                  <Text style={styles.fieldValue}>{item.value}</Text>
                )}
                {item.label === 'ชื่อนามสกุล' && (
                  <TouchableOpacity 
                    style={styles.editBtn} 
                    activeOpacity={0.7} 
                    onPress={() => setIsEditingName(!isEditingName)}
                  >
                    <Text style={styles.editText}>{isEditingName ? 'บันทึก' : 'แก้ไข'}</Text>
                  </TouchableOpacity>
                )}
                {item.label === 'รหัสผ่าน' && (
                  <TouchableOpacity 
                    style={styles.showPasswordBtn} 
                    onPress={() => setShowPassword(!showPassword)} 
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showPasswordText}>{showPassword ? 'ซ่อน' : 'แสดง'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* App Settings Section */}
        <View style={styles.sectionContainer}>
          {appSettings.map((item, index) => (
            <View key={index} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{item.label}</Text>
              <Text style={styles.fieldValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>บันทึกการเปลี่ยนแปลง</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD', // Light blue background
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    backgroundColor: '#bcd8b8ff', // เปลี่ยนเป็นสีเขียวอ่อน
    borderBottomWidth: 1,
    borderBottomColor: '#B3D9F2',
  },
  backBtn: {
    padding: 8,
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#E8F4FD',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#DDD',
  },
  changePhotoBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  changePhotoText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  fieldContainer: {
    marginBottom: 25,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    paddingBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  showPasswordBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  showPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    paddingBottom: 8,
    paddingRight: 8,
  },
  dropdownValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingScreen;
