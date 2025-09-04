import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ImageBackground, Image, ScrollView, Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import TabBar from './components/TabBar'; // Import TabBar

const AccountScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch user data from supabase
  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      const nameFromMetadata = session?.user?.user_metadata?.name;

      if (!email) return;

      const { data } = await supabase
        .from('users')
        .select('name, email')
        .eq('email', email)
        .single();

      if (data?.name) {
        setUserName(data.name);
        setUserEmail(data.email || email);
      } else if (nameFromMetadata) {
        setUserName(nameFromMetadata);
        setUserEmail(email);
      } else {
        setUserName('ผู้ใช้งาน');
        setUserEmail(email);
      }
    };
    fetchUserName();
  }, []);

  const bottomTabs = [
    { name: 'หน้าหลัก', icon: require('./assets/images/logo1.png'), active: false, navigateTo: 'Page2Screen' },
    { name: 'กลุ่ม', icon: require('./assets/images/logo2.png'), active: false, navigateTo: 'Group3Screen' },
    { name: 'กิจกรรม', icon: require('./assets/images/logo3.png'), active: false, navigateTo: 'ActivityScreen' },
    { name: 'บัญชี', icon: require('./assets/images/logo4.png'), active: true }
  ];

  const menuItems = [
    { title: 'การตั้งค่า', navigateTo: 'SettingScreen' },
    { title: 'สแกน', icon: '📷' },
    { title: 'HarnKeng', icon: '💎', navigateTo: 'ProScreen' },
    { title: 'ให้คะแนน HarnKeng', navigateTo: 'RateAppScreen' },
    { title: 'ติดต่อเรา', navigateTo: 'Home4Screen' }
  ];

  return (
    <ImageBackground
      source={require('./assets/images/p1.png')}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={require('./assets/images/logo.png')}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileEmail}>{userEmail}</Text>
        </View>

        {/* Menu List */}
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                if (item.navigateTo) {
                  navigation.navigate(item.navigateTo);
                }
              }}
            >
              <Text style={styles.menuText}>
                {item.icon ? `${item.icon} ` : ''}{item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
<<<<<<< HEAD
      <TabBar bottomTabs={bottomTabs} /> {/* ส่ง bottomTabs ให้กับ TabBar */}
=======
      <View style={styles.bottomNavigation}>
        {bottomTabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.bottomTab, tab.active && styles.bottomTabActive]}
            onPress={() => {
              if (tab.navigateTo) {
                navigation.navigate(tab.navigateTo);
              }
            }}
          >
            <Image source={tab.icon} style={styles.bottomTabIcon} />
            <Text style={[styles.bottomTabText, tab.active && styles.bottomTabTextActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Image
              source={require('./assets/images/logo.png')}
              style={styles.modalLogo}
            />
            <Text style={styles.modalTitle}>ลาก่อน {userName} 👋</Text>
            <Text style={styles.modalText}>ขอบคุณที่ใช้ HarnKeng</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowLogoutModal(false);
                navigation.navigate('LoginScreen');
              }}
            >
              <Text style={styles.modalButtonText}>ตกลง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
>>>>>>> e9eebbfd293c55eba64136db2e997d6a12c64965
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },

  menuList: { marginBottom: 40 },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  menuText: { fontSize: 15, color: '#333' },

  logoutButton: {
    alignSelf: 'center',
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  logoutText: { fontSize: 14, color: '#333' },

  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
  },
  bottomTab: { flex: 1, alignItems: 'center', paddingVertical: 5 },
  bottomTabActive: { backgroundColor: '#e8f4f8', borderRadius: 10 },
  bottomTabIcon: { width: 30, height: 30, resizeMode: 'contain' },
  bottomTabText: { fontSize: 12, color: '#666' },
  bottomTabTextActive: { color: '#2c5aa0', fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    elevation: 10,
  },
  modalLogo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#2c5aa0',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountScreen;