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
  Animated,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SettingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const fadeAnim = new Animated.Value(1);

  // State สำหรับข้อมูล
  const [userData, setUserData] = useState({
    name: 'ไม่ระบุชื่อ',
    email: 'ไม่ระบุอีเมล',
    phone: 'ไม่ระบุเบอร์โทร',
    password: ''
  });
  
  const [tempName, setTempName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    console.log('Component mounted, starting initialization...');
    initializeData();
    
    // Animation ที่นุ่มนวลขึ้น
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const initializeData = async () => {
    try {
      console.log('=== Starting data initialization ===');
      
      // หาอีเมลผู้ใช้จากแหล่งต่างๆ
      let userEmail = null;
      
      // 1. จาก route params
      if (route.params?.email) {
        userEmail = route.params.email;
        console.log('Email from route params:', userEmail);
      }
      
      // 2. จาก session
      if (!userEmail) {
        console.log('Checking session...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          userEmail = session.user.email;
          console.log('Email from session:', userEmail);
        }
      }
      
      // 3. จาก AsyncStorage
      if (!userEmail) {
        console.log('Checking AsyncStorage...');
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (storedEmail) {
          userEmail = storedEmail;
          console.log('Email from AsyncStorage:', userEmail);
        }
      }

      setCurrentUserEmail(userEmail);
      
      if (userEmail) {
        await loadUserData(userEmail);
      } else {
        console.log('No user email found, using default values');
        setUserData({
          name: 'ไม่ระบุชื่อ',
          email: 'ไม่ระบุอีเมล',
          phone: 'ไม่ระบุเบอร์โทร',
          password: ''
        });
      }
      
    } catch (error) {
      console.error('Error in initializeData:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (email) => {
    try {
      console.log('=== Loading user data for:', email, '===');
      
      const { data, error } = await supabase
        .from('users')
        .select('name, email, phone, password')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        // ถ้าไม่เจอข้อมูลในฐานข้อมูล ให้ใช้ email ที่มี
        setUserData({
          name: 'ไม่ระบุชื่อ',
          email: email,
          phone: 'ไม่ระบุเบอร์โทร',
          password: ''
        });
        return;
      }

      if (data) {
        console.log('User data loaded successfully:', data);
        setUserData({
          name: data.name || 'ไม่ระบุชื่อ',
          email: data.email || email,
          phone: data.phone || 'ไม่ระบุเบอร์โทร',
          password: data.password || ''
        });
        setTempName(data.name || '');
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    if (!currentUserEmail) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้');
      return;
    }

    try {
      console.log('Saving name:', tempName, 'for email:', currentUserEmail);
      
      const { data, error } = await supabase
        .from('users')
        .update({ name: tempName.trim() })
        .eq('email', currentUserEmail)
        .select();

      if (error) {
        console.error('Error updating name:', error);
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
        return;
      }

      console.log('Name updated successfully:', data);
      
      // อัปเดต state
      setUserData(prev => ({
        ...prev,
        name: tempName.trim()
      }));
      
      setIsEditingName(false);
      Alert.alert('สำเร็จ', 'บันทึกชื่อเรียบร้อยแล้ว');
      
    } catch (error) {
      console.error('Error in handleSaveName:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const startEditName = () => {
    setTempName(userData.name === 'ไม่ระบุชื่อ' ? '' : userData.name);
    setIsEditingName(true);
  };

  const cancelEditName = () => {
    setTempName(userData.name);
    setIsEditingName(false);
  };

  // ฟังก์ชันสำหรับนำทางไปหน้า Setting2Screen
  const navigateToSetting2 = () => {
    navigation.navigate('Setting2Screen');
  };

  // ฟังก์ชันสำหรับนำทางไปหน้า Home4Screen
  const navigateToHome4 = () => {
    navigation.navigate('Home4Screen');
  };

  // Loading screen
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - แยกออกจาก ScrollView */}
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
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
            <Text style={styles.profileName}>{userData.name}</Text>
            <View style={styles.profileEmail}>
              <Text style={styles.profileEmailText}>{userData.email}</Text>
            </View>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>
            <View style={styles.sectionTitleLine} />
          </View>
          
          {/* ชื่อ-นามสกุล */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.fieldIcon}>👤</Text>
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>ชื่อนามสกุล</Text>
                  {isEditingName ? (
                    <TextInput
                      style={styles.editInput}
                      value={tempName}
                      onChangeText={setTempName}
                      placeholder="กรุณากรอกชื่อ-นามสกุล"
                      placeholderTextColor="#999"
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleSaveName}
                    />
                  ) : (
                    <Text style={styles.fieldValue}>{userData.name}</Text>
                  )}
                </View>
              </View>
              <View style={styles.actionContainer}>
                {isEditingName ? (
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.cancelBtn]}
                      onPress={cancelEditName}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionText}>✕</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.saveBtn]}
                      onPress={handleSaveName}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.actionText, styles.saveText]}>✓</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={startEditName}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionText}>✏️</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.divider} />
          </View>
          
          {/* อีเมล */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.fieldIcon}>📧</Text>
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>ที่อยู่อีเมล</Text>
                  <Text style={[styles.fieldValue, styles.readOnlyField]}>
                    {userData.email}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
          </View>
          
          {/* เบอร์โทร */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.fieldIcon}>📱</Text>
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>หมายเลขโทรศัพท์</Text>
                  <Text style={[styles.fieldValue, styles.readOnlyField]}>
                    {userData.phone}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
          </View>
          
          {/* รหัสผ่าน */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.fieldIcon}>🔒</Text>
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>รหัสผ่าน</Text>
                  <Text style={styles.fieldValue}>
                    {showPassword ? 
                      (userData.password || 'ไม่มีรหัสผ่าน') : 
                      '••••••••'
                    }
                  </Text>
                </View>
              </View>
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionText}>
                    {showPassword ? '👁️' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>การตั้งค่าแอป</Text>
            <View style={styles.sectionTitleLine} />
          </View>
          
          {/* สกุลเงินเริ่มต้น - แสดงเฉยๆ */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLeft}>
              <View style={styles.iconContainer}>
                <Text style={styles.fieldIcon}>💰</Text>
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>สกุลเงินเริ่มต้น</Text>
                <Text style={styles.fieldValue}>THB</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* ภาษา - แสดงเฉยๆ */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLeft}>
              <View style={styles.iconContainer}>
                <Text style={styles.fieldIcon}>🌐</Text>
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>ภาษา</Text>
                <Text style={styles.fieldValue}>ภาษาไทย</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Additional Options */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ตัวเลือกอื่นๆ</Text>
            <View style={styles.sectionTitleLine} />
          </View>
          
          {/* การแจ้งเตือน - นำทางไปหน้า Setting2Screen */}
          <TouchableOpacity 
            style={styles.fieldRow} 
            activeOpacity={0.7}
            onPress={navigateToSetting2}
          >
            <View style={styles.fieldLeft}>
              <View style={styles.iconContainer}>
                <Text style={styles.fieldIcon}>🔔</Text>
              </View>
              <Text style={styles.optionLabel}>การแจ้งเตือน</Text>
            </View>
            <View style={styles.actionContainer}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          {/* ติดต่อเรา - นำทางไปหน้า Home4Screen */}
          <TouchableOpacity 
            style={styles.fieldRow} 
            activeOpacity={0.7}
            onPress={navigateToHome4}
          >
            <View style={styles.fieldLeft}>
              <View style={styles.iconContainer}>
                <Text style={styles.fieldIcon}>❓</Text>
              </View>
              <Text style={styles.optionLabel}>ติดต่อเรา</Text>
            </View>
            <View style={styles.actionContainer}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Debug Info - ซ่อนในเวอร์ชันจริง */}
        {/* Debug section ถูกลบออกแล้ว เพื่อความปลอดภัย */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#88bdbdff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '500',
  },
  headerContainer: {
    backgroundColor: '#667eea',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 1000,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 0,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
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
    marginBottom: 8,
  },
  profileEmail: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileEmailText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '500',
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
    minHeight: 60,
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
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  readOnlyField: {
    color: '#7F8C8D',
  },
  editInput: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFE',
    borderRadius: 4,
    minHeight: 40,
  },
  actionContainer: {
    marginLeft: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
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
  cancelBtn: {
    backgroundColor: '#F44336',
  },
  actionText: {
    fontSize: 16,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chevron: {
    fontSize: 20,
    color: '#BDC3C7',
    fontWeight: 'bold',
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
});

export default SettingScreen;