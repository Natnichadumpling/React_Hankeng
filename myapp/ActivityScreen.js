import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import SearchBar from './components/SearchBar'; // นำเข้า SearchBar
import ActivityList from './components/ActivityList'; // นำเข้า ActivityList
import TabBar from './components/TabBar'; // นำเข้า TabBar

const activities = [
  { id: 1, text: 'คุณเพิ่ม "Nathicha" เข้าร่วมกลุ่มบ๊วยออร์ก', icon: require('./assets/images/logo1.png') },
  { id: 2, text: 'คุณสร้างกลุ่ม "บ๊วยออร์ก"', icon: require('./assets/images/logo1.png') },
  { id: 3, text: 'สมศรี ติ๋ง แสดงความเห็นกับ "บ๊วยออร์ก"  🙏🏻', icon: require('./assets/images/logo1.png') },
];

const bottomTabs = [
  { name: 'หน้าหลัก', icon: require('./assets/images/logo1.png'), active: false, navigateTo: 'Page2Screen' },
  { name: 'กลุ่ม', icon: require('./assets/images/logo2.png'), active: false, navigateTo: 'Group3Screen' },
  { name: 'กิจกรรม', icon: require('./assets/images/logo3.png'), active: true },
  { name: 'บัญชี', icon: require('./assets/images/logo4.png'), active: false, navigateTo: 'AccountScreen' },
];

const ActivityScreen = () => {
  const [searchText, setSearchText] = useState('');

  // ฟังก์ชันกรองกิจกรรมตาม searchText
  const filteredActivities = activities.filter(activity =>
    activity.text.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ImageBackground
      source={require('./assets/images/p1.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}>
        {/* Search Bar */}
        <SearchBar searchText={searchText} setSearchText={setSearchText} onDiamondPress={() => {}} />

        {/* Activities */}
        <ActivityList activities={filteredActivities} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <TabBar bottomTabs={bottomTabs} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa', 
  },
});

export default ActivityScreen;
