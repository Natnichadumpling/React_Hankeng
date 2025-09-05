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
    { title: 'การตั้งค่า', icon: '⚙️' , navigateTo: 'SettingScreen' },
    { title: 'HarnKeng', icon: '💎', navigateTo: 'ProScreen' },
    { title: 'ให้คะแนน', icon: '⭐', navigateTo: 'RateAppScreen' },
    { title: 'ติดต่อเรา', icon: '📞', navigateTo: 'Home4Screen' }
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
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageWrap}>
            <Image
              source={require('./assets/images/logo.png')}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.profileInfoWrap}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
            {/* เพิ่มการแสดงชื่อจริง (name) จากฐานข้อมูล ถ้ามี */}
            {userName && (
              <Text style={styles.profileRealName}>ชื่อ: {userName}</Text>
            )}
          </View>
        </View>

        {/* Menu Card */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                console.log(`Navigating to: ${item.navigateTo}`); // Debugging log
                if (item.navigateTo) {
                  navigation.navigate(item.navigateTo);
                } else {
                  console.log('No navigateTo property found for this menu item.');
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuText}>{item.icon ? `${item.icon} ` : ''}{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  profileImageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  profileImage: { width: 70, height: 70, borderRadius: 35 },
  profileInfoWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: { fontSize: 20, fontWeight: '700', color: '#2c5aa0', marginBottom: 4 },
  profileRealName: { fontSize: 15, color: '#444', marginTop: 2 },
  profileEmail: { fontSize: 14, color: '#666' },

  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 10,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: { fontSize: 16, color: '#222', fontWeight: '500' },
  menuSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },

  logoutButton: {
    alignSelf: 'center',
    backgroundColor: '#2c5aa0',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 24,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },

  bottomSpacing: { height: 80 },
});

export default AccountScreen;
