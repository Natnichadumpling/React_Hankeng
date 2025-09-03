import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const activities = [
  {
    id: 1,
    text: 'คุณเพิ่ม "Nathicha" เข้าร่วมกลุ่มบ๊วยออร์ก',
    icon: require('./assets/images/logo1.png'),
  },
  {
    id: 2,
    text: 'คุณสร้างกลุ่ม "บ๊วยออร์ก"',
    icon: require('./assets/images/logo1.png'),
  },
  {
    id: 3,
    text: 'สมศรี ติ๋ง แสดงความเห็นกับ "บ๊วยออร์ก"  🙏🏻',
    icon: require('./assets/images/logo1.png'),
  },
];

const bottomTabs = [
  { name: 'หน้าหลัก', icon: require('./assets/images/logo1.png'), active: false, navigateTo: 'Page2Screen' }, // ไปหน้า Page2Screen
  { name: 'กลุ่ม', icon: require('./assets/images/logo2.png'), active: false, navigateTo: 'Group3Screen' }, // ไปหน้า Group3Screen
  { name: 'กิจกรรม', icon: require('./assets/images/logo3.png'), active: true },
  { name: 'บัญชี', icon: require('./assets/images/logo4.png'), active: false, navigateTo: 'AccountScreen' }, // ไปหน้า AccountScreen
];

const ActivityScreen = () => {
  const navigation = useNavigation();

  const handleNavigate = (screen) => {
    navigation.navigate(screen); // นำทางไปที่หน้าจอตามที่ระบุ
  };

  return (
    <ImageBackground
      source={require('./assets/images/p1.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="ค้นหา"
              placeholderTextColor="#888"
            />
            <Image source={require('./assets/images/logo.png')} style={styles.diamondIcon} />
          </View>
        </View>

        {/* กิจกรรมล่าสุด */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>กิจกรรมล่าสุด</Text>
          {activities.map(activity => (
            <View key={activity.id} style={styles.activityRow}>
              <Image source={activity.icon} style={styles.activityIcon} />
              <Text style={styles.activityText}>{activity.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        {bottomTabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.bottomTab, tab.active && styles.bottomTabActive]}
            onPress={() => handleNavigate(tab.navigateTo)} // เรียกใช้งานการนำทาง
          >
            <Image source={tab.icon} style={styles.bottomTabIcon} />
            <Text style={[styles.bottomTabText, tab.active && styles.bottomTabTextActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  searchBarContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ededed',
    borderRadius: 20,
    width: 300,
    height: 40,
    paddingHorizontal: 16,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#888',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  diamondIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  section: {
    marginHorizontal: 24,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  activityIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
  },
  activityText: {
    fontSize: 15,
    color: '#222',
    flex: 1,
    flexWrap: 'wrap',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  bottomTabActive: {
    backgroundColor: '#e8f4f8',
    borderRadius: 16,
  },
  bottomTabIcon: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  bottomTabText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  bottomTabTextActive: {
    color: '#2c5aa0',
    fontWeight: '600',
  },
});

export default ActivityScreen;
