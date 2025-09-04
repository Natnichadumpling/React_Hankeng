import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, ImageBackground, StyleSheet } from 'react-native';
import { supabase } from './supabaseClient';
import { useNavigation } from '@react-navigation/native';
import Header from './components/Header';
import ActivityList from './components/ActivityList'; // นำเข้า ActivityList
import TabBar from './components/TabBar'; // นำเข้า TabBar
import SearchBar from './components/SearchBar'; // นำเข้า SearchBar

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
    { id: 1, title: 'คุณเพิ่ม "Natricha" เข้าร่วมกลุ่มข้อมูล', time: '2 ชั่วโมงที่แล้ว' },
    { id: 2, title: 'คุณลบกลุ่ม "ญี่ปุ่น"', time: '5 ชั่วโมงที่แล้ว' },
    { id: 3, title: 'คุณสร้างกลุ่ม "ญี่ปุ่น"', time: '1 วันที่แล้ว' }
  ];

  const bottomTabs = [
    { name: 'หน้าหลัก', icon: require('./assets/images/logo1.png'), active: false, navigateTo: 'Page2Screen' },
    { name: 'กลุ่ม', icon: require('./assets/images/logo2.png'), active: false, navigateTo: 'Group3Screen' },
    { name: 'กิจกรรม', icon: require('./assets/images/logo3.png'), active: false, navigateTo: 'ActivityScreen' },
    { name: 'บัญชี', icon: require('./assets/images/logo4.png'), active: true }
  ];

  // ฟังก์ชันค้นหา (หากต้องการกรองกิจกรรม)
  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ImageBackground source={require('./assets/images/p1.png')} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header userName={userName} />

        {/* Search Bar */}
        <SearchBar searchText={searchText} setSearchText={setSearchText} onDiamondPress={() => {}} />

        {/* Activity List */}
        <ActivityList activities={filteredActivities} /> {/* ใช้กิจกรรมที่กรองแล้ว */}

      </ScrollView>

      {/* Bottom Tab Bar */}
      <TabBar bottomTabs={bottomTabs} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#e8eaf0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});

export default Page2Screen;
