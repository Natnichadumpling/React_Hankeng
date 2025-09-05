import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import TabBar from './components/TabBar'; // Import TabBar

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
    { title: 'ติดต่อเรา', navigateTo: 'Home4Screen' }
  ];

  const handleLogout = () => {
    Alert.alert(
      'ยืนยันการออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ออกจากระบบ', style: 'destructive', onPress: () => navigation.navigate('LoginScreen') }
      ]
    );
  };

  return (
    <ImageBackground
      source={require('./assets/images/p1.png')}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require('./assets/images/logo.png')}
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
                  navigation.navigate(item.navigateTo);
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
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomSpacing} />
      <TabBar bottomTabs={bottomTabs} navigation={navigation} />
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
    justifyContent: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
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

  bottomSpacing: { height: 80 },
});

export default AccountScreen;
