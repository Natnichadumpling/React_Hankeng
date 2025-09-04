import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ImageBackground, Image
} from 'react-native';
import { supabase } from './supabaseClient';
import { useNavigation } from '@react-navigation/native';
import TabBar from './components/TabBar'; // Import TabBar
import SearchBar from './components/SearchBar'; // Import SearchBar

const Page2Screen = ({ route }) => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const email = route?.params?.email || '';
    const fetchUserName = async () => {
      if (!email) return;
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('email', email)
        .single();
      if (data && data.name) setUserName(data.name);
    };
    fetchUserName();
  }, [route]);

  const activities = [
    { id: 1, title: 'คุณเพิ่ม "Nathicha" เข้าร่วมกลุ่มข้อมูล', avatar: '👤', time: '2 ชั่วโมงที่แล้ว' },
    { id: 2, title: 'คุณลบกลุ่ม "ญี่ปุ่น"', avatar: '👤', time: '5 ชั่วโมงที่แล้ว' },
    { id: 3, title: 'คุณสร้างกลุ่ม "ญี่ปุ่น"', avatar: '👤', time: '1 วันที่แล้ว' }
  ];

  const bottomTabs = [
    { name: 'หน้าหลัก', icon: require('./assets/images/logo1.png'), active: true, navigateTo: 'Page2Screen' },
    { name: 'กลุ่ม', icon: require('./assets/images/logo2.png'), active: false, navigateTo: 'Group3Screen' },
    { name: 'กิจกรรม', icon: require('./assets/images/logo3.png'), active: false, navigateTo: 'ActivityScreen' },
    { name: 'บัญชี', icon: require('./assets/images/logo4.png'), active: false, navigateTo: 'AccountScreen' }
  ];

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={require('./assets/images/p1.png')}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>สวัสดี !</Text>
              <Text style={styles.nameText}>{userName || '...'}</Text>
            </View>

            {/* Profile Icon */}
            <View style={styles.profileIcon}>
              <Image source={require('./assets/images/logo.png')} style={styles.profileEmoji} />
            </View>

            {/* Settings Icon */}
            <TouchableOpacity style={styles.settingsIcon} onPress={() => navigation.navigate('Setting2Screen')}>
              <Text>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="ค้นหา"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity onPress={() => navigation.navigate('ProScreen')}>
              <Text style={styles.diamondIcon}>💎</Text>
            </TouchableOpacity>
          </View>

          {/* Main Card */}
          <View style={styles.mainCard}>
            <View style={styles.cardHeader}>
              <TouchableOpacity style={styles.statusButton} onPress={() => navigation.navigate('GroupScreen')}>
                <Text style={styles.statusText}>+ เพิ่มกลุ่ม</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.cityImageContainer}>
                <View style={styles.cityImagePlaceholder}>
                  <Image source={require('./assets/images/jp.png')} style={styles.cityImage} />
                </View>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>สมาชิก</Text>
                <View style={styles.socialIcons}>
                  <TouchableOpacity style={styles.socialIcon}><Text>👤</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}><Text>👤</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}><Text>👤</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}><Text>👤</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Activity Section */}
          <View style={styles.activitySection}>
            <Text style={styles.activityTitle}>กิจกรรมล่าสุด</Text>
            {filteredActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityAvatar}>
                  <Image source={require('./assets/images/logo1.png')} style={styles.activityAvatarImage} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* เพิ่ม margin bottom เพื่อให้ content ไม่ทับ TabBar */}
          <View style={styles.bottomMargin} />
        </ScrollView>
      </ImageBackground>
      
      {/* TabBar component */}
      <TabBar bottomTabs={bottomTabs} navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f0f2f5' 
  },
  scrollContent: {
    flex: 1,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: 'transparent',
    paddingTop: 50, // เพิ่ม padding top เพื่อหลีกเลี่ย status bar
  },
  welcomeText: { fontSize: 18, color: '#666' },
  nameText: { fontSize: 24, fontWeight: 'bold', color: '#2c5aa0' },
  profileIcon: { 
    position: 'absolute', 
    right: 60, 
    marginTop: 30, // เพิ่ม marginTop เพื่อขยับลง
  },
  profileEmoji: { 
    width: 40, 
    height: 40, 
    resizeMode: 'contain' 
  },
  settingsIcon: { padding: 5 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#e8eaf0', 
    borderRadius: 25, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    marginBottom: 20,
    marginHorizontal: 20,
  },
  searchIcon: { marginRight: 10, fontSize: 16 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  diamondIcon: { fontSize: 16, color: '#4a90e2' },
  mainCard: { backgroundColor: '#e8f4f8', marginHorizontal: 20, borderRadius: 20, padding: 15, marginBottom: 20 },
  cardHeader: { alignItems: 'flex-end', marginBottom: 15 },
  statusButton: { backgroundColor: '#7dd3fc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  statusText: { fontSize: 12, color: '#0369a1', fontWeight: '500' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  cityImageContainer: { flex: 1 },
  cityImagePlaceholder: { width: 120, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  cityImage: { width: '100%', height: '100%', resizeMode: 'contain', borderRadius: 15 },
  userInfo: { flex: 1, alignItems: 'center', marginLeft: 20 },
  userName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  socialIcons: { flexDirection: 'row', justifyContent: 'space-between', width: 80 },
  socialIcon: { width: 30, height: 30, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  activitySection: { backgroundColor: '#e8f4f8', marginHorizontal: 20, borderRadius: 20, padding: 15 },
  activityTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 15 },
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  activityAvatar: { width: 40, height: 40, backgroundColor: '#2c5aa0', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityAvatarImage: { width: 30, height: 30, borderRadius: 15 },
  activityContent: { flex: 1 },
  activityText: { fontSize: 14, color: '#333', lineHeight: 20 },
  activityTime: { fontSize: 12, color: '#666', marginTop: 2 },
  bottomMargin: {
    height: 80, // เพิ่ม space เพื่อให้ TabBar ไม่ทับ content
  }
});

export default Page2Screen;
