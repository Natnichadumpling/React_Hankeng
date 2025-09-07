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
  TextInput,
  Animated
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import * as ImagePicker from 'react-native-image-picker'; // Import ImagePicker

const { width } = Dimensions.get('window');

const SettingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const fadeAnim = new Animated.Value(0);

  const [currency, setCurrency] = useState('THB');
  const [language, setLanguage] = useState('ภาษาไทย');
  const [slipName, setSlipName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // State for profile image

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    console.log('Route params:', route.params);
    if (route.params?.userData) {
      const { name, email, phone, password } = route.params.userData;
      console.log('Received user data:', { name, email, phone, password });
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
          console.log('User email from session:', userEmail);

          if (userEmail) {
            const { data, error } = await supabase
              .from('users')
              .select('name, email, phone, password')
              .eq('email', userEmail)
              .single();

            if (error) {
              console.error('Error fetching user data:', error);
            } else if (data) {
              console.log('Fetched user data:', data);
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
    { label: 'ชื่อนามสกุล', value: slipName, isEditable: true, icon: '👤' },
    { label: 'ที่อยู่อีเมล', value: email, isEditable: false, icon: '📧' },
    { label: 'หมายเลขโทรศัพท์', value: phone, isEditable: false, icon: '📱' },
    { label: 'รหัสผ่าน', value: password, isEditable: false, icon: '🔒' },
  ];

  const appSettings = [
    { label: 'สกุลเงินเริ่มต้น', value: currency, isEditable: false, icon: '💰' },
    { label: 'ภาษา', value: language, isEditable: false, icon: '🌐' },
  ];

  const handleSave = async () => {
    try {
      console.log('Saving changes...', { slipName, email, phone });
      
      // Get current session to get user email
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        alert('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่');
        return;
      }

      const userEmail = session?.user?.email;
      if (!userEmail) {
        console.error('No user email found');
        alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      // Update user data in database
      const { data, error } = await supabase
        .from('users')
        .update({ 
          name: slipName,
          phone: phone 
        })
        .eq('email', userEmail)
        .select();

      if (error) {
        console.error('Error updating user data:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      } else {
        console.log('User data updated successfully:', data);
        alert('บันทึกข้อมูลเรียบร้อยแล้ว');
        setIsEditingName(false); // Exit edit mode after successful save
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert('เกิดข้อผิดพลาดที่ไม่คาดคิด');
    }
  };

  const handleImageUpload = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.error('ImagePicker Error: ', response.error);
      } else {
        const uri = response.assets[0].uri;
        const fileName = uri.split('/').pop();
        const formData = new FormData();
        formData.append('file', {
          uri,
          name: fileName,
          type: response.assets[0].type,
        });

        try {
          const { data, error } = await supabase.storage
            .from('profile-images')
            .upload(`public/${fileName}`, formData);

          if (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
          } else {
            const imageUrl = `${supabase.storage.from('profile-images').getPublicUrl(`public/${fileName}`).publicURL}`;
            setProfileImage(imageUrl);

            // Update user profile with the new image URL
            const { data: updateData, error: updateError } = await supabase
              .from('users')
              .update({ profile_image: imageUrl })
              .eq('email', email);

            if (updateError) {
              console.error('Error updating profile image:', updateError);
              alert('Failed to update profile image');
            } else {
              alert('Profile image updated successfully');
            }
          }
        } catch (uploadError) {
          console.error('Unexpected error during image upload:', uploadError);
          alert('Unexpected error during image upload');
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backBtn} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <View style={styles.backBtnIcon}>
                <Text style={styles.backIcon}>←</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>การตั้งค่าบัญชี</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
          {/* Enhanced Profile Section */}
          <View style={styles.profileCard}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={require('./assets/images/logo.png')}
                  style={styles.avatar}
                />
                <View style={styles.avatarBadge}>
                  <Text style={styles.avatarBadgeIcon}>✨</Text>
                </View>
              </View>
              <Text style={styles.profileName}>{slipName || 'ไม่ระบุชื่อ'}</Text>
              <TouchableOpacity
                style={styles.changePhotoBtn}
                activeOpacity={0.8}
                onPress={handleImageUpload}
              >
                <Text style={styles.changePhotoIcon}>📸</Text>
                <Text style={styles.changePhotoText}>เปลี่ยนภาพโปรไฟล์</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Personal Information Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>
              <View style={styles.sectionTitleLine} />
            </View>
            {personalInfo.map((item, index) => (
              <View key={index} style={styles.fieldContainer}>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldLeft}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.fieldIcon}>{item.icon}</Text>
                    </View>
                    <View style={styles.fieldContent}>
                      <Text style={styles.fieldLabel}>{item.label}</Text>
                      <View style={styles.inputContainer}>
                        {item.isEditable && item.label === 'ชื่อนามสกุล' ? (
                          isEditingName ? (
                            <TextInput
                              style={[styles.fieldValue, styles.editableInput]}
                              value={slipName}
                              onChangeText={setSlipName}
                              placeholder="กรุณาใส่ชื่อ-นามสกุล"
                              placeholderTextColor="#999"
                            />
                          ) : (
                            <Text style={styles.fieldValue}>{slipName || 'ไม่ระบุ'}</Text>
                          )
                        ) : item.label === 'รหัสผ่าน' ? (
                          <Text style={styles.fieldValue}>
                            {showPassword ? item.value : '••••••••'}
                          </Text>
                        ) : (
                          <Text style={styles.fieldValue}>{item.value || 'ไม่ระบุ'}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.actionContainer}>
                    {item.label === 'ชื่อนามสกุล' && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, isEditingName && styles.saveBtn]} 
                        activeOpacity={0.7} 
                        onPress={() => setIsEditingName(!isEditingName)}
                      >
                        <Text style={[styles.actionText, isEditingName && styles.saveText]}>
                          {isEditingName ? '💾' : '✏️'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {item.label === 'รหัสผ่าน' && (
                      <TouchableOpacity 
                        style={styles.actionBtn} 
                        onPress={() => setShowPassword(!showPassword)} 
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionText}>{showPassword ? '🙈' : '👁️'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {index < personalInfo.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* App Settings Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>การตั้งค่าแอป</Text>
              <View style={styles.sectionTitleLine} />
            </View>
            {appSettings.map((item, index) => (
              <View key={index} style={styles.fieldContainer}>
                <TouchableOpacity style={styles.fieldRow} activeOpacity={0.7} onPress={() => navigation.navigate('Setting2Screen')}>
                  <View style={styles.fieldLeft}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.fieldIcon}>{item.icon}</Text>
                    </View>
                    <View style={styles.fieldContent}>
                      <Text style={styles.fieldLabel}>{item.label}</Text>
                      <Text style={styles.fieldValue}>{item.value}</Text>
                    </View>
                  </View>
                  <View style={styles.actionContainer}>
                  </View>
                </TouchableOpacity>
                {index < appSettings.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Additional Options */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ตัวเลือกอื่นๆ</Text>
              <View style={styles.sectionTitleLine} />
            </View>
            <TouchableOpacity 
              style={styles.fieldRow} 
              activeOpacity={0.7} 
              onPress={() => navigation.navigate('Setting2Screen')}
            >
              <View style={styles.fieldLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.fieldIcon}>🔔</Text>
                </View>
                <Text style={styles.optionLabel}>การแจ้งเตือน</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.fieldRow} activeOpacity={0.7}
            onPress={() => navigation.navigate('Home4Screen')}>
              <View style={styles.fieldLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.fieldIcon}>❓</Text>
                </View>
                <Text style={styles.optionLabel}>ติดต่อเรา</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Enhanced Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <View style={styles.saveButtonContent}>
              <Text style={styles.saveButtonIcon}>💾</Text>
              <Text style={styles.saveButtonText}>บันทึกการเปลี่ยนแปลง</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#88bdbdff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
  },
  backBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 44,
  },
  animatedContent: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F2F5',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  avatarBadgeIcon: {
    fontSize: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  changePhotoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  changePhotoText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionTitleLine: {
    height: 3,
    backgroundColor: '#667eea',
    borderRadius: 2,
    width: 50,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  fieldIcon: {
    fontSize: 20,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flex: 1,
  },
  fieldValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  editableInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
    paddingVertical: 4,
  },
  actionContainer: {
    marginLeft: 12,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
  },
  actionText: {
    fontSize: 16,
  },
  saveText: {
    color: '#FFFFFF',
  },
  chevron: {
    fontSize: 14,
    color: '#BDC3C7',
  },
  optionLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 8,
    marginLeft: 56,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 30,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  saveButtonContent: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default SettingScreen;
