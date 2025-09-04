import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';

const AccountScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      if (!email) return;
      const { data, error } = await supabase
        .from('users')
        .select('name, email')
        .eq('email', email)
        .single();
      if (data) {
        setUserName(data.name || email);
        setUserEmail(data.email || email);
      } else {
        setUserName(email);
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
    { title: 'การตั้งค่า', subtitle: 'Sopitnapa\nfilm0936123963@gmail.com', navigateTo: 'SettingScreen' },
    { title: 'สแกน', icon: '📷' },
    { title: 'HarnKeng', icon: '💎', navigateTo: 'ProScreen' },
    { title: 'ติดต่อเรา' }
  ];

  return (
    <ImageBackground
      source={require('./assets/images/p1.png')} // พื้นหลัง
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require('./assets/images/logo.png')} // ใส่รูปโปรไฟล์จริง
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{userName}</Text>
          </View>
          <View>
            <Text style={styles.profileEmail}>{userEmail}</Text>
          </View>
        </View>

        {/* Menu List */}
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                if (item.navigateTo) {
                  navigation.navigate(item.navigateTo); // นำทางไปที่หน้า SettingScreen หรือ ProScreen
                }
              }}
            >
              <Text style={styles.menuText}>{item.icon ? `${item.icon} ` : ''}{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => navigation.navigate('LoginScreen')} // นำทางไปที่หน้า LoginScreen
        >
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {bottomTabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.bottomTab, tab.active && styles.bottomTabActive]}
            onPress={() => {
              if (tab.navigateTo) {
                navigation.navigate(tab.navigateTo); // นำทางไปที่หน้า Page2Screen หรือ ActivityScreen
              }
            }}
          >
            <Image source={tab.icon} style={styles.bottomTabIcon} />
            <Text style={[styles.bottomTabText, tab.active && styles.bottomTabTextActive]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',  // ทำให้ตำแหน่งเป็นกลาง
  },
  profileImageContainer: {
    alignItems: 'center',  // ทำให้รูปโปรไฟล์อยู่กลาง
    justifyContent: 'center',
  },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  profileName: { fontSize: 16, fontWeight: '600' },
  profileEmail: { fontSize: 13, color: '#666' },

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
});

export default AccountScreen;
