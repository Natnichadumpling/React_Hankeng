import React, { useState, useEffect } from 'react';
import { Alert, TextInput } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import TabBar from './components/TabBar'; // Import TabBar

const AccountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {}; // รับค่า email จาก params

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, email')
          .eq('email', email)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          Alert.alert('Error', 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
        } else if (data) {
          setUserName(data.name);
          setUserEmail(data.email);
        }
      } catch (fetchError) {
        console.error('Unexpected error fetching user data:', fetchError);
        Alert.alert('Error', 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
    };

    fetchUserData();
  }, [email]); // เมื่อ email เปลี่ยน

  const bottomTabs = [
    { name: 'หน้าหลัก', icon: require('./assets/images/logo1.png'), active: false, navigateTo: 'Page2Screen' },
    { name: 'กลุ่ม', icon: require('./assets/images/logo2.png'), active: false, navigateTo: 'Group3Screen' },
    { name: 'กิจกรรม', icon: require('./assets/images/logo3.png'), active: false, navigateTo: 'ActivityScreen' },
    { name: 'บัญชี', icon: require('./assets/images/logo4.png'), active: true }
  ];

  const menuItems = [
    { 
      title: 'การตั้งค่าบัญชี',  // เปลี่ยนจาก "สแกน" เป็น "การตั้งค่า"
      icon: '⚙️',           // ไอคอนการตั้งค่า
      navigateTo: 'SettingScreen', // ไปที่หน้า SettingScreen
      hasArrow: true 
    },
    { 
      title: 'HarnKengPro', 
      icon: '💎',
      navigateTo: 'ProScreen',
      hasArrow: true,
      isSpecial: true
    },
    { 
      title: 'ให้คะแนน HarnKeng', 
      navigateTo: 'RateAppScreen',
      hasArrow: true 
    },
    { 
      title: 'ติดต่อเรา', 
      navigateTo: 'ContactScreen',
      navigateTo: 'Home4Screen',
      hasArrow: true 
    }
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        

        {/* Profile Section */}
        <TouchableOpacity style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require('./assets/images/logo.png')}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[ 
                styles.menuItem,
                item.isSpecial && styles.specialMenuItem,
                index === menuItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={() => {
                console.log(`Navigating to: ${item.navigateTo}`);
                if (item.navigateTo) {
                  navigation.navigate(item.navigateTo);
                } else {
                  console.log('No navigateTo property found for this menu item.');
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                {item.icon && (
                  <Text style={[styles.menuIcon, item.isSpecial && styles.specialIcon]}>
                    {item.icon}
                  </Text>
                )}
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuText, item.isSpecial && styles.specialText]}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              {item.hasArrow && <Text style={styles.arrow}>›</Text>}
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
      <TabBar bottomTabs={bottomTabs} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
    fontWeight: '300',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  specialMenuItem: {
    backgroundColor: '#f8f9ff',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  specialIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  specialText: {
    color: '#4169e1',
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#4169e1',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default AccountScreen;
